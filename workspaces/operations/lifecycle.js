/* ============================================================
   VIGIL — workspaces/operations/lifecycle.js
   Operation state machine — 8 states, minute-based timing.
   DETECTED → ANALYSIS → OPTIONS_PRESENTED → APPROVED →
   ASSETS_IN_TRANSIT → EXECUTING → RESOLVED → DEBRIEF
   ============================================================ */

(function() {

  // --- Minute-based tick ---

  hook('tick', function(data) {
    if (!V.operations || V.operations.length === 0) return;
    var now = V.time.totalMinutes;

    for (var i = 0; i < V.operations.length; i++) {
      var op = V.operations[i];

      switch (op.status) {
        case 'DETECTED':
          if (now >= op.nextTransitionAt) {
            transitionToAnalysis(op);
          }
          break;

        case 'ANALYSIS':
          if (now >= op.nextTransitionAt) {
            transitionToOptions(op);
          }
          break;

        case 'OPTIONS_PRESENTED':
          // Waiting for player — check expiry
          if (op.expiresAt && now >= op.expiresAt) {
            expireOperation(op);
          }
          break;

        case 'APPROVED':
          // Immediate transition to transit
          transitionToTransit(op);
          break;

        case 'ASSETS_IN_TRANSIT':
          // Check if all assets have arrived
          if (allAssetsArrived(op)) {
            transitionToExecuting(op);
          }
          break;

        case 'EXECUTING':
          if (now >= op.nextTransitionAt) {
            resolveOperation(op);
          }
          break;
      }
    }
  }, 8); // After asset transit tick (priority 5)

  // --- State Transitions ---

  function transitionToAnalysis(op) {
    op.status = 'ANALYSIS';
    var analysisMinutes = randInt(8, 12); // Vigil processes fast — ~10 game-minutes
    op.nextTransitionAt = V.time.totalMinutes + analysisMinutes;
    op.phaseDuration = analysisMinutes;

    addLog('OP ' + op.codename + ': Vigil analysis initiated.', 'log-info');
  }

  function transitionToOptions(op) {
    // Generate Vigil's recommendations
    var options = generateVigilOptions(op);

    if (options.length === 0) {
      // No assets available — auto-expire
      addLog('OP ' + op.codename + ': No assets available. Operation cannot proceed.', 'log-warn');
      expireOperation(op);
      return;
    }

    // Check if all options are unreachable
    var allUnreachable = true;
    var opDeadlineMinutes = op.urgencyHours * 60;
    for (var o = 0; o < options.length; o++) {
      if (options[o].transitTimeMinutes <= opDeadlineMinutes) {
        allUnreachable = false;
        break;
      }
    }

    if (allUnreachable) {
      addLog('OP ' + op.codename + ': All deployment options exceed operational window. Auto-failing.', 'log-warn');
      op.status = 'FAILURE';
      V.playStats.opsFailed++;
      V.playStats.opsCompleted++;
      V.resources.viability = clamp(V.resources.viability - randInt(1, 3), 0, 100);

      if (op.assignedAssetIds && op.assignedAssetIds.length > 0) {
        returnAssetsToBase(op.assignedAssetIds);
      }

      // Mark linked threat
      if (op.relatedThreatId) {
        var linkedThreat = getThreat(op.relatedThreatId);
        if (linkedThreat) {
          linkedThreat.phase = 'MANIFESTED';
          linkedThreat.status = 'FAILED';
        }
      }

      pushFeedItem({
        id: uid('FI'),
        type: 'OPERATION',
        severity: 'HIGH',
        header: 'OPERATION FAILED: ' + op.codename + ' (UNREACHABLE)',
        body: 'Operation ' + op.codename + ' has been automatically failed — no deployment option could reach ' +
          op.location.city + ', ' + op.location.country + ' within the operational window of ' + op.urgencyHours + ' hours.',
        timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
        read: false,
        opId: op.id,
        geo: op.geo,
      });

      fire('operation:resolved', { operation: op });
      return;
    }

    op.status = 'OPTIONS_PRESENTED';
    op.options = options;
    op.expiresAt = V.time.totalMinutes + (op.urgencyHours * 60);

    addLog('OP ' + op.codename + ': Vigil presents ' + options.length + ' deployment options.', 'log-info');

    // Feed item
    pushFeedItem({
      id: uid('FI'),
      type: 'OPERATION',
      severity: 'HIGH',
      header: 'AWAITING APPROVAL: ' + op.codename,
      body: 'Vigil has completed analysis of Operation ' + op.codename + ' (' + op.location.city + ', ' + op.location.country + '). ' + options.length + ' deployment options are ready for operator review.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
      geo: op.geo,
    });
  }

  function transitionToTransit(op) {
    if (!op.options || op.selectedOptionIdx === undefined) return;
    var option = op.options[op.selectedOptionIdx];
    if (!option) return;

    // Filter to only assets that are actually still available (STATIONED)
    var availableIds = [];
    for (var av = 0; av < option.assetIds.length; av++) {
      var checkAsset = getAsset(option.assetIds[av]);
      if (checkAsset && checkAsset.status === 'STATIONED') {
        availableIds.push(option.assetIds[av]);
      }
    }

    if (availableIds.length === 0) {
      // All assets were reassigned — force re-analysis
      op.status = 'ANALYSIS';
      op.options = [];
      op.selectedOptionIdx = undefined;
      addLog('OP ' + op.codename + ': All assigned assets unavailable. Vigil re-analyzing options.', 'log-warn');
      return;
    }

    // Deploy only available assets
    deployAssets(availableIds, op.geo.lat, op.geo.lon, op.id);
    op.assignedAssetIds = availableIds;
    op.transitStartTotalMinutes = V.time.totalMinutes;
    // Recalculate transit based on actually deployed assets
    op.transitDurationMinutes = calcGroupTransitMinutes(availableIds, op.geo.lat, op.geo.lon);

    op.status = 'ASSETS_IN_TRANSIT';

    // Fire per-asset deployed events (used by domestic Posse Comitatus system)
    for (var da = 0; da < availableIds.length; da++) {
      var deployedAsset = getAsset(availableIds[da]);
      if (deployedAsset) {
        fire('operation:asset:deployed', { operation: op, asset: deployedAsset });
      }
    }

    if (availableIds.length < option.assetIds.length) {
      var lost = option.assetIds.length - availableIds.length;
      addLog('OP ' + op.codename + ': ' + lost + ' asset(s) no longer available. Proceeding with ' + availableIds.length + ' asset(s). Transit: ' + formatTransitTime(op.transitDurationMinutes) + '.', 'log-warn');
    } else {
      addLog('OP ' + op.codename + ': Assets deploying. Transit: ' + formatTransitTime(op.transitDurationMinutes) + '.', 'log-op');
    }
  }

  function transitionToExecuting(op) {
    op.status = 'EXECUTING';
    var opType = getOperationType(op.operationType);
    var execHours = opType ? randInt(opType.execHoursRange[0], opType.execHoursRange[1]) : randInt(4, 12);
    op.execDurationMinutes = execHours * 60;
    op.nextTransitionAt = V.time.totalMinutes + op.execDurationMinutes;

    addLog('OP ' + op.codename + ': All assets on station. Execution phase begun.', 'log-op');
  }

  function resolveOperation(op) {
    var opType = getOperationType(op.operationType);
    var option = op.options && op.options[op.selectedOptionIdx];

    // Calculate success probability
    var prob = option ? option.confidencePercent : (opType ? opType.baseSuccessRate : 50);

    // Roll for success
    var roll = Math.random() * 100;
    var success = roll < prob;

    if (success) {
      op.status = 'SUCCESS';
      V.playStats.opsSucceeded++;
    } else {
      op.status = 'FAILURE';
      V.playStats.opsFailed++;
    }
    V.playStats.opsCompleted++;

    // Apply viability impact
    var viabilityDelta = assessOptionOutcome(op, success);

    // Intel gain on success
    var intelGain = 0;
    if (success) {
      intelGain = randInt(5, 15);
      V.resources.intel += intelGain;
    }

    // Store impact data for debrief
    op.viabilityDelta = viabilityDelta;
    op.intelGain = intelGain;

    // Generate debrief
    if (typeof generateDebrief === 'function') {
      op.debrief = generateDebrief(op, success);
    }

    // Return assets to base
    if (op.assignedAssetIds && op.assignedAssetIds.length > 0) {
      returnAssetsToBase(op.assignedAssetIds);
    }

    // Log
    var outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
    addLog('OP ' + op.codename + ' ' + outcomeLabel + '. Viability ' + (viabilityDelta >= 0 ? '+' : '') + viabilityDelta + '.', success ? 'log-success' : 'log-fail');

    // Feed item
    pushFeedItem({
      id: uid('FI'),
      type: 'OPERATION',
      severity: success ? 'ROUTINE' : 'HIGH',
      header: 'OPERATION ' + outcomeLabel + ': ' + op.codename,
      body: 'Operation ' + op.codename + ' has ' + (success ? 'achieved its objectives' : 'failed to achieve its objectives') + ' in ' + op.location.city + ', ' + op.location.country + '. ' +
        'Viability impact: ' + (viabilityDelta >= 0 ? '+' : '') + viabilityDelta + '%. ' +
        (op.deviatedFromVigil ? 'NOTE: Operator deviated from Vigil recommendation.' : 'Vigil recommendation was followed.'),
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
      geo: op.geo,
    });

    // Theater risk impact
    op.theaterRiskDelta = 0;
    if (op.location && op.location.theaterId && V.theaters[op.location.theaterId]) {
      var riskBefore = V.theaters[op.location.theaterId].risk;
      if (success) {
        V.theaters[op.location.theaterId].risk = clamp(V.theaters[op.location.theaterId].risk - 0.3, 1, 5);
      } else {
        V.theaters[op.location.theaterId].risk = clamp(V.theaters[op.location.theaterId].risk + 0.5, 1, 5);
      }
      op.theaterRiskDelta = Math.round((V.theaters[op.location.theaterId].risk - riskBefore) * 10) / 10;
    }

    // Mark linked threat as resolved
    op.diplomaticImpacts = [];
    if (op.relatedThreatId) {
      var threat = getThreat(op.relatedThreatId);
      if (threat) {
        threat.phase = success ? 'RESOLVED' : 'MANIFESTED';
        threat.status = success ? 'NEUTRALIZED' : 'FAILED';
        if (success) {
          V.playStats.threatsNeutralized = (V.playStats.threatsNeutralized || 0) + 1;

          // Diplomatic goodwill: neutralizing a disclosed threat earns bonus with the warned country
          if (threat.foreignTarget && threat.foreignTarget.disclosed && threat.foreignTarget.country) {
            var ftCountry = threat.foreignTarget.country;
            if (V.diplomacy[ftCountry]) {
              shiftStance(ftCountry, 2);
              op.diplomaticImpacts.push({ country: ftCountry, delta: 2, reason: 'Threat neutralization goodwill' });
              addLog('DIPLOMACY: ' + ftCountry + ' grateful for neutralizing ' + threat.orgName + '. Stance +2.', 'log-info');
              pushFeedItem({
                id: uid('FI'),
                type: 'DIPLOMATIC',
                severity: 'ROUTINE',
                header: 'DIPLOMATIC GOODWILL: ' + ftCountry.toUpperCase(),
                body: ftCountry + ' has acknowledged the neutralization of ' + threat.orgName +
                  ', a threat previously disclosed through intelligence sharing. Relations have improved.',
                timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
                read: false,
              });
            }
          }
        }
      }
    }

    fire('operation:resolved', { operation: op });
  }

  function expireOperation(op) {
    op.status = 'EXPIRED';
    var viabilityLoss = randInt(1, 3);
    V.resources.viability = clamp(V.resources.viability - viabilityLoss, 0, 100);

    // Store impact data for debrief
    op.viabilityDelta = -viabilityLoss;
    op.intelGain = 0;
    op.theaterRiskDelta = 0;
    op.diplomaticImpacts = [];
    op.expired = true;

    // Theater risk increases on expired ops
    if (op.location && op.location.theaterId && V.theaters[op.location.theaterId]) {
      var riskBefore = V.theaters[op.location.theaterId].risk;
      V.theaters[op.location.theaterId].risk = clamp(V.theaters[op.location.theaterId].risk + 0.3, 1, 5);
      op.theaterRiskDelta = Math.round((V.theaters[op.location.theaterId].risk - riskBefore) * 10) / 10;
    }

    // Generate debrief for expired op
    if (typeof generateDebrief === 'function') {
      op.debrief = generateDebrief(op, false);
    }

    addLog('OP ' + op.codename + ' EXPIRED — operational window closed. Viability -' + viabilityLoss + '.', 'log-warn');

    pushFeedItem({
      id: uid('FI'),
      type: 'OPERATION',
      severity: 'ELEVATED',
      header: 'OPERATION EXPIRED: ' + op.codename,
      body: 'Operation ' + op.codename + ' has expired. The operational window in ' + op.location.city + ', ' + op.location.country + ' has closed without action. Viability impact: -' + viabilityLoss + '%.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
      geo: op.geo,
    });
  }

  // --- Helper: check if all assigned assets have arrived ---

  function allAssetsArrived(op) {
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return true;
    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;
      if (asset.status === 'IN_TRANSIT') return false;
    }
    return true;
  }

  // --- Player Action: Approve Option ---

  window.approveOption = function(opId, optionIdx) {
    var op = getOp(opId);
    if (!op || op.status !== 'OPTIONS_PRESENTED') return;
    if (!op.options || !op.options[optionIdx]) return;

    op.selectedOptionIdx = optionIdx;
    op.deviatedFromVigil = (optionIdx !== op.vigilRecommendedIdx);
    op.status = 'APPROVED';

    // Build fillVars for debrief system
    var option = op.options[optionIdx];
    var assets = getAssetsByIds(option.assetIds);
    op.fillVars = buildOpFillVars(op, assets);

    addLog('OP ' + op.codename + ': Option "' + option.label + '" approved.' + (op.deviatedFromVigil ? ' (DEVIATED FROM VIGIL)' : ''), 'log-decision');
  };

  // --- Player Action: Cancel Operation ---

  window.cancelOperation = function(opId) {
    var op = getOp(opId);
    if (!op) return;
    if (op.status === 'EXECUTING' || op.status === 'ASSETS_IN_TRANSIT') return; // Can't cancel in-flight

    op.status = 'ARCHIVED';
    V.resources.viability = clamp(V.resources.viability - 1, 0, 100);
    addLog('OP ' + op.codename + ' cancelled by operator.', 'log-info');
  };

  // --- Build Fill Variables for Debrief Parametrization ---

  window.buildOpFillVars = function(op, assets) {
    var assetNames = assets.map(function(a) { return a.name; });
    var baseNames = [];
    var baseIds = {};
    for (var i = 0; i < assets.length; i++) {
      var baseId = assets[i].currentBaseId || assets[i].homeBaseId;
      if (baseId && !baseIds[baseId]) {
        baseIds[baseId] = true;
        var base = getBase(baseId);
        if (base) baseNames.push(base.name);
      }
    }

    var option = op.options[op.selectedOptionIdx];
    var transitStr = option ? formatTransitTime(option.transitTimeMinutes) : '?';

    return {
      city: op.location.city,
      country: op.location.country,
      theater: op.location.theater ? op.location.theater.name : '?',
      theaterShort: op.location.theater ? op.location.theater.shortName : '?',
      orgName: op.orgName || 'unknown threat organization',
      codename: op.codename,
      targetAlias: op.targetAlias || generatePersonnelAlias(),
      assetNames: assetNames,
      baseNames: baseNames,
      assetNamesStr: assetNames.join(', '),
      baseNamesStr: baseNames.join(', '),
      transitTimeStr: transitStr,
      threatLevel: String(op.threatLevel),
      operationType: op.operationType,
      primaryAsset: assetNames[0] || 'deployed forces',
      primaryBase: baseNames[0] || 'forward operating base',
    };
  };

})();
