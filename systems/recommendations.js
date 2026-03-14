/* ============================================================
   VIGIL — systems/recommendations.js
   Vigil's option generation engine. Generates 2-4 deployment
   options per operation, each with concrete assets, transit
   times, risk levels, and parametrized descriptions.
   ============================================================ */

// --- Generate Vigil Options for an Operation ---

function generateVigilOptions(op) {
  var opType = getOperationType(op.operationType);
  if (!opType) return [];

  var required = opType.requiredCapabilities;
  var preferred = opType.preferredCapabilities;
  var destLat = op.geo.lat;
  var destLon = op.geo.lon;

  // Per-asset mandatory capabilities (e.g. DRONE_STRIKE needs each asset to have ISR+STRIKE)
  var mustHaveAll = opType.assetMustHaveAll || null;
  // Category restriction (e.g. DRONE_STRIKE only admits ISR-category platforms)
  var restrictCats = opType.restrictToCategories || null;

  // Find all available assets with relevant capabilities
  var eligible = getAvailableAssets().filter(function(a) {
    // Domestic agencies only available for domestic ops
    if (a.domesticAuthority && !op.domestic) return false;

    // Domestic ops: exclude categories that make no sense on US soil
    if (op.domestic) {
      // NAVY and AIR cannot meaningfully operate domestically
      if (a.category === 'NAVY' || a.category === 'AIR') return false;
      // Non-domestic-authority assets must be COVERT to even be considered
      if (!a.domesticAuthority && a.deniability !== 'COVERT') return false;
    }

    // Category restriction
    if (restrictCats && restrictCats.indexOf(a.category) < 0) return false;

    // If op requires each asset to have ALL listed caps, enforce that
    if (mustHaveAll) {
      for (var m = 0; m < mustHaveAll.length; m++) {
        if (a.capabilities.indexOf(mustHaveAll[m]) < 0) return false;
      }
      return true;
    }

    // Otherwise: asset must have at least one required capability
    for (var i = 0; i < required.length; i++) {
      if (a.capabilities.indexOf(required[i]) >= 0) return true;
    }
    // Also admit assets that have preferred capabilities (support roles)
    for (var p = 0; p < preferred.length; p++) {
      if (a.capabilities.indexOf(preferred[p]) >= 0) return true;
    }
    return false;
  });

  if (eligible.length === 0) return [];

  // Pre-compute naval station points; exclude unreachable naval assets
  eligible = eligible.filter(function(a) {
    if (a.category !== 'NAVY') return true;
    var rangeKm = a.effectiveRangeKm || 1000;
    var station = typeof findNavalStationPoint === 'function'
      ? findNavalStationPoint(a.currentLat, a.currentLon, destLat, destLon, rangeKm)
      : null;
    if (!station) return false; // Target unreachable from any ocean position within range
    a._stationPoint = station; // Cache for transit calculation and deployment
    return true;
  });

  if (eligible.length === 0) return [];

  // Score and sort by relevance (preferred capabilities + distance)
  var scored = eligible.map(function(a) {
    var capScore = 0;
    for (var i = 0; i < preferred.length; i++) {
      if (a.capabilities.indexOf(preferred[i]) >= 0) capScore += 10;
    }
    for (var j = 0; j < required.length; j++) {
      if (a.capabilities.indexOf(required[j]) >= 0) capScore += 20;
    }
    // Note: domestic ops use separate sanctioned/covert pools, no penalty needed here
    // NAVY uses station point path distance; others use straight-line
    var dist;
    if (a.category === 'NAVY' && a._stationPoint) {
      dist = a._stationPoint.pathDistance;
    } else {
      dist = haversineKm(a.currentLat, a.currentLon, destLat, destLon);
    }
    var distPenalty = Math.min(dist / 500, 20); // closer = better
    return { asset: a, score: capScore - distPenalty, dist: dist };
  });

  scored.sort(function(a, b) { return b.score - a.score; });

  var options = [];

  // --- Domestic ops: generate separate sanctioned vs covert options ---
  if (op.domestic) {
    var isIllegal = opType.illegalDomestic;

    if (!isIllegal) {
      // Non-illegal domestic ops: offer sanctioned option + covert option
      var sanctionedPool = scored.filter(function(s) { return s.asset.domesticAuthority; });
      var covertPool = scored.filter(function(s) { return !s.asset.domesticAuthority; });

      // Option A: Sanctioned (recommended)
      if (sanctionedPool.length > 0) {
        var optSanctioned = buildOption(sanctionedPool, destLat, destLon, op, opType, 'optimal');
        if (optSanctioned) {
          optSanctioned.label = 'SANCTIONED RESPONSE';
          optSanctioned.isRecommended = true;
          options.push(optSanctioned);
        }
      }

      // Option B: Covert military (unsanctioned)
      if (covertPool.length > 0) {
        var optCovert = buildOption(covertPool, destLat, destLon, op, opType, 'optimal');
        if (optCovert) {
          optCovert.label = 'COVERT MILITARY RESPONSE';
          optCovert.isRecommended = false;
          optCovert.consequences = (optCovert.consequences || '') + ' POSSE COMITATUS VIOLATION: Deploying military assets on US soil without authorization. Severe viability impact on failure.';
          options.push(optCovert);
        }
      }

      // Option C: Light sanctioned if we have a sanctioned option
      if (sanctionedPool.length > 0) {
        var optLight = buildOption(sanctionedPool, destLat, destLon, op, opType, 'light');
        if (optLight && !sameAssets(options[0], optLight)) {
          optLight.label = 'RAPID SANCTIONED RESPONSE';
          optLight.isRecommended = false;
          options.push(optLight);
        }
      }
    } else {
      // Illegal domestic ops: covert military only
      var covertOnlyPool = scored.filter(function(s) { return !s.asset.domesticAuthority && s.asset.deniability === 'COVERT'; });

      if (covertOnlyPool.length > 0) {
        var optIllegalA = buildOption(covertOnlyPool, destLat, destLon, op, opType, 'optimal');
        if (optIllegalA) {
          optIllegalA.label = 'COVERT OPERATION';
          optIllegalA.isRecommended = true;
          optIllegalA.consequences = (optIllegalA.consequences || '') + ' ILLEGAL DOMESTIC OPERATION: This action is unsanctioned on US soil. Extreme viability risk.';
          options.push(optIllegalA);
        }
      }

      if (covertOnlyPool.length > 0) {
        var optIllegalB = buildOption(covertOnlyPool, destLat, destLon, op, opType, 'light');
        if (optIllegalB && !sameAssets(options[0], optIllegalB)) {
          optIllegalB.label = 'MINIMAL FOOTPRINT';
          optIllegalB.isRecommended = false;
          optIllegalB.consequences = (optIllegalB.consequences || '') + ' ILLEGAL DOMESTIC OPERATION: This action is unsanctioned on US soil. Extreme viability risk.';
          options.push(optIllegalB);
        }
      }
    }
  } else {
    // --- Foreign ops: standard option generation ---

    // --- Option A: RECOMMENDED — optimal mix ---
    var optA = buildOption(scored, destLat, destLon, op, opType, 'optimal');
    if (optA) {
      optA.label = 'VIGIL RECOMMENDATION';
      optA.isRecommended = true;
      options.push(optA);
    }

    // --- Option B: LIGHT — fewer/faster assets ---
    var optB = buildOption(scored, destLat, destLon, op, opType, 'light');
    if (optB && !sameAssets(optA, optB)) {
      optB.label = 'RAPID DEPLOYMENT';
      optB.isRecommended = false;
      options.push(optB);
    }

    // --- Option C: HEAVY — more force ---
    var optC = buildOption(scored, destLat, destLon, op, opType, 'heavy');
    if (optC && !sameAssets(optA, optC) && !sameAssets(optB, optC)) {
      optC.label = 'OVERWHELMING FORCE';
      optC.isRecommended = false;
      options.push(optC);
    }

    // --- Option D: UNCONVENTIONAL (ISR/cyber only, if applicable) ---
    if (hasUnconventionalOption(opType)) {
      var optD = buildOption(scored, destLat, destLon, op, opType, 'unconventional');
      if (optD && !sameAssets(optA, optD)) {
        optD.label = 'UNCONVENTIONAL APPROACH';
        optD.isRecommended = false;
        options.push(optD);
      }
    }
  }

  // Mark recommended index
  for (var i = 0; i < options.length; i++) {
    if (options[i].isRecommended) {
      op.vigilRecommendedIdx = i;
      break;
    }
  }

  return options;
}

// --- Build a single option ---

function buildOption(scored, destLat, destLon, op, opType, strategy) {
  var selected = [];
  var usedIds = {};
  var maxAssets = strategy === 'light' ? 2 : strategy === 'heavy' ? 5 : 3;
  var minAssets = strategy === 'light' ? 1 : strategy === 'heavy' ? 3 : 2;

  // Filter by strategy
  var pool = scored.slice();
  if (strategy === 'light') {
    // Prefer closest
    pool.sort(function(a, b) { return a.dist - b.dist; });
  } else if (strategy === 'heavy') {
    // Prefer highest score regardless of distance
    pool.sort(function(a, b) { return b.score - a.score; });
  } else if (strategy === 'unconventional') {
    // Only ISR/INTEL/CYBER assets
    pool = pool.filter(function(s) {
      return s.asset.category === 'ISR' || s.asset.category === 'INTEL';
    });
  }

  // Select assets ensuring we have required capabilities covered
  var coveredRequired = {};
  for (var i = 0; i < pool.length && selected.length < maxAssets; i++) {
    var a = pool[i].asset;
    if (usedIds[a.id]) continue;

    // Check if this asset contributes something needed
    var contributes = false;
    for (var j = 0; j < opType.requiredCapabilities.length; j++) {
      var cap = opType.requiredCapabilities[j];
      if (!coveredRequired[cap] && a.capabilities.indexOf(cap) >= 0) {
        coveredRequired[cap] = true;
        contributes = true;
      }
    }
    // Also pick for preferred capabilities
    if (!contributes) {
      for (var k = 0; k < opType.preferredCapabilities.length; k++) {
        if (a.capabilities.indexOf(opType.preferredCapabilities[k]) >= 0) {
          contributes = true;
          break;
        }
      }
    }

    if (contributes || selected.length < minAssets) {
      selected.push(a);
      usedIds[a.id] = true;
    }
  }

  if (selected.length === 0) return null;

  // Check all required capabilities are covered by the force package
  var allCovered = true;
  for (var r = 0; r < opType.requiredCapabilities.length; r++) {
    if (!coveredRequired[opType.requiredCapabilities[r]]) {
      // Try to find in selected anyway (some assets have multiple caps)
      var found = false;
      for (var s = 0; s < selected.length; s++) {
        if (selected[s].capabilities.indexOf(opType.requiredCapabilities[r]) >= 0) {
          found = true;
          break;
        }
      }
      if (!found) allCovered = false;
    }
  }

  // Reject option entirely if required capabilities aren't covered
  if (!allCovered) return null;

  var assetIds = selected.map(function(a) { return a.id; });
  var transitMinutes = calcGroupTransitMinutes(assetIds, destLat, destLon);
  var transitHours = transitMinutes / 60;

  // Risk calculation
  var riskLevel = calcOptionRisk(selected, transitHours, op.threatLevel, allCovered, strategy);

  // Confidence percentage
  var confidencePercent = calcOptionConfidence(opType, selected, transitHours, op.threatLevel, allCovered, strategy);

  // Build parametrized description
  var description = buildOptionDescription(selected, op, transitHours, strategy);

  // Consequences string
  var consequences = buildConsequences(op, strategy, riskLevel);

  return {
    label: '',
    description: description,
    assetIds: assetIds,
    transitTimeHours: Math.round(transitHours * 10) / 10,
    transitTimeMinutes: transitMinutes,
    riskLevel: riskLevel,
    confidencePercent: confidencePercent,
    consequences: consequences,
    isRecommended: false,
  };
}

// --- Risk Calculation ---

function calcOptionRisk(assets, transitHours, threatLevel, allCovered, strategy) {
  var risk = 2; // base
  risk += (threatLevel - 3) * 0.5;
  if (transitHours > 12) risk += 1;
  if (transitHours > 24) risk += 1;
  if (!allCovered) risk += 1;
  if (strategy === 'light') risk += 0.5;
  if (strategy === 'heavy') risk -= 0.5;
  if (assets.length <= 1) risk += 1;

  if (risk <= 1.5) return 'LOW';
  if (risk <= 2.5) return 'MODERATE';
  if (risk <= 3.5) return 'ELEVATED';
  if (risk <= 4.5) return 'HIGH';
  return 'CRITICAL';
}

// --- Confidence Calculation ---

function calcOptionConfidence(opType, assets, transitHours, threatLevel, allCovered, strategy) {
  var base = opType.baseSuccessRate;

  // Asset count bonus
  var assetBonus = Math.min(assets.length * 3, 12);

  // Distance penalty
  var transitPenalty = Math.min(Math.floor(transitHours / 6) * 2, 10);

  // Capability coverage
  var capBonus = allCovered ? 5 : -10;

  // Strategy modifier
  var stratMod = 0;
  if (strategy === 'light') stratMod = -5;
  if (strategy === 'heavy') stratMod = 5;
  if (strategy === 'unconventional') stratMod = -8;

  // Threat level adjustment
  var threatAdj = (3 - threatLevel) * 3;

  var total = base + assetBonus - transitPenalty + capBonus + stratMod + threatAdj;
  return clamp(Math.round(total), 15, 95);
}

// --- Parametrized Option Description ---

function buildOptionDescription(assets, op, transitHours, strategy) {
  var lines = [];

  for (var i = 0; i < assets.length; i++) {
    var a = assets[i];
    var base = getBase(a.currentBaseId || a.homeBaseId);
    var baseName = base ? base.name : 'unknown facility';
    var baseLocation = base ? base.city + ', ' + base.country : 'unknown location';
    var transit = calcTransitMinutes(a, op.geo.lat, op.geo.lon);

    if (a.speed <= 0) {
      lines.push(a.name + ' — remote operation from ' + baseName + ', ' + baseLocation);
    } else if (a.category === 'NAVY' && a._stationPoint) {
      var wpName = a._stationPoint.waypointId.replace(/_/g, ' ');
      lines.push(a.name + ' from ' + baseName + ', ' + baseLocation + ' → station near ' + wpName + ' (' + Math.round(a._stationPoint.distToTarget) + 'km from target, ETA: ' + formatTransitTime(transit) + ')');
    } else {
      lines.push(a.name + ' from ' + baseName + ', ' + baseLocation + ' (ETA: ' + formatTransitTime(transit) + ')');
    }
  }

  var header = '';
  if (strategy === 'light') {
    header = 'Rapid deployment with minimal footprint. ';
  } else if (strategy === 'heavy') {
    header = 'Maximum force projection to ensure decisive outcome. ';
  } else if (strategy === 'unconventional') {
    header = 'Intelligence-led approach minimizing kinetic action. ';
  } else {
    header = 'Balanced deployment optimizing capability coverage and response time. ';
  }

  header += 'Total transit: ' + formatTransitTime(Math.round(transitHours * 60)) + '.';

  return header + '\n\n' + lines.join('\n');
}

// --- Consequences String ---

function buildConsequences(op, strategy, riskLevel) {
  var theater = op.location ? op.location.theater : null;
  var theaterName = theater ? theater.name : 'the region';

  var consequences = [];

  if (strategy === 'heavy') {
    consequences.push('High visibility in ' + theaterName + '. Theater risk may increase.');
  } else if (strategy === 'light') {
    consequences.push('Lower footprint. Reduced chance of collateral escalation.');
    consequences.push('Fewer assets committed — higher risk of operational failure.');
  } else if (strategy === 'unconventional') {
    consequences.push('Minimal international attention. Plausible deniability maintained.');
    consequences.push('Limited kinetic capability if situation escalates.');
  }

  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    consequences.push('Significant risk to deployed personnel.');
  }

  if (op.threatLevel >= 4) {
    consequences.push('Threat level ' + op.threatLevel + '/5 — hostile response likely.');
  }

  // Diplomatic consequences
  if (op.location && op.location.country && op.location.country !== 'United States' && typeof getCountryStance === 'function') {
    var country = op.location.country;
    var stance = getCountryStance(country);
    var perms = typeof getCountryPermissions === 'function' ? getCountryPermissions(country) : {};
    if (!perms.overtOps) {
      consequences.push('WARNING: ' + country + ' (' + stance.label + ') has not authorized overt operations. Sovereignty violation risk.');
    }
  }

  return consequences.join(' ');
}

// --- Helpers ---

function sameAssets(optA, optB) {
  if (!optA || !optB) return false;
  if (optA.assetIds.length !== optB.assetIds.length) return false;
  var sorted1 = optA.assetIds.slice().sort();
  var sorted2 = optB.assetIds.slice().sort();
  for (var i = 0; i < sorted1.length; i++) {
    if (sorted1[i] !== sorted2[i]) return false;
  }
  return true;
}

// --- Recalculate for Custom Force Configuration ---

function recalcCustomOption(op, assetIds) {
  var opType = getOperationType(op.operationType);
  var assets = getAssetsByIds(assetIds);
  if (!opType || assets.length === 0) {
    return { confidencePercent: 0, riskLevel: 'CRITICAL', transitMinutes: 0 };
  }

  var destLat = op.geo.lat;
  var destLon = op.geo.lon;

  // Pre-compute station points for NAVY assets in custom selection
  for (var n = 0; n < assets.length; n++) {
    if (assets[n].category === 'NAVY' && !assets[n]._stationPoint) {
      var rangeKm = assets[n].effectiveRangeKm || 1000;
      if (typeof findNavalStationPoint === 'function') {
        assets[n]._stationPoint = findNavalStationPoint(assets[n].currentLat, assets[n].currentLon, destLat, destLon, rangeKm);
      }
    }
  }

  var transitMinutes = calcGroupTransitMinutes(assetIds, destLat, destLon);
  var transitHours = transitMinutes / 60;

  // Check capability coverage
  var allCovered = true;
  for (var r = 0; r < opType.requiredCapabilities.length; r++) {
    var found = false;
    for (var s = 0; s < assets.length; s++) {
      if (assets[s].capabilities.indexOf(opType.requiredCapabilities[r]) >= 0) {
        found = true; break;
      }
    }
    if (!found) { allCovered = false; break; }
  }

  var riskLevel = calcOptionRisk(assets, transitHours, op.threatLevel, allCovered, 'optimal');
  var confidencePercent = calcOptionConfidence(opType, assets, transitHours, op.threatLevel, allCovered, 'optimal');

  return {
    confidencePercent: confidencePercent,
    riskLevel: riskLevel,
    transitMinutes: transitMinutes,
  };
}

function hasUnconventionalOption(opType) {
  var unconventionalTypes = ['SURVEILLANCE', 'CYBER_OP', 'INTEL_COLLECTION', 'COUNTER_TERROR'];
  return unconventionalTypes.indexOf(opType.id) >= 0;
}

// --- Viability Impact Assessment ---

function assessOptionOutcome(op, success) {
  var deviated = op.deviatedFromVigil;
  var delta = 0;

  if (success) {
    if (!deviated) {
      delta = randInt(2, 4);  // Followed Vigil + success
    } else {
      delta = randInt(1, 2);  // Deviated + success (less reward)
    }
  } else {
    if (!deviated) {
      delta = -randInt(1, 3); // Followed Vigil + failure (mild penalty)
    } else {
      delta = -randInt(5, 10); // Deviated + failure (severe penalty)
    }
  }

  V.resources.viability = clamp(V.resources.viability + delta, 0, 100);

  // Track deviation stats
  if (deviated) {
    V.viability.deviationCount++;
    V.playStats.recommendationsDeviated++;
  } else {
    V.playStats.recommendationsFollowed++;
  }

  return delta;
}
