/* ============================================================
   VIGIL — systems/diplomacy.js
   Country relationships, continuous relations (0-100%),
   stance derivation, permissions, clearance requests,
   diplomatic consequences, disclosure, war/ceasefire/peace,
   alliances, diplomatic gifts.
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
  var defconCovertOverride = false;
  if (theaterId && V.theaters[theaterId] && V.theaters[theaterId].defcon <= 3) {
    defconCovertOverride = true;
  }

  var covertRisk = getStanceTier(level).covertRisk;
  if (defconCovertOverride && level <= 2) {
    covertRisk = Math.max(0.10, covertRisk * 0.5);
  }

  return {
    covertOps: true,
    station: level >= 6,
    overtOps: level >= 6,
    covertRisk: covertRisk,
    defconCovertAuth: defconCovertOverride,
  };
}

// --- Initial Country Relations (0-100%) ---

var INITIAL_RELATIONS = {
  // ALLIED_FULL (90%)
  'Canada': { relations: 90 },
  'United Kingdom': { relations: 90 },
  'Japan': { relations: 90 },
  'South Korea': { relations: 90 },
  'Australia': { relations: 90 },
  // ALLIED_MILITARY (75%)
  'Germany': { relations: 75 },
  'France': { relations: 75 },
  'Poland': { relations: 75 },
  'Italy': { relations: 75 },
  'Spain': { relations: 75 },
  'Turkey': { relations: 75 },
  // ALLIED_ECONOMIC (65%)
  'Israel': { relations: 65 },
  'Saudi Arabia': { relations: 65 },
  'India': { relations: 65 },
  'Brazil': { relations: 65 },
  'Mexico': { relations: 65 },
  'Egypt': { relations: 65 },
  'Kenya': { relations: 65 },
  'South Africa': { relations: 65 },
  'Argentina': { relations: 65 },
  'Nigeria': { relations: 65 },
  // FRIENDLY (50%)
  'Taiwan': { relations: 50 },
  'Georgia': { relations: 50 },
  'Ukraine': { relations: 50 },
  'Colombia': { relations: 50 },
  'Iraq': { relations: 50 },
  'Ethiopia': { relations: 50 },
  'Bangladesh': { relations: 50 },
  'Kazakhstan': { relations: 50 },
  // NEUTRAL (35%)
  'Pakistan': { relations: 35 },
  'Lebanon': { relations: 35 },
  'Mali': { relations: 35 },
  'Libya': { relations: 35 },
  // TENSE (20%)
  'Venezuela': { relations: 20 },
  'Cuba': { relations: 20 },
  'Syria': { relations: 20 },
  'Yemen': { relations: 20 },
  'Somalia': { relations: 20 },
  'Afghanistan': { relations: 20 },
  'Belarus': { relations: 20 },
  'China': { relations: 20 },
  // HOSTILE (10%)
  'Iran': { relations: 10 },
  'Russia': { relations: 10 },
  // AT_WAR (5%)
  'North Korea': { relations: 5, atWar: true },
};

// --- Derive Stance from Relations + Flags ---

function deriveStance(country) {
  var cd = V.diplomacy[country];
  if (!cd) return 3;
  if (cd.atWar) return 0;
  if (cd.alliance === 'FULL')     return 7;
  if (cd.alliance === 'MILITARY') return 6;
  if (cd.alliance === 'ECONOMIC') return 5;
  if (cd.relations >= 50) return 4;
  if (cd.relations >= 30) return 3;
  if (cd.relations >= 15) return 2;
  return 1;
}

// --- Shift Relations (replaces shiftStance) ---

function shiftRelations(country, delta, reason) {
  var cd = V.diplomacy[country];
  if (!cd) return;
  var prev = cd.relations;
  cd.relations = clamp(Math.round(cd.relations + delta), 0, 100);
  if (cd.relations !== prev) {
    cd.relationsHistory.push({
      from: prev,
      to: cd.relations,
      day: V.time.day,
      hour: V.time.hour,
      reason: reason || '',
    });
    if (cd.relationsHistory.length > 50) cd.relationsHistory.shift();
    addLog('DIPLOMACY: ' + country + ' relations ' + (delta > 0 ? 'improved' : 'degraded') +
      ' (' + prev + '% → ' + cd.relations + '%).', delta > 0 ? 'log-info' : 'log-warn');
  }
}

// --- Betrayal Penalty ---

function calcBetrayalPenalty(country, baseDelta) {
  var cd = V.diplomacy[country];
  if (!cd) return baseDelta;
  var multiplier = 1.0 + (cd.relations / 100);
  return Math.round(baseDelta * multiplier);
}

// --- War / Ceasefire / Peace ---

function declareWar(country) {
  var cd = V.diplomacy[country];
  if (!cd || cd.atWar || cd.relations >= 15) return;
  cd.atWar = true;
  cd.relations = 0;
  cd.alliance = null;
  cd.ceasefire = null;
  cd.peaceTreaty = null;
  cd.relationsHistory.push({ from: cd.relations, to: 0, day: V.time.day, hour: V.time.hour, reason: 'War declared' });
  addLog('DIPLOMACY: The United States has declared war on ' + country + '.', 'log-warn');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'CRITICAL',
    header: 'WAR DECLARED: ' + country,
    body: 'The United States has formally declared war on ' + country + '. All diplomatic relations are severed. Military operations are authorized without restriction.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
  fire('diplomacy:war', { country: country });
}

function proposeCeasefire(country) {
  var cd = V.diplomacy[country];
  if (!cd || !cd.atWar) return false;
  if (V.resources.intel < 15) return false;
  V.resources.intel -= 15;
  cd.atWar = false;
  cd.ceasefire = { startDay: V.time.day, expiryDay: V.time.day + 30 };
  cd.relations = 10;
  cd.relationsHistory.push({ from: 0, to: 10, day: V.time.day, hour: V.time.hour, reason: 'Ceasefire agreed' });
  addLog('DIPLOMACY: Ceasefire established with ' + country + '. Hostilities suspended for 30 days.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ELEVATED',
    header: 'CEASEFIRE: ' + country,
    body: 'A ceasefire has been established with ' + country + '. Hostilities are suspended for 30 days. Relations reset to 10%. Use this window to pursue peace.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
  fire('diplomacy:ceasefire', { country: country });
  return true;
}

function proposePeace(country) {
  var cd = V.diplomacy[country];
  if (!cd || cd.atWar) return false;
  if (V.resources.intel < 25) return false;
  V.resources.intel -= 25;
  cd.peaceTreaty = { startDay: V.time.day, expiryDay: V.time.day + 90 };
  cd.ceasefire = null;
  shiftRelations(country, 10, 'Peace treaty signed');
  addLog('DIPLOMACY: Peace treaty signed with ' + country + '. Relations +10%.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'PEACE TREATY: ' + country,
    body: 'A peace treaty has been signed with ' + country + '. Sovereignty violation penalties halved for 90 days. Relations improved by 10%.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
  fire('diplomacy:peace', { country: country });
  return true;
}

// --- Alliance System ---

function proposeAlliance(country, tier) {
  var cd = V.diplomacy[country];
  if (!cd || cd.atWar) return false;
  var thresholds = { 'ECONOMIC': 60, 'MILITARY': 70, 'FULL': 80 };
  var minRelations = thresholds[tier];
  if (!minRelations || cd.relations < minRelations) return false;
  if (V.resources.intel < 10) return false;

  // Check upgrade path
  if (tier === 'MILITARY' && cd.alliance !== 'ECONOMIC') return false;
  if (tier === 'FULL' && cd.alliance !== 'MILITARY') return false;
  if (tier === 'ECONOMIC' && cd.alliance) return false;

  V.resources.intel -= 10;
  // Acceptance probability: 70% at threshold, 95% at threshold+20
  var acceptChance = Math.min(0.95, 0.70 + ((cd.relations - minRelations) / 20) * 0.25);
  if (Math.random() < acceptChance) {
    cd.alliance = tier;
    addLog('DIPLOMACY: ' + country + ' accepted ' + tier + ' alliance proposal.', 'log-info');
    pushFeedItem({
      id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
      header: 'ALLIANCE FORMED: ' + country,
      body: country + ' has accepted the ' + tier + ' alliance proposal. Bilateral cooperation will deepen across agreed domains.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
    });
    fire('diplomacy:alliance', { country: country, tier: tier });
    return true;
  } else {
    addLog('DIPLOMACY: ' + country + ' declined ' + tier + ' alliance proposal.', 'log-warn');
    pushFeedItem({
      id: uid('FI'), type: 'DIPLOMATIC', severity: 'ELEVATED',
      header: 'ALLIANCE DECLINED: ' + country,
      body: country + ' has declined the ' + tier + ' alliance proposal at this time. Relations are unchanged.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
    });
    return false;
  }
}

function acceptAllianceProposal(country) {
  var cd = V.diplomacy[country];
  if (!cd || !cd.pendingProposal) return;
  cd.alliance = cd.pendingProposal;
  addLog('DIPLOMACY: Accepted ' + cd.pendingProposal + ' alliance with ' + country + '.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'ALLIANCE FORMED: ' + country,
    body: 'The ' + cd.pendingProposal + ' alliance with ' + country + ' has been formalized.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
  fire('diplomacy:alliance', { country: country, tier: cd.pendingProposal });
  cd.pendingProposal = null;
}

function declineAllianceProposal(country) {
  var cd = V.diplomacy[country];
  if (!cd || !cd.pendingProposal) return;
  addLog('DIPLOMACY: Declined ' + cd.pendingProposal + ' alliance proposal from ' + country + '.', 'log-info');
  cd.pendingProposal = null;
}

// --- Diplomatic Gift ---

function sendDiplomaticGift(country) {
  var cd = V.diplomacy[country];
  if (!cd || cd.atWar) return false;
  if (V.time.day - cd.lastGiftDay < 14) return false;
  if (V.resources.intel < 15) return false;
  V.resources.intel -= 15;
  cd.lastGiftDay = V.time.day;
  shiftRelations(country, 8, 'Diplomatic aid');
  addLog('DIPLOMACY: Diplomatic aid sent to ' + country + '. Relations +8%.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'DIPLOMATIC AID: ' + country,
    body: 'A diplomatic aid package has been dispatched to ' + country + '. Relations have improved by 8%.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
  return true;
}

// --- Initialize Diplomacy State ---

(function() {

  hook('game:start', function() {
    if (V.initialized) return;

    V.diplomacy = {};
    for (var country in INITIAL_RELATIONS) {
      var init = INITIAL_RELATIONS[country];
      V.diplomacy[country] = {
        relations: init.relations,
        atWar: init.atWar || false,
        ceasefire: null,
        peaceTreaty: null,
        alliance: init.relations >= 90 ? 'FULL' : init.relations >= 75 ? 'MILITARY' : init.relations >= 65 ? 'ECONOMIC' : null,
        lastGiftDay: 0,
        pendingClearance: null,
        lastIncident: null,
        missions: [],
        relationsHistory: [],
        pendingProposal: null,
      };
    }
  }, 1);

  // --- Process Pending Clearances ---

  hook('tick:hour', function() {
    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
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
        var stance = deriveStance(country);
        var approvalChance = getClearanceApprovalChance(stance, country);
        if (Math.random() < approvalChance) {
          cd.pendingClearance.status = 'GRANTED';
          cd.pendingClearance.grantedAt = V.time.totalMinutes;
          addLog('DIPLOMACY: ' + country + ' has GRANTED clearance for operation.', 'log-info');
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
            header: 'CLEARANCE GRANTED: ' + country,
            body: country + ' has authorized the requested military operation. Overt assets may be deployed without diplomatic penalty.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
          });
        } else {
          cd.pendingClearance.status = 'DENIED';
          addLog('DIPLOMACY: ' + country + ' has DENIED clearance request.', 'log-warn');
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'ELEVATED',
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
    if (country === 'United States' || country === 'International Waters') return;

    // No assets were ever deployed — no diplomatic consequences
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return;

    var hasOvert = false;
    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (asset && asset.deniability === 'OVERT') { hasOvert = true; break; }
    }

    if (!hasOvert) {
      if (op.status === 'FAILURE') {
        var cd = V.diplomacy[country];
        if (cd) {
          var stance = deriveStance(country);
          var covertRisk = getStancePermissions(stance).covertRisk;
          if (Math.random() > covertRisk) {
            var penalty = calcBetrayalPenalty(country, -10);
            shiftRelations(country, penalty, 'Covert op exposed');
            fireDiplomaticIncident(country, 'COVERT_EXPOSED', op);
          }
        }
      }
      return;
    }

    var cd = V.diplomacy[country];
    if (!cd) return;
    var stance = deriveStance(country);
    var perms = getStancePermissions(stance);
    var hasClearance = cd.pendingClearance && cd.pendingClearance.status === 'GRANTED';
    var authorized = perms.overtOps || hasClearance;

    if (authorized) {
      if (op.status === 'SUCCESS') {
        shiftRelations(country, 5, 'Authorized op success');
      }
    } else {
      // Unauthorized overt deployment — apply betrayal penalty
      if (cd.atWar) {
        // At war — minimal penalty, war is expected
        shiftRelations(country, -1, 'War-time overt operation');
      } else if (op.status === 'SUCCESS') {
        var basePenalty = -15;
        // Halve penalty during active peace treaty
        if (cd.peaceTreaty && V.time.day <= cd.peaceTreaty.expiryDay) {
          basePenalty = Math.round(basePenalty / 2);
        }
        var penalty = calcBetrayalPenalty(country, basePenalty);
        shiftRelations(country, penalty, 'Sovereignty violation');
        fireDiplomaticIncident(country, 'SOVEREIGNTY_VIOLATION', op);
      } else {
        var basePenalty = -25;
        if (cd.peaceTreaty && V.time.day <= cd.peaceTreaty.expiryDay) {
          basePenalty = Math.round(basePenalty / 2);
        }
        var penalty = calcBetrayalPenalty(country, basePenalty);
        shiftRelations(country, penalty, 'Catastrophic violation');
        fireDiplomaticIncident(country, 'CATASTROPHIC_VIOLATION', op);
      }
    }

    if (cd.pendingClearance && cd.pendingClearance.opId === op.id) {
      cd.pendingClearance = null;
    }
  });

  // --- Daily Tick: War AI, Ceasefire Expiry, Alliance Drift/Proposals/Dissolution ---

  hook('tick:day', function() {
    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];

      // AI declares war when relations < 10
      if (!cd.atWar && cd.relations < 10 && Math.random() < 0.15) {
        cd.atWar = true;
        cd.relations = 0;
        cd.alliance = null;
        cd.ceasefire = null;
        cd.peaceTreaty = null;
        cd.relationsHistory.push({ from: cd.relations, to: 0, day: V.time.day, hour: V.time.hour, reason: country + ' declared war' });
        addLog('DIPLOMACY: ' + country + ' has declared war on the United States.', 'log-warn');
        pushFeedItem({
          id: uid('FI'), type: 'DIPLOMATIC', severity: 'CRITICAL',
          header: 'WAR DECLARED: ' + country,
          body: country + ' has formally declared war on the United States. All diplomatic channels are severed.',
          timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
          read: false,
        });
        fire('diplomacy:war', { country: country, aiDeclared: true });
        continue;
      }

      // Ceasefire expiry
      if (cd.ceasefire && V.time.day >= cd.ceasefire.expiryDay) {
        cd.ceasefire = null;
        if (cd.relations < 15) {
          cd.atWar = true;
          cd.relations = 0;
          cd.relationsHistory.push({ from: cd.relations, to: 0, day: V.time.day, hour: V.time.hour, reason: 'Ceasefire expired — war resumed' });
          addLog('DIPLOMACY: Ceasefire with ' + country + ' has expired. War resumes.', 'log-warn');
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'HIGH',
            header: 'CEASEFIRE EXPIRED: ' + country,
            body: 'The ceasefire with ' + country + ' has expired without achieving peace. Hostilities have resumed.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
          });
        } else {
          addLog('DIPLOMACY: Ceasefire with ' + country + ' expired. Relations stable — no war resumption.', 'log-info');
        }
      }

      // Peace treaty expiry
      if (cd.peaceTreaty && V.time.day >= cd.peaceTreaty.expiryDay) {
        cd.peaceTreaty = null;
        addLog('DIPLOMACY: Peace treaty with ' + country + ' has expired.', 'log-info');
      }

      // Alliance weekly drift (+1% every 7 days)
      if (cd.alliance && V.time.day % 7 === 0) {
        shiftRelations(country, 1, 'Alliance drift');
      }

      // Alliance auto-dissolution below 50%
      if (cd.alliance && cd.relations < 50) {
        var oldAlliance = cd.alliance;
        cd.alliance = null;
        addLog('DIPLOMACY: ' + country + ' has suspended the ' + oldAlliance + ' alliance.', 'log-warn');
        pushFeedItem({
          id: uid('FI'), type: 'DIPLOMATIC', severity: 'ELEVATED',
          header: 'ALLIANCE SUSPENDED: ' + country,
          body: country + ' has suspended the ' + oldAlliance + ' alliance due to deteriorating relations.',
          timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
          read: false,
        });
      }

      // Country-initiated alliance proposals
      if (!cd.atWar && !cd.pendingProposal) {
        if (!cd.alliance && cd.relations >= 70 && Math.random() < 0.10) {
          cd.pendingProposal = 'ECONOMIC';
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
            header: 'ALLIANCE PROPOSAL: ' + country,
            body: country + ' has proposed an ECONOMIC alliance. Review the proposal in the Diplomacy workspace.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
            actions: [
              { label: 'ACCEPT', fn: 'acceptAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
              { label: 'DECLINE', fn: 'declineAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
            ],
          });
        } else if (cd.alliance === 'ECONOMIC' && cd.relations >= 80 && Math.random() < 0.08) {
          cd.pendingProposal = 'MILITARY';
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
            header: 'ALLIANCE UPGRADE: ' + country,
            body: country + ' has proposed upgrading to a MILITARY alliance.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
            actions: [
              { label: 'ACCEPT', fn: 'acceptAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
              { label: 'DECLINE', fn: 'declineAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
            ],
          });
        } else if (cd.alliance === 'MILITARY' && cd.relations >= 90 && Math.random() < 0.05) {
          cd.pendingProposal = 'FULL';
          pushFeedItem({
            id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
            header: 'ALLIANCE UPGRADE: ' + country,
            body: country + ' has proposed upgrading to a FULL alliance.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
            actions: [
              { label: 'ACCEPT', fn: 'acceptAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
              { label: 'DECLINE', fn: 'declineAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\')' },
            ],
          });
        }
      }
    }
  });

})();

// --- Public API ---

function getCountryStance(country) {
  var cd = V.diplomacy[country];
  if (!cd) return getStanceTier(3);
  return getStanceTier(deriveStance(country));
}

function getCountryPermissions(country) {
  var cd = V.diplomacy[country];
  if (!cd) return getStancePermissions(3);
  var stance = deriveStance(country);
  var perms = getStancePermissions(stance);
  if (!perms.overtOps && cd.pendingClearance && cd.pendingClearance.status === 'GRANTED') {
    perms.overtOps = true;
    perms.clearanceGranted = true;
  }
  return perms;
}

function canDeployOvert(country) {
  if (country === 'United States' || country === 'International Waters') return true;
  var cd = V.diplomacy[country];
  if (!cd) return false;
  var stance = deriveStance(country);
  var perms = getStancePermissions(stance);
  return perms.overtOps || (cd.pendingClearance && cd.pendingClearance.status === 'GRANTED');
}

function fireDiplomaticIncident(country, type, op) {
  var cd = V.diplomacy[country];
  if (cd) {
    cd.lastIncident = { type: type, day: V.time.day, opId: op ? op.id : null };
  }

  var stance = getCountryStance(country);
  var rel = cd ? cd.relations : 35;
  var incidentMessages = {
    SOVEREIGNTY_VIOLATION: 'Unauthorized deployment of overt military assets into ' + country + ' constitutes a sovereignty violation. ' +
      'Diplomatic relations have deteriorated significantly. Relations: ' + rel + '%. Stance: ' + stance.label + '.',
    CATASTROPHIC_VIOLATION: 'CATASTROPHIC: Failed unauthorized overt operation in ' + country + ' has been exposed internationally. ' +
      'Severe diplomatic fallout. Relations: ' + rel + '%. Stance: ' + stance.label + '.',
    OVERT_AUTH_FAILURE: 'Authorized operation in ' + country + ' failed to achieve objectives. ' +
      'While authorized, the failure has strained relations. Relations: ' + rel + '%. Stance: ' + stance.label + '.',
    COVERT_EXPOSED: 'A covert operation in ' + country + ' has been exposed following operational failure. ' +
      country + ' has summoned the US ambassador and is demanding an explanation. Relations: ' + rel + '%. Stance: ' + stance.label + '.',
  };

  var body = incidentMessages[type] || 'Diplomatic incident with ' + country + '. Relations: ' + rel + '%.';

  var severity = (type === 'CATASTROPHIC_VIOLATION') ? 'CRITICAL' :
                 (type === 'SOVEREIGNTY_VIOLATION' || type === 'COVERT_EXPOSED') ? 'HIGH' : 'ELEVATED';

  var feedItem = {
    id: uid('FI'), type: 'DIPLOMATIC', severity: severity,
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

  var stance = deriveStance(country);
  var delayRanges = {
    7: [60, 120], 6: [120, 360], 5: [360, 720], 4: [720, 1440],
    3: [1440, 2880], 2: [1440, 2880], 1: [1440, 2880], 0: [1440, 2880],
  };

  var range = delayRanges[stance] || delayRanges[3];
  var delayMinutes = randInt(range[0], range[1]);

  cd.pendingClearance = {
    opId: opId,
    requestedAt: V.time.totalMinutes,
    estimatedCompletion: V.time.totalMinutes + delayMinutes,
    status: 'PENDING',
  };

  addLog('DIPLOMACY: Clearance requested from ' + country + '. ETA: ' + formatTransitTime(delayMinutes) + '.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'CLEARANCE REQUESTED: ' + country,
    body: 'Diplomatic clearance has been requested from ' + country + ' for overt military operations. ' +
      'Estimated response time: ' + formatTransitTime(delayMinutes) + '. Relations: ' + cd.relations + '%. Stance: ' + getStanceTier(stance).label + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: opId,
  });

  return cd.pendingClearance;
}

function getClearanceApprovalChance(stance, country) {
  var chances = { 7: 0.95, 6: 0.70, 5: 0.50, 4: 0.30, 3: 0.20, 2: 0.15, 1: 0.10, 0: 0.10 };
  var base = chances[stance] || 0.10;

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
    shiftRelations(country, 10, 'Official disclosure: ' + threat.orgName);
    addLog('DIPLOMACY: Official disclosure to ' + country + ' regarding threat ' + threat.orgName + '. Relations +10%.', 'log-info');
    pushFeedItem({
      id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
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
    shiftRelations(country, 3, 'Anonymous disclosure: ' + threat.orgName);
    addLog('DIPLOMACY: Anonymous intel leak to ' + country + ' regarding ' + threat.orgName + '.', 'log-info');
  }

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
  var stance = deriveStance(country);
  if (cd.atWar) return null;
  if (hasActiveMission(country, 'OUTREACH')) return null;

  var cost = getOutreachCost(stance);
  if (cost === null) return null;
  if (V.resources.intel < cost) return null;

  V.resources.intel -= cost;

  var now = V.time.totalMinutes;
  var executionDuration = randInt(240, 480);
  var dipEff = 0;

  var mission = {
    id: uid('DM'),
    type: 'OUTREACH',
    assetId: assetId || null,
    mode: mode || 'REMOTE',
    status: 'EXECUTING',
    startedAt: now,
    completionAt: now + randInt(120, 240),
    successChance: 0,
    intelCost: cost,
  };

  if (mode === 'IN_PERSON' && assetId) {
    var asset = getAsset(assetId);
    if (!asset) return null;
    dipEff = asset.diplomaticEffectiveness || 0;

    var capital = getCountryCapital(country);
    var transitMin = calcTransitMinutes(asset, capital.lat, capital.lon);

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
    mission.completionAt = null;
    mission._executionDuration = executionDuration;
  } else {
    dipEff = 2;
  }

  mission.successChance = getOutreachSuccessChance(mode, dipEff);

  if (!cd.missions) cd.missions = [];
  cd.missions.push(mission);

  var tierLabel = getStanceTier(stance).label;
  addLog('DIPLOMACY: Outreach initiated with ' + country + ' (' + mode + '). Cost: ' + cost + ' INTEL.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'DIPLOMATIC OUTREACH: ' + country,
    body: 'Diplomatic outreach to ' + country + ' has been initiated (' + mode.toLowerCase().replace('_', '-') +
      '). Objective: improve bilateral relations. Relations: ' + cd.relations + '%. Stance: ' + tierLabel + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });

  return mission;
}

function requestProactiveClearance(country, assetId) {
  var cd = V.diplomacy[country];
  if (!cd) return null;
  if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') return cd.pendingClearance;

  var stance = deriveStance(country);
  var delayRanges = {
    7: [60, 120], 6: [120, 360], 5: [360, 720], 4: [720, 1440],
    3: [1440, 2880], 2: [1440, 2880], 1: [1440, 2880], 0: [1440, 2880],
  };

  var range = delayRanges[stance] || delayRanges[3];
  var delayMinutes = randInt(range[0], range[1]);

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
    opId: null,
    requestedAt: V.time.totalMinutes,
    estimatedCompletion: V.time.totalMinutes + delayMinutes,
    status: 'PENDING',
    assetId: assetId || null,
    mode: mode,
  };

  var tierLabel = getStanceTier(stance).label;
  addLog('DIPLOMACY: Proactive clearance requested from ' + country + ' (' + mode + '). ETA: ' + formatTransitTime(delayMinutes) + '.', 'log-info');
  pushFeedItem({
    id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
    header: 'CLEARANCE REQUESTED: ' + country,
    body: 'Proactive diplomatic clearance has been requested from ' + country + ' for future overt operations (' +
      mode.toLowerCase().replace('_', '-') + '). Estimated response time: ' + formatTransitTime(delayMinutes) +
      '. Relations: ' + cd.relations + '%. Stance: ' + tierLabel + '.',
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
          var stance = deriveStance(country);
          var tierLabel = getStanceTier(stance).label;
          if (Math.random() < m.successChance) {
            m.status = 'SUCCESS';
            shiftRelations(country, 5, 'Outreach success');
            pushFeedItem({
              id: uid('FI'), type: 'DIPLOMATIC', severity: 'ROUTINE',
              header: 'OUTREACH SUCCESS: ' + country,
              body: 'Diplomatic outreach to ' + country + ' has concluded successfully. Relations improved. Relations: ' + cd.relations + '%. Stance: ' + getStanceTier(deriveStance(country)).label + '.',
              timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
              read: false,
            });
            addLog('DIPLOMACY: Outreach to ' + country + ' succeeded. Relations: ' + cd.relations + '%.', 'log-info');
          } else {
            m.status = 'FAILURE';
            pushFeedItem({
              id: uid('FI'), type: 'DIPLOMATIC', severity: 'ELEVATED',
              header: 'OUTREACH FAILED: ' + country,
              body: 'Diplomatic outreach to ' + country + ' did not achieve the desired outcome. Relations unchanged. Relations: ' + cd.relations + '%. Stance: ' + tierLabel + '.',
              timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
              read: false,
            });
            addLog('DIPLOMACY: Outreach to ' + country + ' failed. No change.', 'log-warn');
          }

          if (m.assetId) {
            returnAssetsToBase([m.assetId]);
          }

          fire('diplomatic:mission:complete', { country: country, mission: m });
        }
      }
    }
  }, 8);

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

// --- Save Compatibility Migration ---

(function() {
  hook('game:load', function() {
    for (var country in V.diplomacy) {
      var cd = V.diplomacy[country];
      if (cd.stance !== undefined && cd.relations === undefined) {
        var stanceToRelations = { 0: 5, 1: 10, 2: 20, 3: 35, 4: 50, 5: 65, 6: 75, 7: 90 };
        cd.relations = stanceToRelations[cd.stance] || 35;
        cd.atWar = (cd.stance === 0);
        cd.ceasefire = null;
        cd.peaceTreaty = null;
        cd.alliance = cd.stance >= 7 ? 'FULL' : cd.stance >= 6 ? 'MILITARY' : cd.stance >= 5 ? 'ECONOMIC' : null;
        cd.lastGiftDay = 0;
        cd.pendingProposal = null;
        cd.relationsHistory = (cd.stanceHistory || []).map(function(h) {
          return { from: (stanceToRelations[h.from] || 35), to: (stanceToRelations[h.to] || 35), day: h.day, hour: h.hour, reason: 'migrated' };
        });
        delete cd.stance;
        delete cd.stanceHistory;
      }
      // Ensure new fields exist on partially-migrated saves
      if (cd.relationsHistory === undefined) cd.relationsHistory = [];
      if (cd.atWar === undefined) cd.atWar = false;
      if (cd.ceasefire === undefined) cd.ceasefire = null;
      if (cd.peaceTreaty === undefined) cd.peaceTreaty = null;
      if (cd.alliance === undefined) cd.alliance = null;
      if (cd.lastGiftDay === undefined) cd.lastGiftDay = 0;
      if (cd.pendingProposal === undefined) cd.pendingProposal = null;
    }
  });
})();
