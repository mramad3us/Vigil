/* ============================================================
   VIGIL — systems/diplomacy.js
   Country relationships, stance tiers, permissions, clearance
   requests, diplomatic consequences, disclosure mechanics.
   ============================================================ */

// --- Stance Tiers (worst → best) ---

var STANCE_TIERS = [
  { id: 'AT_WAR',          level: 0, label: 'AT WAR',          covertRisk: 0.95, color: 'var(--red)' },
  { id: 'HOSTILE',         level: 1, label: 'HOSTILE',         covertRisk: 0.80, color: 'var(--red)' },
  { id: 'TENSE',           level: 2, label: 'TENSE',           covertRisk: 0.60, color: 'var(--severity-high)' },
  { id: 'NEUTRAL',         level: 3, label: 'NEUTRAL',         covertRisk: 0.45, color: 'var(--amber)' },
  { id: 'FRIENDLY',        level: 4, label: 'FRIENDLY',        covertRisk: 0.30, color: 'var(--accent)' },
  { id: 'ALLIED_ECONOMIC', level: 5, label: 'ALLIED (ECON)',   covertRisk: 0.20, color: 'var(--accent)' },
  { id: 'ALLIED_MILITARY', level: 6, label: 'ALLIED (MIL)',    covertRisk: 0.15, color: 'var(--green)' },
  { id: 'ALLIED_FULL',     level: 7, label: 'ALLIED (FULL)',   covertRisk: 0.10, color: 'var(--green)' },
];

function getStanceTier(level) {
  return STANCE_TIERS[clamp(level, 0, 7)];
}

// --- Permissions per stance level ---

function getStancePermissions(level, theaterId) {
  // At DEFCON <= 3, grant covert ops in hostile countries with reduced risk
  var defconCovertOverride = false;
  if (theaterId && V.theaters[theaterId] && V.theaters[theaterId].defcon <= 3) {
    defconCovertOverride = true;
  }

  var covertRisk = getStanceTier(level).covertRisk;
  if (defconCovertOverride && level <= 2) {
    covertRisk = Math.max(0.10, covertRisk * 0.5); // 50% reduced risk at elevated DEFCON
  }

  return {
    covertOps: true,  // always allowed, but risky at low stances
    station: level >= 6,
    overtOps: level >= 6,
    covertRisk: covertRisk,
    defconCovertAuth: defconCovertOverride,
  };
}

// --- Initial Country Stances ---

var INITIAL_STANCES = {
  // ALLIED_FULL (7)
  'United States': 7, 'Canada': 7, 'United Kingdom': 7,
  'Japan': 7, 'South Korea': 7, 'Australia': 7,
  // ALLIED_MILITARY (6)
  'Germany': 6, 'France': 6, 'Poland': 6, 'Italy': 6, 'Spain': 6, 'Turkey': 6,
  // ALLIED_ECONOMIC (5)
  'Israel': 5, 'Saudi Arabia': 5, 'India': 5, 'Brazil': 5,
  'Mexico': 5, 'Egypt': 5, 'Kenya': 5, 'South Africa': 5,
  'Argentina': 5, 'Nigeria': 5,
  // FRIENDLY (4)
  'Taiwan': 4, 'Georgia': 4, 'Ukraine': 4, 'Colombia': 4,
  'Iraq': 4, 'Ethiopia': 4, 'Bangladesh': 4, 'Kazakhstan': 4,
  // NEUTRAL (3)
  'Pakistan': 3, 'Lebanon': 3, 'Mali': 3, 'Libya': 3,
  // TENSE (2)
  'Venezuela': 2, 'Cuba': 2, 'Syria': 2, 'Yemen': 2,
  'Somalia': 2, 'Afghanistan': 2, 'Belarus': 2, 'China': 2,
  // HOSTILE (1)
  'Iran': 1, 'Russia': 1,
  // AT_WAR (0)
  'North Korea': 0,
};

// --- Initialize Diplomacy State ---

(function() {

  hook('game:start', function() {
    if (V.initialized) return;

    V.diplomacy = {};
    for (var country in INITIAL_STANCES) {
      V.diplomacy[country] = {
        stance: INITIAL_STANCES[country],
        stanceHistory: [],
        pendingClearance: null,
        lastIncident: null,
        missions: [],
      };
    }
  }, 1); // Early — before assets

  // --- Process Pending Clearances ---

  hook('tick:hour', function() {
    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
      // Expire granted clearances after 1 year (525600 minutes)
      if (cd.pendingClearance && cd.pendingClearance.status === 'GRANTED' && cd.pendingClearance.grantedAt) {
        if (V.time.totalMinutes - cd.pendingClearance.grantedAt >= 525600) {
          cd.pendingClearance = null;
          addLog('DIPLOMACY: ' + country + ' clearance expired after 1 year of inactivity.', 'log-info');
          continue;
        }
      }
      if (!cd.pendingClearance || cd.pendingClearance.status !== 'PENDING') continue;

      var now = V.time.totalMinutes;
      if (now >= cd.pendingClearance.estimatedCompletion) {
        // Roll for approval
        var approvalChance = getClearanceApprovalChance(cd.stance, country);
        if (Math.random() < approvalChance) {
          cd.pendingClearance.status = 'GRANTED';
          cd.pendingClearance.grantedAt = V.time.totalMinutes;
          addLog('DIPLOMACY: ' + country + ' has GRANTED clearance for operation.', 'log-info');
          pushFeedItem({
            id: uid('FI'),
            type: 'DIPLOMATIC',
            severity: 'ROUTINE',
            header: 'CLEARANCE GRANTED: ' + country,
            body: country + ' has authorized the requested military operation. Overt assets may be deployed without diplomatic penalty.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
          });
        } else {
          cd.pendingClearance.status = 'DENIED';
          addLog('DIPLOMACY: ' + country + ' has DENIED clearance request.', 'log-warn');
          pushFeedItem({
            id: uid('FI'),
            type: 'DIPLOMATIC',
            severity: 'ELEVATED',
            header: 'CLEARANCE DENIED: ' + country,
            body: country + ' has denied the requested operational clearance. Deploying overt assets will be considered a sovereignty violation.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
          });
        }
      }
    }
  }, 9);

  // --- Diplomatic Consequences on Operation Resolution ---

  hook('operation:resolved', function(data) {
    var op = data.operation;
    if (!op.location || !op.location.country) return;
    var country = op.location.country;
    if (country === 'United States') return; // Domestic ops — no diplomatic issue

    // Check if any assigned assets are overt
    var hasOvert = false;
    if (op.assignedAssetIds) {
      for (var i = 0; i < op.assignedAssetIds.length; i++) {
        var asset = getAsset(op.assignedAssetIds[i]);
        if (asset && asset.deniability === 'OVERT') { hasOvert = true; break; }
      }
    }

    if (!hasOvert) {
      // Covert op — check exposure on failure
      if (op.status === 'FAILURE') {
        var cd = V.diplomacy[country];
        if (cd) {
          var covertRisk = getStancePermissions(cd.stance).covertRisk;
          if (Math.random() > covertRisk) {
            // Exposed!
            shiftStance(country, -2);
            fireDiplomaticIncident(country, 'COVERT_EXPOSED', op);
          }
        }
      }
      return;
    }

    // Overt operation
    var cd = V.diplomacy[country];
    if (!cd) return;
    var perms = getStancePermissions(cd.stance);
    var hasClearance = cd.pendingClearance && cd.pendingClearance.status === 'GRANTED';
    var authorized = perms.overtOps || hasClearance;

    if (authorized) {
      if (op.status === 'SUCCESS') {
        shiftStance(country, 1);
      } else {
        shiftStance(country, -1);
        fireDiplomaticIncident(country, 'OVERT_AUTH_FAILURE', op);
      }
    } else {
      // Unauthorized overt deployment
      if (op.status === 'SUCCESS') {
        shiftStance(country, -3);
        fireDiplomaticIncident(country, 'SOVEREIGNTY_VIOLATION', op);
      } else {
        shiftStance(country, -5);
        fireDiplomaticIncident(country, 'CATASTROPHIC_VIOLATION', op);
      }
    }

    // Clear clearance tied to this specific op
    if (cd.pendingClearance && cd.pendingClearance.opId === op.id) {
      cd.pendingClearance = null;
    }
  });

})();

// --- Public API ---

function getCountryStance(country) {
  var cd = V.diplomacy[country];
  if (!cd) return getStanceTier(3); // Default NEUTRAL for unknown
  return getStanceTier(cd.stance);
}

function getCountryPermissions(country) {
  var cd = V.diplomacy[country];
  if (!cd) return getStancePermissions(3);
  var perms = getStancePermissions(cd.stance);
  // Granted clearance overrides overtOps
  if (!perms.overtOps && cd.pendingClearance && cd.pendingClearance.status === 'GRANTED') {
    perms.overtOps = true;
    perms.clearanceGranted = true;
  }
  return perms;
}

function canDeployOvert(country) {
  if (country === 'United States') return true;
  var cd = V.diplomacy[country];
  if (!cd) return false;
  var perms = getStancePermissions(cd.stance);
  return perms.overtOps || (cd.pendingClearance && cd.pendingClearance.status === 'GRANTED');
}

function shiftStance(country, delta) {
  var cd = V.diplomacy[country];
  if (!cd) return;
  var prev = cd.stance;
  cd.stance = clamp(cd.stance + delta, 0, 7);
  if (cd.stance !== prev) {
    cd.stanceHistory.push({
      from: prev,
      to: cd.stance,
      day: V.time.day,
      hour: V.time.hour,
    });
    addLog('DIPLOMACY: ' + country + ' stance ' + (delta > 0 ? 'improved' : 'degraded') +
      ' (' + getStanceTier(prev).label + ' → ' + getStanceTier(cd.stance).label + ').', delta > 0 ? 'log-info' : 'log-warn');
  }
}

function fireDiplomaticIncident(country, type, op) {
  var cd = V.diplomacy[country];
  if (cd) {
    cd.lastIncident = { type: type, day: V.time.day, opId: op ? op.id : null };
  }

  var stance = getCountryStance(country);
  var incidentMessages = {
    SOVEREIGNTY_VIOLATION: 'Unauthorized deployment of overt military assets into ' + country + ' constitutes a sovereignty violation. ' +
      'Diplomatic relations have deteriorated significantly. Stance now: ' + stance.label + '.',
    CATASTROPHIC_VIOLATION: 'CATASTROPHIC: Failed unauthorized overt operation in ' + country + ' has been exposed internationally. ' +
      'Severe diplomatic fallout. Multiple allied nations are reconsidering security cooperation. Stance now: ' + stance.label + '.',
    OVERT_AUTH_FAILURE: 'Authorized operation in ' + country + ' failed to achieve objectives. ' +
      'While authorized, the failure has strained relations. Stance now: ' + stance.label + '.',
    COVERT_EXPOSED: 'A covert operation in ' + country + ' has been exposed following operational failure. ' +
      country + ' has summoned the US ambassador and is demanding an explanation. Stance now: ' + stance.label + '.',
  };

  var body = incidentMessages[type] || 'Diplomatic incident with ' + country + '. Stance: ' + stance.label + '.';

  var severity = (type === 'CATASTROPHIC_VIOLATION') ? 'CRITICAL' :
                 (type === 'SOVEREIGNTY_VIOLATION' || type === 'COVERT_EXPOSED') ? 'HIGH' : 'ELEVATED';

  var feedItem = {
    id: uid('FI'),
    type: 'DIPLOMATIC',
    severity: severity,
    header: 'DIPLOMATIC INCIDENT: ' + country,
    body: body,
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: op ? op.id : null,
  };

  if (severity === 'CRITICAL') {
    queueUrgentAlert(feedItem);
  }
  pushFeedItem(feedItem);
  fire('diplomatic:incident', { country: country, type: type, op: op });
}

// --- Clearance System ---

function requestClearance(country, opId) {
  var cd = V.diplomacy[country];
  if (!cd) return null;
  if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') return cd.pendingClearance;

  // Completion time by stance
  var delayRanges = {
    7: [60, 120],     // ALLIED_FULL: 1-2h
    6: [120, 360],    // ALLIED_MILITARY: 2-6h
    5: [360, 720],    // ALLIED_ECONOMIC: 6-12h
    4: [720, 1440],   // FRIENDLY: 12-24h
    3: [1440, 2880],  // NEUTRAL: 24-48h
    2: [1440, 2880],  // TENSE: 24-48h
    1: [1440, 2880],  // HOSTILE: 24-48h
    0: [1440, 2880],  // AT_WAR: 24-48h
  };

  var range = delayRanges[cd.stance] || delayRanges[3];
  var delayMinutes = randInt(range[0], range[1]);

  cd.pendingClearance = {
    opId: opId,
    requestedAt: V.time.totalMinutes,
    estimatedCompletion: V.time.totalMinutes + delayMinutes,
    status: 'PENDING',
  };

  addLog('DIPLOMACY: Clearance requested from ' + country + '. ETA: ' + formatTransitTime(delayMinutes) + '.', 'log-info');

  pushFeedItem({
    id: uid('FI'),
    type: 'DIPLOMATIC',
    severity: 'ROUTINE',
    header: 'CLEARANCE REQUESTED: ' + country,
    body: 'Diplomatic clearance has been requested from ' + country + ' for overt military operations. ' +
      'Estimated response time: ' + formatTransitTime(delayMinutes) + '. Stance: ' + getStanceTier(cd.stance).label + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: opId,
  });

  return cd.pendingClearance;
}

function getClearanceApprovalChance(stance, country) {
  var chances = { 7: 0.95, 6: 0.70, 5: 0.50, 4: 0.30, 3: 0.20, 2: 0.15, 1: 0.10, 0: 0.10 };
  var base = chances[stance] || 0.10;

  // Active disclosed threats targeting this country boost approval by 10% each
  if (country && V.threats) {
    for (var i = 0; i < V.threats.length; i++) {
      var t = V.threats[i];
      if (t.foreignTarget && t.foreignTarget.disclosed && t.foreignTarget.country === country &&
          (t.phase === 'INTEL' || t.phase === 'OPS')) {
        base = Math.min(0.95, base + 0.10);
      }
    }
  }

  return base;
}

function getClearanceStatus(country) {
  var cd = V.diplomacy[country];
  if (!cd || !cd.pendingClearance) return null;
  return cd.pendingClearance;
}

// --- Foreign Target Disclosure ---

function discloseToCountry(threatId, disclosureType) {
  var threat = getThreat(threatId);
  if (!threat || !threat.foreignTarget) return;

  var country = threat.foreignTarget.country;

  if (disclosureType === 'OFFICIAL') {
    if (V.resources.intel < 10) return false;
    threat.foreignTarget.disclosed = true;
    threat.foreignTarget.disclosureType = disclosureType;
    V.resources.intel -= 10;
    shiftStance(country, 2);
    addLog('DIPLOMACY: Official disclosure to ' + country + ' regarding threat ' + threat.orgName + '. Stance +2.', 'log-info');
    pushFeedItem({
      id: uid('FI'),
      type: 'DIPLOMATIC',
      severity: 'ROUTINE',
      header: 'OFFICIAL DISCLOSURE: ' + country,
      body: 'Intelligence on ' + threat.orgName + ' has been officially shared with ' + country + ' through diplomatic channels. ' +
        'This disclosure cost 10 INTEL but has significantly improved bilateral relations.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      threatId: threatId,
    });
  } else if (disclosureType === 'ANONYMOUS') {
    threat.foreignTarget.disclosed = true;
    threat.foreignTarget.disclosureType = disclosureType;
    shiftStance(country, 0); // +0.5 rounded to 0, but we can give +1 for gameplay
    // Actually let's do a partial: track fractional internally
    var cd = V.diplomacy[country];
    if (cd) {
      // Small positive gesture — shift by 1 on a coin flip
      if (Math.random() < 0.5) shiftStance(country, 1);
    }
    addLog('DIPLOMACY: Anonymous intel leak to ' + country + ' regarding ' + threat.orgName + '.', 'log-info');
  }
  // DO_NOTHING — no action needed

  return true;
}

// --- Diplomatic Mission System ---

function getOutreachCost(stanceLevel) {
  var costs = { 7: 5, 6: 10, 5: 10, 4: 15, 3: 20, 2: 25, 1: 30, 0: null };
  return costs[stanceLevel] !== undefined ? costs[stanceLevel] : null;
}

function getOutreachSuccessChance(mode, diplomaticEffectiveness) {
  var eff = diplomaticEffectiveness || 0;
  if (mode === 'IN_PERSON') return 0.40 + (eff * 0.08);
  return 0.20 + (eff * 0.06);
}

function getDiplomaticAssets() {
  if (!V.assets) return [];
  return V.assets.filter(function(a) {
    return (a.status === 'STATIONED' || a.status === 'RETURNING') &&
           a.category === 'DIPLOMATIC';
  });
}

function hasActiveMission(country, type) {
  var cd = V.diplomacy[country];
  if (!cd || !cd.missions) return false;
  for (var i = 0; i < cd.missions.length; i++) {
    var m = cd.missions[i];
    if (m.type === type && (m.status === 'IN_TRANSIT' || m.status === 'EXECUTING')) return true;
  }
  return false;
}

function getCountryCapital(country) {
  for (var tid in THEATERS) {
    var theater = THEATERS[tid];
    for (var i = 0; i < theater.cities.length; i++) {
      if (theater.cities[i].country === country) {
        return { lat: theater.cities[i].lat, lon: theater.cities[i].lon, city: theater.cities[i].city };
      }
    }
  }
  return { lat: 0, lon: 0, city: country };
}

function getCountryTheater(country) {
  for (var tid in THEATERS) {
    if (THEATERS[tid].countries.indexOf(country) >= 0) return tid;
  }
  return null;
}

function startDiplomaticOutreach(country, assetId, mode) {
  var cd = V.diplomacy[country];
  if (!cd) return null;
  if (cd.stance <= 0) return null; // Can't outreach AT_WAR
  if (hasActiveMission(country, 'OUTREACH')) return null;

  var cost = getOutreachCost(cd.stance);
  if (cost === null) return null;
  if (V.resources.intel < cost) return null;

  V.resources.intel -= cost;

  var now = V.time.totalMinutes;
  var executionDuration = randInt(240, 480); // 4-8h
  var dipEff = 0;

  var mission = {
    id: uid('DM'),
    type: 'OUTREACH',
    assetId: assetId || null,
    mode: mode || 'REMOTE',
    status: 'EXECUTING',
    startedAt: now,
    completionAt: now + randInt(120, 240), // 2-4h for remote
    successChance: 0,
    intelCost: cost,
  };

  if (mode === 'IN_PERSON' && assetId) {
    var asset = getAsset(assetId);
    if (!asset) return null;
    dipEff = asset.diplomaticEffectiveness || 0;

    var capital = getCountryCapital(country);
    var transitMin = calcTransitMinutes(asset, capital.lat, capital.lon);

    // Deploy asset
    asset.status = 'IN_TRANSIT';
    asset.assignedOpId = null;
    asset.currentBaseId = null;
    asset.originLat = asset.currentLat;
    asset.originLon = asset.currentLon;
    asset.destinationLat = capital.lat;
    asset.destinationLon = capital.lon;
    asset.transitStartTotalMinutes = now;
    asset.transitDurationMinutes = transitMin;

    mission.status = 'IN_TRANSIT';
    mission.completionAt = null; // Set when asset arrives
    mission._executionDuration = executionDuration;
  } else {
    dipEff = 2; // Remote baseline
  }

  mission.successChance = getOutreachSuccessChance(mode, dipEff);

  if (!cd.missions) cd.missions = [];
  cd.missions.push(mission);

  addLog('DIPLOMACY: Outreach initiated with ' + country + ' (' + mode + '). Cost: ' + cost + ' INTEL.', 'log-info');
  pushFeedItem({
    id: uid('FI'),
    type: 'DIPLOMATIC',
    severity: 'ROUTINE',
    header: 'DIPLOMATIC OUTREACH: ' + country,
    body: 'Diplomatic outreach to ' + country + ' has been initiated (' + mode.toLowerCase().replace('_', '-') +
      '). Objective: improve bilateral relations. Current stance: ' + getStanceTier(cd.stance).label + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });

  return mission;
}

function requestProactiveClearance(country, assetId) {
  var cd = V.diplomacy[country];
  if (!cd) return null;
  if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') return cd.pendingClearance;

  var delayRanges = {
    7: [60, 120], 6: [120, 360], 5: [360, 720], 4: [720, 1440],
    3: [1440, 2880], 2: [1440, 2880], 1: [1440, 2880], 0: [1440, 2880],
  };

  var range = delayRanges[cd.stance] || delayRanges[3];
  var delayMinutes = randInt(range[0], range[1]);

  // IN_PERSON reduces delay by 40-60%
  var mode = 'REMOTE';
  if (assetId) {
    var asset = getAsset(assetId);
    if (asset && asset.category === 'DIPLOMATIC') {
      mode = 'IN_PERSON';
      var reduction = 0.40 + (Math.random() * 0.20);
      delayMinutes = Math.round(delayMinutes * (1 - reduction));

      var capital = getCountryCapital(country);
      var transitMin = calcTransitMinutes(asset, capital.lat, capital.lon);
      delayMinutes += transitMin;

      // Deploy asset
      var now = V.time.totalMinutes;
      asset.status = 'IN_TRANSIT';
      asset.assignedOpId = null;
      asset.currentBaseId = null;
      asset.originLat = asset.currentLat;
      asset.originLon = asset.currentLon;
      asset.destinationLat = capital.lat;
      asset.destinationLon = capital.lon;
      asset.transitStartTotalMinutes = now;
      asset.transitDurationMinutes = transitMin;
    }
  }

  cd.pendingClearance = {
    opId: null, // Proactive — not tied to a specific op
    requestedAt: V.time.totalMinutes,
    estimatedCompletion: V.time.totalMinutes + delayMinutes,
    status: 'PENDING',
    assetId: assetId || null,
    mode: mode,
  };

  addLog('DIPLOMACY: Proactive clearance requested from ' + country + ' (' + mode + '). ETA: ' + formatTransitTime(delayMinutes) + '.', 'log-info');
  pushFeedItem({
    id: uid('FI'),
    type: 'DIPLOMATIC',
    severity: 'ROUTINE',
    header: 'CLEARANCE REQUESTED: ' + country,
    body: 'Proactive diplomatic clearance has been requested from ' + country + ' for future overt operations (' +
      mode.toLowerCase().replace('_', '-') + '). Estimated response time: ' + formatTransitTime(delayMinutes) +
      '. Stance: ' + getStanceTier(cd.stance).label + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });

  return cd.pendingClearance;
}

// --- Diplomatic Mission Tick Processing ---

(function() {

  hook('tick:hour', function() {
    var now = V.time.totalMinutes;

    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
      if (!cd.missions) continue;

      for (var i = cd.missions.length - 1; i >= 0; i--) {
        var m = cd.missions[i];

        if (m.status === 'IN_TRANSIT') {
          // Check if asset has arrived
          if (m.assetId) {
            var asset = getAsset(m.assetId);
            if (asset && (asset.status === 'DEPLOYED' || asset.status === 'STATIONED' ||
                (asset.status === 'IN_TRANSIT' && asset.transitStartTotalMinutes + asset.transitDurationMinutes <= now))) {
              m.status = 'EXECUTING';
              m.completionAt = now + (m._executionDuration || randInt(240, 480));
            }
          }
        }

        if (m.status === 'EXECUTING' && m.completionAt && now >= m.completionAt) {
          // Roll success/failure
          if (Math.random() < m.successChance) {
            m.status = 'SUCCESS';
            shiftStance(country, 1);
            pushFeedItem({
              id: uid('FI'),
              type: 'DIPLOMATIC',
              severity: 'ROUTINE',
              header: 'OUTREACH SUCCESS: ' + country,
              body: 'Diplomatic outreach to ' + country + ' has concluded successfully. Bilateral relations have improved. New stance: ' + getStanceTier(cd.stance).label + '.',
              timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
              read: false,
            });
            addLog('DIPLOMACY: Outreach to ' + country + ' succeeded. Stance improved to ' + getStanceTier(cd.stance).label + '.', 'log-info');
          } else {
            m.status = 'FAILURE';
            pushFeedItem({
              id: uid('FI'),
              type: 'DIPLOMATIC',
              severity: 'ELEVATED',
              header: 'OUTREACH FAILED: ' + country,
              body: 'Diplomatic outreach to ' + country + ' did not achieve the desired outcome. Relations unchanged. Stance: ' + getStanceTier(cd.stance).label + '.',
              timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
              read: false,
            });
            addLog('DIPLOMACY: Outreach to ' + country + ' failed. No stance change.', 'log-warn');
          }

          // Return asset to base
          if (m.assetId) {
            returnAssetsToBase([m.assetId]);
          }

          fire('diplomatic:mission:complete', { country: country, mission: m });
        }
      }
    }
  }, 8);

  // Listen to asset:arrived for IN_TRANSIT → EXECUTING transition
  hook('asset:arrived', function(data) {
    if (!data || !data.asset) return;
    var asset = data.asset;
    if (asset.category !== 'DIPLOMATIC') return;

    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
      if (!cd.missions) continue;
      for (var i = 0; i < cd.missions.length; i++) {
        var m = cd.missions[i];
        if (m.assetId === asset.id && m.status === 'IN_TRANSIT') {
          m.status = 'EXECUTING';
          m.completionAt = V.time.totalMinutes + (m._executionDuration || randInt(240, 480));
        }
      }
    }
  });

  // Return clearance assets when clearance resolves
  hook('tick:hour', function() {
    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
      if (!cd.pendingClearance) continue;
      if (cd.pendingClearance.status !== 'GRANTED' && cd.pendingClearance.status !== 'DENIED') continue;
      if (cd.pendingClearance.assetId) {
        var asset = getAsset(cd.pendingClearance.assetId);
        if (asset && asset.status !== 'STATIONED' && asset.status !== 'RETURNING') {
          returnAssetsToBase([cd.pendingClearance.assetId]);
        }
        cd.pendingClearance.assetId = null;
      }
    }
  }, 10);

})();
