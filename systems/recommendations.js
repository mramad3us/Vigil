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

  // Find all available assets with at least one required capability
  var eligible = getAvailableAssets().filter(function(a) {
    // Domestic agencies only available for domestic ops
    if (a.domesticAuthority && !op.domestic) return false;
    for (var i = 0; i < required.length; i++) {
      if (a.capabilities.indexOf(required[i]) >= 0) return true;
    }
    return false;
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
    // Domestic ops: penalize non-domestic-authority assets heavily
    if (op.domestic && !a.domesticAuthority) {
      capScore -= 40;
    }
    var dist = haversineKm(a.currentLat, a.currentLon, destLat, destLon);
    var distPenalty = Math.min(dist / 500, 20); // closer = better
    return { asset: a, score: capScore - distPenalty, dist: dist };
  });

  scored.sort(function(a, b) { return b.score - a.score; });

  var options = [];

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

  // Check all required capabilities are covered
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
    consequences.push('Significant budget expenditure required.');
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
