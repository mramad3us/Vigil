/* ============================================================
   VIGIL — workspaces/operations/operations.js
   Operations board workspace: card grid, Vigil option cards,
   progressive intel, asset detail dropdowns, transit progress,
   debrief display, ops archive.
   ============================================================ */

(function() {

  var _selectedOpId = null;
  var _showArchive = false;
  var _expandedAssets = {}; // track which asset rows are expanded in option cards
  var _customConfig = null; // { opId, baseOptionIdx, assetIds: [...] }
  var _customFilter = 'ALL'; // 'ALL', 'SANCTIONED', 'COVERT'

  registerWorkspace({
    id: 'operations',
    label: 'Operations',
    icon: '⬡',

    init: function() {
      var container = $('ws-operations');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:320px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">OPERATIONS BOARD</span>' +
              '<span class="ws-list-count" id="ops-count"></span>' +
            '</div>' +
            '<div class="ws-list-body" id="ops-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="ops-detail">' +
              '<div class="ws-detail-empty">Select an operation to view details</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      // Preserve scroll position across re-renders
      var detailEl = $('ops-detail');
      var savedScroll = detailEl ? detailEl.scrollTop : 0;

      renderOpsList();
      if (_selectedOpId) renderOpsDetail(_selectedOpId);

      // Restore scroll position
      detailEl = $('ops-detail');
      if (detailEl && savedScroll > 0) detailEl.scrollTop = savedScroll;
    },
  });

  // --- Status Labels ---

  var STATUS_LABELS = {
    DETECTED: 'DETECTED',
    ANALYSIS: 'ANALYZING',
    OPTIONS_PRESENTED: 'AWAITING APPROVAL',
    APPROVED: 'APPROVED',
    ASSETS_IN_TRANSIT: 'ASSETS IN TRANSIT',
    EXECUTING: 'EXECUTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    ARCHIVED: 'CANCELLED',
  };

  var STATUS_CSS = {
    DETECTED: 'detected',
    ANALYSIS: 'analysis',
    OPTIONS_PRESENTED: 'options',
    APPROVED: 'approved',
    ASSETS_IN_TRANSIT: 'transit',
    EXECUTING: 'executing',
    SUCCESS: 'success',
    FAILURE: 'failure',
    ARCHIVED: 'failure',
  };

  // Difficulty color coding
  var DIFF_COLORS = {
    EASY: 'var(--green)',
    MEDIUM: 'var(--amber)',
    HARD: 'var(--severity-high)',
    VERY_HARD: 'var(--red)',
  };

  // --- Operations List ---

  function renderOpsList() {
    var listEl = $('ops-list');
    var countEl = $('ops-count');
    if (!listEl) return;

    var activeOps = V.operations.filter(function(op) {
      return op.status !== 'ARCHIVED' && op.status !== 'EXPIRED' && op.status !== 'SUCCESS' && op.status !== 'FAILURE';
    });

    var completedOps = V.operations.filter(function(op) {
      return op.status === 'SUCCESS' || op.status === 'FAILURE' || op.status === 'ARCHIVED';
    });

    if (countEl) countEl.textContent = activeOps.length + ' active';

    var html = '';

    // Active ops
    html += '<div class="ops-grid">';
    for (var i = 0; i < activeOps.length; i++) {
      html += renderOpCard(activeOps[i]);
    }
    html += '</div>';

    if (activeOps.length === 0) {
      html = '<div class="ws-detail-empty" style="height:120px">No active operations</div>';
    }

    // Completed ops (last up to 10)
    if (completedOps.length > 0) {
      html += '<div class="ops-archive-header" onclick="toggleOpsArchive()">' +
        '<span class="ops-archive-toggle">' + (_showArchive ? '▾' : '▸') + '</span>' +
        '<span class="ops-archive-title">ARCHIVE</span>' +
        '<span class="ops-archive-count">' + completedOps.length + '</span>' +
      '</div>';

      if (_showArchive) {
        var archiveOps = completedOps.slice(0, 10);
        html += '<div class="ops-grid ops-archive-grid">';
        for (var j = 0; j < archiveOps.length; j++) {
          html += renderOpCard(archiveOps[j]);
        }
        html += '</div>';
      }
    }

    listEl.innerHTML = html;
  }

  function renderOpCard(op) {
    var statusCls = STATUS_CSS[op.status] || op.status.toLowerCase();
    var selectedCls = op.id === _selectedOpId ? ' selected' : '';
    var statusLabel = STATUS_LABELS[op.status] || op.status;

    // Timer display
    var timerHtml = '';
    if (op.status === 'OPTIONS_PRESENTED' && op.expiresAt) {
      var minutesLeft = Math.max(0, op.expiresAt - V.time.totalMinutes);
      var hoursLeft = Math.round(minutesLeft / 60);
      var urgentCls = hoursLeft <= 6 ? ' urgent' : '';
      timerHtml = '<div class="op-timer' + urgentCls + '">' + hoursLeft + 'h left</div>';
    } else if (op.status === 'ASSETS_IN_TRANSIT' && op.transitDurationMinutes > 0) {
      var elapsed = V.time.totalMinutes - op.transitStartTotalMinutes;
      var pct = Math.min(100, Math.round((elapsed / op.transitDurationMinutes) * 100));
      timerHtml = '<div class="op-timer">' + pct + '% transit</div>';
    } else if (op.status === 'EXECUTING' && op.nextTransitionAt) {
      var execLeft = Math.max(0, op.nextTransitionAt - V.time.totalMinutes);
      timerHtml = '<div class="op-timer">' + formatTransitTime(execLeft) + ' exec</div>';
    } else if (op.status === 'ANALYSIS' && op.nextTransitionAt) {
      var anlsLeft = Math.max(0, op.nextTransitionAt - V.time.totalMinutes);
      timerHtml = '<div class="op-timer">' + formatTransitTime(anlsLeft) + '</div>';
    }

    // Threat pips
    var pipsHtml = '<div class="op-threat-level">';
    for (var p = 1; p <= 5; p++) {
      var filledCls = p <= op.threatLevel ? ' filled' : '';
      var highCls = op.threatLevel >= 4 && p <= op.threatLevel ? ' high' : '';
      pipsHtml += '<div class="op-threat-pip' + filledCls + highCls + '"></div>';
    }
    pipsHtml += '</div>';

    return '<div class="op-card' + selectedCls + '" onclick="selectOperation(\'' + op.id + '\')"' +
      ' data-tip="' + escTip(op.label + ' · ' + (op.location ? op.location.city + ', ' + op.location.country : '?') + ' · Threat ' + op.threatLevel + '/5') + '"' +
      ' data-tip-align="right">' +
      '<div class="op-status-dot ' + statusCls + '"></div>' +
      '<div class="op-card-content">' +
        '<div class="op-card-codename">' + op.codename +
          (op.domestic ? ' <span style="background:#d4a04a;color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;letter-spacing:0.5px;vertical-align:middle;margin-left:6px">DOMESTIC</span>' : '') +
        '</div>' +
        '<div class="op-card-label">' + op.label + ' · ' + (op.location ? op.location.city : '?') + '</div>' +
      '</div>' +
      '<div class="op-card-right">' +
        '<div class="op-status-chip ' + statusCls + '" data-tip="' + escTip(TIPS.opStatus[op.status] || '') + '">' + statusLabel + '</div>' +
        timerHtml +
        pipsHtml +
      '</div>' +
    '</div>';
  }

  // --- Operations Detail ---

  function renderOpsDetail(opId) {
    var detailEl = $('ops-detail');
    if (!detailEl) return;

    var op = getOp(opId);
    if (!op) {
      detailEl.innerHTML = '<div class="ws-detail-empty">Select an operation to view details</div>';
      return;
    }

    var statusCls = STATUS_CSS[op.status] || op.status.toLowerCase();
    var statusLabel = STATUS_LABELS[op.status] || op.status;
    var opTypeDef = op.operationType && OPERATION_TYPES[op.operationType] ? OPERATION_TYPES[op.operationType] : null;
    var opTypeLabel = opTypeDef ? opTypeDef.label : op.category;

    var html =
      '<div class="op-detail-header">' +
        '<div class="op-detail-codename">' + op.codename + '</div>' +
        '<div class="op-status-chip ' + statusCls + '" data-tip="' + escTip(TIPS.opStatus[op.status] || '') + '" style="font-size:var(--fs-sm);padding:4px 10px">' + statusLabel + '</div>' +
      '</div>';

    // Briefing
    html += '<div class="op-detail-section" style="margin-top:var(--sp-4)">' +
      '<div class="op-detail-section-title">BRIEFING</div>' +
      '<div class="op-detail-briefing">' + op.briefing + '</div>' +
    '</div>';

    // Details — expanded
    html += '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">OPERATION DETAILS</div>' +
      '<div class="intel-fields">';

    var illegalTag = (op.domestic && opTypeDef && opTypeDef.illegalDomestic) ? ' <span style="background:var(--red);color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;letter-spacing:0.5px;vertical-align:middle;margin-left:6px">ILLEGAL</span>' : '';
    html += '<div class="intel-field-row">' +
      '<span class="intel-field-key">OPERATION TYPE</span>' +
      '<span class="intel-field-val" data-tip="' + escTip(tipOpType(op.operationType)) + '">' + opTypeLabel + illegalTag + '</span>' +
    '</div>';
    html += intelRow('CODENAME', op.codename);
    html += intelRow('CLASSIFICATION', 'TOP SECRET // SCI // VIGIL');
    html += intelRow('LOCATION', op.location ? op.location.city + ', ' + op.location.country : 'Unknown');
    html += intelRow('THEATER', op.location && op.location.theater ? op.location.theater.name : '?');
    html += intelRow('THREAT LEVEL', op.threatLevel + '/5');
    if (op.orgName) {
      html += intelRow('THREAT ACTOR', op.orgName);
    }
    if (op.targetAlias) {
      html += intelRow('TARGET ALIAS', op.targetAlias);
    }
    html += intelRow('URGENCY', op.urgencyHours ? op.urgencyHours + 'h operational window' : 'STANDARD');
    html += intelRow('DAY DETECTED', 'Day ' + op.daySpawned);

    html += '</div></div>';

    // --- Intel Section (from threat intel fields) ---
    if (op.intelFields && op.intelFields.length > 0) {
      html += renderIntelSection(op);
    }

    // --- Status-specific content ---

    if (op.status === 'DETECTED' || op.status === 'ANALYSIS') {
      html += '<div class="op-detail-section">' +
        '<div class="op-detail-section-title">STATUS</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text-dim);line-height:2">' +
          (op.status === 'DETECTED' ? 'Threat detected. Vigil is preparing analysis...' : 'Vigil is analyzing threat data and generating deployment options...') +
          '<div class="vigil-analysis-bar"><div class="vigil-analysis-fill" style="width:' + getAnalysisProgress(op) + '%"></div></div>' +
        '</div>' +
      '</div>';
    }

    if (op.status === 'OPTIONS_PRESENTED') {
      html += renderVigilOptions(op);
    }

    if (op.status === 'ASSETS_IN_TRANSIT') {
      html += renderTransitProgress(op);
    }

    if (op.status === 'EXECUTING') {
      // Show assigned assets
      html += renderAssignedAssets(op);

      html += '<div class="op-detail-section">' +
        '<div class="op-detail-section-title">EXECUTION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--green);line-height:2">' +
          'Operation in progress. All assets on station in ' + op.location.city + '.' +
          '<div class="vigil-analysis-bar" style="margin-top:var(--sp-2)"><div class="vigil-analysis-fill" style="width:' + getExecProgress(op) + '%;background:var(--green)"></div></div>' +
        '</div>' +
      '</div>';
    }

    if (op.status === 'SUCCESS' || op.status === 'FAILURE') {
      // Show assigned assets summary
      html += renderAssignedAssets(op);

      if (op.debrief) {
        html += '<div class="op-detail-section">' +
          '<div class="op-detail-section-title">AFTER-ACTION REPORT</div>' +
          '<div class="debrief-container">' + op.debrief + '</div>' +
        '</div>';
      }
    }

    // Actions
    html += '<div class="op-actions">';

    if (op.status !== 'EXECUTING' && op.status !== 'ASSETS_IN_TRANSIT' && op.status !== 'SUCCESS' && op.status !== 'FAILURE' && op.status !== 'APPROVED') {
      if (op.status === 'OPTIONS_PRESENTED') {
        html += '<button class="op-action-btn cancel" onclick="reevaluateOptions(\'' + op.id + '\')">RE-EVALUATE</button>';
      }
      html += '<button class="op-action-btn cancel" onclick="cancelOperation(\'' + op.id + '\')">CANCEL</button>';
    }

    if (op.geo) {
      html += '<button class="op-action-btn cancel" onclick="globeFlyTo(' + op.geo.lat + ',' + op.geo.lon + ')">VIEW ON GLOBE</button>';
    }

    html += '</div>';

    detailEl.innerHTML = html;
  }

  // --- Intel Fields (tick-based, from threat) ---

  function renderIntelSection(op) {
    var fields = op.intelFields;
    var revealedCount = 0;
    for (var c = 0; c < fields.length; c++) {
      if (fields[c].revealed) revealedCount++;
    }

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">INTELLIGENCE PACKAGE</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);margin-bottom:var(--sp-3)">' +
        revealedCount + '/' + fields.length + ' fields resolved · Transferred from intel collection phase' +
      '</div>' +
      '<div class="intel-fields">';

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var diffColor = DIFF_COLORS[field.difficulty] || 'var(--text-dim)';

      if (field.revealed) {
        html += '<div class="intel-field-row">' +
          '<span class="intel-field-key">' +
            '<span class="intel-source-tag" data-tip="' + escTip(tipSource(field.source)) + '" style="color:' + diffColor + '">' + field.source + '</span> ' +
            field.label +
          '</span>' +
          '<span class="intel-field-val revealed">' + field.value + '</span>' +
        '</div>';
      } else {
        // Show progress bar for unrevealed fields
        var pct = field.ticksToReveal > 0 ? Math.round((field.ticksAccumulated / field.ticksToReveal) * 100) : 0;
        pct = Math.min(pct, 99); // Never show 100% if not revealed

        html += '<div class="intel-field-row">' +
          '<span class="intel-field-key">' +
            '<span class="intel-source-tag" data-tip="' + escTip(tipSource(field.source)) + '" style="color:' + diffColor + '">' + field.source + '</span> ' +
            field.label +
          '</span>' +
          '<span class="intel-field-val hidden">' +
            '<span class="intel-progress-wrap">' +
              '<span class="intel-progress-bar"><span class="intel-progress-fill" style="width:' + pct + '%;background:' + diffColor + '"></span></span>' +
              '<span class="intel-progress-label" data-tip="' + escTip(tipDifficulty(field.difficulty)) + '">' + pct + '% · ' + field.difficulty.replace('_', ' ') + '</span>' +
            '</span>' +
          '</span>' +
        '</div>';
      }
    }

    html += '</div></div>';
    return html;
  }

  // --- Assigned Assets Summary ---

  function renderAssignedAssets(op) {
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">ASSIGNED ASSETS</div>' +
      '<div class="vigil-option-assets">';

    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;
      var expandKey = op.id + '-assigned-' + asset.id;
      var isExpanded = _expandedAssets[expandKey];
      html += renderAssetRow(asset, true, expandKey, isExpanded);
    }

    html += '</div></div>';
    return html;
  }

  // --- Vigil Option Cards ---

  function renderVigilOptions(op) {
    if (!op.options || op.options.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">VIGIL DEPLOYMENT OPTIONS</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);margin-bottom:var(--sp-3)">Select a deployment option to proceed. Vigil recommendation is highlighted.</div>' +
      '<div class="vigil-options">';

    for (var i = 0; i < op.options.length; i++) {
      var opt = op.options[i];
      var recCls = opt.isRecommended ? ' vigil-recommended' : '';
      var riskCls = 'risk-' + opt.riskLevel.toLowerCase();

      html += '<div class="vigil-option-card' + recCls + '">';

      if (opt.isRecommended) {
        html += '<div class="vigil-rec-badge">★ VIGIL RECOMMENDED</div>';
      }

      html += '<div class="vigil-option-label">' + opt.label + '</div>';

      // Description if available
      if (opt.description) {
        html += '<div style="font-size:var(--fs-xs);color:var(--text-dim);line-height:1.6;margin-bottom:var(--sp-3)">' + opt.description + '</div>';
      }

      // Stats row
      var intelMod = opt.intelModifier || 0;
      var intelModStr = '';
      if (intelMod !== 0) {
        var intelModColor = intelMod > 0 ? 'var(--green)' : 'var(--red)';
        intelModStr = ' <span style="font-size:var(--fs-xs);color:' + intelModColor + '">(' +
          (intelMod > 0 ? '+' : '') + intelMod + ' INTEL)</span>';
      }

      html += '<div class="vigil-option-stats">' +
        '<div class="vigil-stat" data-tip="' + escTip(TIPS.vigilOption.confidence) + '">' +
          '<span class="vigil-stat-label">CONFIDENCE</span>' +
          '<span class="vigil-stat-value" style="color:' + confColor(opt.confidencePercent) + '">' + opt.confidencePercent + '%' + intelModStr + '</span>' +
        '</div>' +
        '<div class="vigil-stat" data-tip="' + escTip(TIPS.vigilOption.risk) + '">' +
          '<span class="vigil-stat-label">RISK</span>' +
          '<span class="vigil-stat-value ' + riskCls + '">' + opt.riskLevel + '</span>' +
        '</div>' +
        '<div class="vigil-stat" data-tip="' + escTip(TIPS.vigilOption.eta) + '">' +
          '<span class="vigil-stat-label">ETA</span>' +
          '<span class="vigil-stat-value">' + formatTransitTime(opt.transitTimeMinutes) + '</span>' +
        '</div>' +
        '<div class="vigil-stat">' +
          '<span class="vigil-stat-label">ASSETS</span>' +
          '<span class="vigil-stat-value">' + opt.assetIds.length + '</span>' +
        '</div>' +
      '</div>';

      // Assets list with expandable detail — mark unavailable ones
      html += '<div class="vigil-option-assets">';
      var assets = getAssetsByIds(opt.assetIds);
      var unavailableCount = 0;
      for (var a = 0; a < assets.length; a++) {
        var asset = assets[a];
        var expandKey = op.id + '-' + i + '-' + asset.id;
        var isExpanded = _expandedAssets[expandKey];
        var isUnavailable = asset.status !== 'STATIONED';
        if (isUnavailable) unavailableCount++;
        html += renderAssetRow(asset, true, expandKey, isExpanded, isUnavailable);
      }
      if (unavailableCount > 0) {
        html += '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--amber);padding:var(--sp-2);margin-top:var(--sp-1)">⚠ ' + unavailableCount + ' asset(s) currently deployed elsewhere</div>';
      }
      html += '</div>';

      // Consequences
      if (opt.consequences) {
        html += '<div class="vigil-option-consequences">' + opt.consequences + '</div>';
      }

      // Diplomatic assessment
      if (op.location && op.location.country && op.location.country !== 'United States' && typeof getCountryStance === 'function') {
        var opCountry = op.location.country;
        var opStance = getCountryStance(opCountry);
        var opPerms = typeof getCountryPermissions === 'function' ? getCountryPermissions(opCountry) : {};

        // Check if this option has overt assets
        var optHasOvert = false;
        for (var oa = 0; oa < assets.length; oa++) {
          if (assets[oa].deniability === 'OVERT') { optHasOvert = true; break; }
        }

        if (optHasOvert && !opPerms.overtOps) {
          html += '<div class="vigil-option-consequences" style="color:var(--red);border-color:var(--red);background:var(--red-dim)">' +
            'DIPLOMATIC WARNING: Deploying overt assets to ' + opCountry + ' (' + opStance.label + ') without clearance will constitute a sovereignty violation. ' +
            'Expected stance impact: SEVERE (-3 to -5 levels).' +
          '</div>';
        } else if (optHasOvert && opPerms.clearanceGranted) {
          html += '<div class="vigil-option-consequences" style="color:var(--green);border-color:var(--green);background:var(--green-dim)">' +
            'AUTHORIZED: Overt operations cleared by ' + opCountry + ' state authority.' +
          '</div>';
        } else if (optHasOvert) {
          html += '<div class="vigil-option-consequences" style="color:var(--green);border-color:var(--green);background:var(--green-dim)">' +
            'AUTHORIZED: ' + opCountry + ' (' + opStance.label + ') permits overt operations.' +
          '</div>';
        }
      }

      // Posse Comitatus warning for domestic operations
      if (op.domestic) {
        var optHasUnsanctioned = false;
        for (var ua = 0; ua < assets.length; ua++) {
          if (!assets[ua].domesticAuthority) { optHasUnsanctioned = true; break; }
        }
        if (optHasUnsanctioned) {
          html += '<div class="vigil-option-consequences" style="color:#d4a04a;border-color:#d4a04a;background:rgba(212,160,74,0.06)">' +
            'POSSE COMITATUS WARNING: This option includes assets without domestic authority. ' +
            'Deploying military/CIA assets on US soil violates the Posse Comitatus Act. ' +
            'Expected viability impact: SEVERE.' +
          '</div>';
        }
      }

      var allUnavailable = unavailableCount === assets.length;
      if (allUnavailable) {
        html += '<button class="op-action-btn execute vigil-select-btn" disabled style="opacity:0.4;cursor:not-allowed">ALL ASSETS UNAVAILABLE</button>';
      } else {
        html += '<button class="op-action-btn execute vigil-select-btn" onclick="approveOption(\'' + op.id + '\',' + i + ')">SELECT THIS OPTION' + (unavailableCount > 0 ? ' (' + (assets.length - unavailableCount) + '/' + assets.length + ' AVAILABLE)' : '') + '</button>';
      }

      // Deviate button
      if (!(_customConfig && _customConfig.opId === op.id)) {
        html += '<button class="op-action-btn cancel vigil-deviate-btn" onclick="openCustomConfig(\'' + op.id + '\',' + i + ')">DEVIATE FROM MODEL</button>';
      }

      html += '</div>';
    }

    // Custom configuration panel
    if (_customConfig && _customConfig.opId === op.id) {
      html += renderCustomConfig(op);
    }

    html += '</div></div>';
    return html;
  }

  // --- Custom Force Configuration Panel ---

  function renderCustomConfig(op) {
    var cfg = _customConfig;
    var baseOption = op.options[cfg.baseOptionIdx];

    // Get all available assets
    var allAvailable = getAvailableAssets();
    var opType = getOperationType(op.operationType);

    // Filter to assets with relevant capabilities
    var mustHaveAll = opType ? opType.assetMustHaveAll : null;
    var restrictCats = opType ? opType.restrictToCategories : null;
    var isMaritimeOp = op.maritime || (opType && opType.maritime);
    var eligibleAvailable = allAvailable.filter(function(a) {
      if (cfg.assetIds.indexOf(a.id) >= 0) return false; // already selected
      // Domestic agencies only available for domestic ops
      if (a.domesticAuthority && !op.domestic) return false;
      // Domestic ops: exclude NAVY/AIR, require domestic authority or COVERT deniability
      if (op.domestic) {
        if (a.category === 'NAVY' || a.category === 'AIR') return false;
        if (!a.domesticAuthority && a.deniability !== 'COVERT') return false;
      }
      // Maritime filtering: NAVY assets only for maritime ops
      if (a.category === 'NAVY' && !isMaritimeOp) return false;
      if (isMaritimeOp && a.category === 'DOMESTIC' && a.capabilities.indexOf('NAVAL') < 0) return false;
      // USCG: only domestic ops at port cities
      if (a.category === 'DOMESTIC' && a.capabilities.indexOf('NAVAL') >= 0) {
        if (!op.domestic || !op.location || !op.location.maritime) return false;
      }
      // User filter: SANCTIONED or COVERT
      if (_customFilter === 'SANCTIONED' && !a.domesticAuthority) return false;
      if (_customFilter === 'COVERT' && (a.domesticAuthority || a.deniability !== 'COVERT')) return false;
      if (!opType) return true;
      // Category restriction (e.g. DRONE_STRIKE only ISR-category)
      if (restrictCats && restrictCats.indexOf(a.category) < 0) return false;
      // If op requires each asset to have ALL listed caps, enforce that
      if (mustHaveAll) {
        for (var m = 0; m < mustHaveAll.length; m++) {
          if (a.capabilities.indexOf(mustHaveAll[m]) < 0) return false;
        }
        return true;
      }
      for (var i = 0; i < opType.requiredCapabilities.length; i++) {
        if (a.capabilities.indexOf(opType.requiredCapabilities[i]) >= 0) return true;
      }
      for (var j = 0; j < opType.preferredCapabilities.length; j++) {
        if (a.capabilities.indexOf(opType.preferredCapabilities[j]) >= 0) return true;
      }
      return false;
    });

    // Filter out NAVY assets that can't reach the target
    eligibleAvailable = eligibleAvailable.filter(function(a) {
      if (a.category !== 'NAVY') return true;
      var rangeKm = a.effectiveRangeKm || 1000;
      if (typeof findNavalStationPoint !== 'function') return true;
      var station = findNavalStationPoint(a.currentLat, a.currentLon, op.geo.lat, op.geo.lon, rangeKm);
      if (!station) return false;
      a._stationPoint = station;
      return true;
    });

    var selectedAssets = getAssetsByIds(cfg.assetIds);

    // Recalculate stats
    var recalc = typeof recalcCustomOption === 'function'
      ? recalcCustomOption(op, cfg.assetIds)
      : { confidencePercent: 0, riskLevel: 'CRITICAL', transitMinutes: 0 };

    var riskCls = 'risk-' + recalc.riskLevel.toLowerCase();

    var html = '<div class="vigil-option-card custom-config-card">' +
      '<div class="vigil-rec-badge" style="color:var(--amber)">⚠ CUSTOM FORCE CONFIGURATION</div>' +
      '<div class="vigil-option-label">MODIFIED: ' + baseOption.label + '</div>';

    // Stats row
    var cIntelMod = recalc.intelModifier || 0;
    var cIntelStr = '';
    if (cIntelMod !== 0) {
      var cIntelColor = cIntelMod > 0 ? 'var(--green)' : 'var(--red)';
      cIntelStr = ' <span style="font-size:var(--fs-xs);color:' + cIntelColor + '">(' +
        (cIntelMod > 0 ? '+' : '') + cIntelMod + ' INTEL)</span>';
    }

    html += '<div class="vigil-option-stats">' +
      '<div class="vigil-stat"><span class="vigil-stat-label">CONFIDENCE</span>' +
      '<span class="vigil-stat-value" style="color:' + confColor(recalc.confidencePercent) + '">' + recalc.confidencePercent + '%' + cIntelStr + '</span></div>' +
      '<div class="vigil-stat"><span class="vigil-stat-label">RISK</span>' +
      '<span class="vigil-stat-value ' + riskCls + '">' + recalc.riskLevel + '</span></div>' +
      '<div class="vigil-stat"><span class="vigil-stat-label">ETA</span>' +
      '<span class="vigil-stat-value">' + formatTransitTime(recalc.transitMinutes) + '</span></div>' +
      '<div class="vigil-stat"><span class="vigil-stat-label">ASSETS</span>' +
      '<span class="vigil-stat-value">' + cfg.assetIds.length + '</span></div>' +
    '</div>';

    // Selected assets with remove buttons
    html += '<div class="op-detail-section-title" style="margin-top:var(--sp-2)">SELECTED ASSETS</div>';
    html += '<div class="vigil-option-assets">';
    for (var s = 0; s < selectedAssets.length; s++) {
      html += renderCustomAssetRow(selectedAssets[s], true);
    }
    if (selectedAssets.length === 0) {
      html += '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-muted);padding:var(--sp-2)">No assets selected</div>';
    }
    html += '</div>';

    // Available assets to add — with filter toggles
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-3)">' +
      '<span class="op-detail-section-title" style="margin:0">AVAILABLE TO ADD</span>' +
      '<div style="display:flex;gap:var(--sp-1)">' +
        '<button class="custom-filter-btn' + (_customFilter === 'ALL' ? ' active' : '') + '" onclick="setCustomFilter(\'ALL\')">ALL</button>' +
        '<button class="custom-filter-btn' + (_customFilter === 'SANCTIONED' ? ' active' : '') + '" onclick="setCustomFilter(\'SANCTIONED\')">SANCTIONED</button>' +
        '<button class="custom-filter-btn' + (_customFilter === 'COVERT' ? ' active' : '') + '" onclick="setCustomFilter(\'COVERT\')">COVERT</button>' +
      '</div>' +
    '</div>';
    html += '<div class="vigil-option-assets" style="max-height:240px;overflow-y:auto">';
    for (var u = 0; u < eligibleAvailable.length; u++) {
      html += renderCustomAssetRow(eligibleAvailable[u], false);
    }
    if (eligibleAvailable.length === 0) {
      html += '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-muted);padding:var(--sp-2)">No additional eligible assets available</div>';
    }
    html += '</div>';

    // Deviation warning
    html += '<div class="vigil-option-consequences" style="color:var(--amber);border-color:var(--amber);background:var(--amber-dim)">' +
      'DEVIATION WARNING: Custom force configurations carry the same viability risk as selecting a non-recommended option. Failure with a deviated configuration incurs severe viability penalties.' +
    '</div>';

    // Actions
    var canDeploy = cfg.assetIds.length > 0;
    html += '<div style="display:flex;gap:var(--sp-2)">' +
      '<button class="op-action-btn execute vigil-select-btn" style="flex:1"' +
      (canDeploy ? '' : ' disabled style="opacity:0.4;cursor:not-allowed;flex:1"') +
      ' onclick="approveCustomConfig(\'' + op.id + '\')">DEPLOY CUSTOM CONFIGURATION</button>' +
      '<button class="op-action-btn cancel" style="flex:0 0 auto" onclick="cancelCustomConfig()">CANCEL</button>' +
    '</div>';

    html += '</div>';
    return html;
  }

  function renderCustomAssetRow(asset, isSelected) {
    var catInfo = ASSET_CATEGORIES[asset.category] || {};
    var base = getBase(asset.currentBaseId || asset.homeBaseId);

    var actionBtn = isSelected
      ? '<span class="custom-asset-action remove" onclick="event.stopPropagation();removeCustomAsset(\'' + asset.id + '\')">✕</span>'
      : '<span class="custom-asset-action add" onclick="event.stopPropagation();addCustomAsset(\'' + asset.id + '\')">+</span>';

    return '<div class="vigil-asset-row expandable">' +
      actionBtn +
      '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
      '<span class="vigil-asset-name">' + asset.name + '</span>' +
      (asset.deniability ? '<span style="font-family:var(--font-mono);font-size:8px;padding:1px 4px;border-radius:2px;color:' + (DENIABILITY_DISPLAY[asset.deniability] || DENIABILITY_DISPLAY.OVERT).color + '">' + asset.deniability + '</span>' : '') +
      '<span class="vigil-asset-base">' + (base ? base.city + ', ' + base.country : '') + '</span>' +
    '</div>';
  }

  // --- Asset Row with Expandable Detail ---

  function renderAssetRow(asset, expandable, expandKey, isExpanded, unavailable) {
    var catInfo = ASSET_CATEGORIES[asset.category] || {};
    var base = getBase(asset.currentBaseId || asset.homeBaseId);
    var catClass = asset.category.toLowerCase();

    var unavailCls = unavailable ? ' asset-unavailable' : '';
    var html = '<div class="vigil-asset-row' + (expandable ? ' expandable' : '') + unavailCls + '"' +
      (expandable ? ' onclick="toggleAssetExpand(\'' + expandKey + '\')"' : '') + '>' +
      '<span class="vigil-asset-cat" data-tip="' + escTip(TIPS.assetCat[asset.category] || '') + '" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
      '<span class="vigil-asset-name">' + asset.name + '</span>' +
      (unavailable ? '<span style="font-family:var(--font-mono);font-size:8px;padding:1px 4px;border-radius:2px;background:var(--red-dim);color:var(--red)">DEPLOYED</span>' : '') +
      (asset.deniability ? '<span data-tip="' + escTip(TIPS.deniability[asset.deniability] || '') + '" style="font-family:var(--font-mono);font-size:8px;padding:1px 4px;border-radius:2px;color:' + (DENIABILITY_DISPLAY[asset.deniability] || DENIABILITY_DISPLAY.OVERT).color + '">' + asset.deniability + '</span>' : '') +
      '<span class="vigil-asset-base">' + (base ? base.city + ', ' + base.country : '') + '</span>' +
      (expandable ? '<span class="asset-expand-icon">' + (isExpanded ? '▾' : '▸') + '</span>' : '') +
    '</div>';

    if (isExpanded) {
      html += renderAssetDetail(asset);
    }

    return html;
  }

  function renderAssetDetail(asset) {
    var catInfo = ASSET_CATEGORIES[asset.category] || {};
    var base = getBase(asset.homeBaseId);
    var readinessColor = asset.readiness === 'TIER_1' ? 'var(--red)' : asset.readiness === 'TIER_2' ? 'var(--amber)' : 'var(--green)';

    var html = '<div class="asset-detail-card">';

    // Header
    html += '<div class="asset-detail-header">' +
      '<div class="asset-detail-name">' + asset.name + '</div>' +
      '<div class="asset-detail-designation">' + (asset.designation || '') + '</div>' +
    '</div>';

    // Key stats
    html += '<div class="asset-detail-stats">';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">CATEGORY</span><span class="asset-detail-stat-val" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.label || asset.category) + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">PLATFORM</span><span class="asset-detail-stat-val">' + (asset.platform || '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">PERSONNEL</span><span class="asset-detail-stat-val">' + (asset.personnel ? asset.personnel.toLocaleString() : '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">READINESS</span><span class="asset-detail-stat-val" style="color:' + readinessColor + '">' + (asset.readiness || 'FULL').replace('_', ' ') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">HOME BASE</span><span class="asset-detail-stat-val">' + (base ? base.name : '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">SPEED</span><span class="asset-detail-stat-val">' + (asset.speed > 0 ? asset.speed + ' km/h' : 'REMOTE') + '</span></div>';
    html += '</div>';

    // Description
    if (asset.description) {
      html += '<div class="asset-detail-desc">' + asset.description + '</div>';
    }

    // Unit composition
    if (asset.unitComposition) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">UNIT COMPOSITION</div>' +
        '<div class="asset-detail-subsection-text">' + asset.unitComposition + '</div>' +
      '</div>';
    }

    // Vehicles
    if (asset.vehicles && asset.vehicles.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">VEHICLES & PLATFORMS</div>' +
        '<div class="asset-detail-list">';
      for (var v = 0; v < asset.vehicles.length; v++) {
        html += '<div class="asset-detail-list-item">' + asset.vehicles[v] + '</div>';
      }
      html += '</div></div>';
    }

    // Equipment
    if (asset.equipment && asset.equipment.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">EQUIPMENT & SYSTEMS</div>' +
        '<div class="asset-detail-list">';
      for (var e = 0; e < asset.equipment.length; e++) {
        html += '<div class="asset-detail-list-item">' + asset.equipment[e] + '</div>';
      }
      html += '</div></div>';
    }

    // Capabilities
    if (asset.capabilities && asset.capabilities.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">CAPABILITIES</div>' +
        '<div class="asset-detail-caps">';
      for (var c = 0; c < asset.capabilities.length; c++) {
        html += '<span class="tip-tag ' + (catInfo.shortLabel || '').toLowerCase() + '">' + asset.capabilities[c] + '</span>';
      }
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }

  // --- Transit Progress ---

  function renderTransitProgress(op) {
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">ASSET TRANSIT</div>' +
      '<div class="vigil-option-assets">';

    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;

      var expandKey = op.id + '-transit-' + asset.id;
      var isExpanded = _expandedAssets[expandKey];

      // Transit progress info
      var pct = 100;
      var statusText = 'ON STATION';
      if (asset.status === 'IN_TRANSIT' && asset.transitDurationMinutes > 0) {
        var elapsed = V.time.totalMinutes - asset.transitStartTotalMinutes;
        pct = Math.min(100, Math.round((elapsed / asset.transitDurationMinutes) * 100));
        var remaining = Math.max(0, asset.transitDurationMinutes - elapsed);
        statusText = formatTransitTime(remaining) + ' remaining';
      } else if (asset.status === 'DEPLOYED') {
        statusText = 'DEPLOYED';
      }

      html += renderAssetRow(asset, true, expandKey, isExpanded);
      html += '<div class="transit-bar-wrap">' +
        '<div class="transit-bar"><div class="transit-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="transit-status">' + statusText + '</span>' +
      '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // --- Helpers ---

  function intelRow(key, val) {
    return '<div class="intel-field-row">' +
      '<span class="intel-field-key">' + key + '</span>' +
      '<span class="intel-field-val">' + val + '</span>' +
    '</div>';
  }

  function escTip(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
  }

  function getAnalysisProgress(op) {
    if (!op.nextTransitionAt) return 0;
    var totalDuration = op.phaseDuration || 180;
    var remaining = op.nextTransitionAt - V.time.totalMinutes;
    var elapsed = totalDuration - remaining;
    return clamp(Math.round((elapsed / totalDuration) * 100), 0, 100);
  }

  function getExecProgress(op) {
    if (!op.nextTransitionAt || !op.execDurationMinutes) return 0;
    var remaining = op.nextTransitionAt - V.time.totalMinutes;
    var elapsed = op.execDurationMinutes - remaining;
    return clamp(Math.round((elapsed / op.execDurationMinutes) * 100), 0, 100);
  }

  function confColor(pct) {
    if (pct >= 70) return 'var(--green)';
    if (pct >= 50) return 'var(--amber)';
    return 'var(--red)';
  }

  // --- Global functions ---

  window.selectOperation = function(opId) {
    _selectedOpId = opId;
    renderOpsList();
    renderOpsDetail(opId);
  };

  window.toggleOpsArchive = function() {
    _showArchive = !_showArchive;
    renderOpsList();
  };

  window.toggleAssetExpand = function(key) {
    _expandedAssets[key] = !_expandedAssets[key];
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
  };

  // --- Custom Force Configuration Actions ---

  window.openCustomConfig = function(opId, optionIdx) {
    var op = getOp(opId);
    if (!op || !op.options || !op.options[optionIdx]) return;
    var option = op.options[optionIdx];
    _customConfig = {
      opId: opId,
      baseOptionIdx: optionIdx,
      assetIds: option.assetIds.slice(),
    };
    renderOpsDetail(opId);
  };

  window.cancelCustomConfig = function() {
    _customConfig = null;
    _customFilter = 'ALL';
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
  };

  window.addCustomAsset = function(assetId) {
    if (!_customConfig) return;
    if (_customConfig.assetIds.indexOf(assetId) < 0) {
      _customConfig.assetIds.push(assetId);
    }
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
  };

  window.removeCustomAsset = function(assetId) {
    if (!_customConfig) return;
    var idx = _customConfig.assetIds.indexOf(assetId);
    if (idx >= 0) _customConfig.assetIds.splice(idx, 1);
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
  };

  window.setCustomFilter = function(filter) {
    _customFilter = filter;
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
  };

  window.approveCustomConfig = function(opId) {
    if (!_customConfig || _customConfig.opId !== opId) return;
    var op = getOp(opId);
    if (!op || op.status !== 'OPTIONS_PRESENTED') return;

    var recalc = typeof recalcCustomOption === 'function'
      ? recalcCustomOption(op, _customConfig.assetIds)
      : { confidencePercent: 50, riskLevel: 'ELEVATED', transitMinutes: 0 };

    var baseOption = op.options[_customConfig.baseOptionIdx];
    var customOption = {
      label: 'CUSTOM CONFIGURATION',
      description: 'Operator-defined force package deviating from Vigil model. Based on: ' + baseOption.label + '.',
      assetIds: _customConfig.assetIds.slice(),
      transitTimeHours: Math.round((recalc.transitMinutes / 60) * 10) / 10,
      transitTimeMinutes: recalc.transitMinutes,
      riskLevel: recalc.riskLevel,
      confidencePercent: recalc.confidencePercent,
      intelModifier: recalc.intelModifier || 0,
      consequences: 'Custom force configuration. Deviation from Vigil recommendation.',
      isRecommended: false,
    };

    op.options.push(customOption);
    var customIdx = op.options.length - 1;

    op.selectedOptionIdx = customIdx;
    op.deviatedFromVigil = true;
    op.status = 'APPROVED';

    var assets = getAssetsByIds(customOption.assetIds);
    op.fillVars = buildOpFillVars(op, assets);

    addLog('OP ' + op.codename + ': Custom configuration approved. (DEVIATED FROM VIGIL)', 'log-decision');

    _customConfig = null;
    renderOpsDetail(opId);
    renderOpsList();
  };

  // Re-render on state changes
  hook('operation:spawned', function() {
    if (V.ui.activeWorkspace === 'operations') {
      renderOpsList();
    }
  });

  hook('operation:resolved', function() {
    if (V.ui.activeWorkspace === 'operations') {
      renderOpsList();
      if (_selectedOpId) renderOpsDetail(_selectedOpId);
    }
  });

})();
