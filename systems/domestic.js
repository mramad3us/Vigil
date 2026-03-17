/* ============================================================
   VIGIL — systems/domestic.js
   Domestic threat generation, spawning, and lifecycle.
   US-located threats are a separate class with their own
   generator, threat types, and operation type mappings.
   Posse Comitatus: only domesticAuthority assets are sanctioned.
   ============================================================ */

// --- Domestic Threat Types ---
// Separate from foreign THREAT_TYPES. Weighted for spawn probability.

var DOMESTIC_THREAT_TYPES = [
  { id: 'DOMESTIC_EXTREMISM', label: 'Domestic Extremism', weight: 3, threatRange: [2, 4] },
  { id: 'FINANCIAL_CRIME', label: 'Financial Crime', weight: 2, threatRange: [2, 3] },
  { id: 'CYBER_INTRUSION', label: 'Cyber Intrusion', weight: 3, threatRange: [3, 5] },
  { id: 'INSIDER_THREAT', label: 'Insider Threat', weight: 2, threatRange: [3, 5] },
  { id: 'ORGANIZED_CRIME', label: 'Organized Crime', weight: 2, threatRange: [2, 4] },
  { id: 'CIVIL_UNREST', label: 'Civil Unrest', weight: 2, threatRange: [1, 3] },
  { id: 'WHISTLEBLOWER', label: 'Unauthorized Disclosure', weight: 1, threatRange: [2, 4] },
  { id: 'CORPORATE_ESPIONAGE', label: 'Corporate Espionage', weight: 2, threatRange: [3, 4] },
  { id: 'NARCOTICS_NETWORK', label: 'Narcotics Network', weight: 3, threatRange: [2, 4] },
  { id: 'DOMESTIC_TERROR', label: 'Domestic Terror', weight: 1, threatRange: [4, 5] },
  { id: 'HOSTAGE_DOMESTIC', label: 'Hostage Situation', weight: 1, threatRange: [4, 5] },
  { id: 'DOMESTIC_HVT', label: 'Domestic HVT', weight: 1, threatRange: [3, 5] },
  { id: 'DOMESTIC_CAPTURE_TARGET', label: 'High-Priority Fugitive', weight: 2, threatRange: [3, 4] },
  { id: 'ILLEGAL_AGENT_DOMESTIC', label: 'Foreign Illegal Agent', weight: 2, threatRange: [3, 5] },
];

// --- Map domestic threat types to domestic operation types ---

var DOMESTIC_THREAT_TO_OP_TYPE = {
  DOMESTIC_EXTREMISM: ['ARREST_OPERATION', 'INVESTIGATION', 'DOMESTIC_SURVEILLANCE'],
  FINANCIAL_CRIME: ['INVESTIGATION', 'DOMESTIC_SURVEILLANCE', 'ARREST_OPERATION'],
  CYBER_INTRUSION: ['INVESTIGATION', 'DOMESTIC_SURVEILLANCE', 'CYBER_OP'],
  INSIDER_THREAT: ['INVESTIGATION', 'ARREST_OPERATION', 'DOMESTIC_SURVEILLANCE'],
  ORGANIZED_CRIME: ['ARREST_OPERATION', 'INVESTIGATION', 'DOMESTIC_SURVEILLANCE'],
  CIVIL_UNREST: ['DOMESTIC_SURVEILLANCE', 'INVESTIGATION'],
  WHISTLEBLOWER: ['INVESTIGATION', 'ARREST_OPERATION', 'DOMESTIC_SURVEILLANCE'],
  CORPORATE_ESPIONAGE: ['INVESTIGATION', 'DOMESTIC_SURVEILLANCE', 'ARREST_OPERATION'],
  NARCOTICS_NETWORK: ['ARREST_OPERATION', 'INVESTIGATION', 'DOMESTIC_SURVEILLANCE'],
  DOMESTIC_TERROR: ['COUNTER_TERROR'],
  HOSTAGE_DOMESTIC: ['DOMESTIC_HOSTAGE_RESCUE'],
  DOMESTIC_HVT: ['TARGETED_KILLING', 'COVERT_SNATCH', 'ARREST_OPERATION'],
  DOMESTIC_CAPTURE_TARGET: ['SOLO_APPREHENSION', 'DOMESTIC_SURVEILLANCE'],
  ILLEGAL_AGENT_DOMESTIC: ['TARGETED_KILLING', 'SOLO_APPREHENSION', 'DOMESTIC_SURVEILLANCE'],
};

// ===================================================================
//  SPAWN DOMESTIC THREAT
// ===================================================================

function spawnDomesticThreat() {
  // Filter out ILLEGAL_AGENT_DOMESTIC — spawned by illegals.js with its own pipeline
  var spawnableTypes = DOMESTIC_THREAT_TYPES.filter(function(t) { return t.id !== 'ILLEGAL_AGENT_DOMESTIC'; });
  var type = weightedPick(spawnableTypes);
  var loc = generateDomesticLocation();
  var threatLevel = randInt(type.threatRange[0], type.threatRange[1]);

  // Expiration timer
  var expRange = THREAT_EXPIRATION[threatLevel] || THREAT_EXPIRATION[3];
  var expiresIn = randInt(expRange[0], expRange[1]);

  // ~8% chance of URGENT domestic intel
  var isUrgent = Math.random() < 0.08;
  if (isUrgent) {
    expiresIn = randInt(120, 1440);
  }

  var orgName = generateDomesticOrgName(type.id);

  // Build intel fields using domestic content generator
  var intelFields = buildDomesticIntelFields(type.id, loc, orgName);

  var threat = {
    id: uid('THR'),
    type: type.id,
    typeLabel: type.label,
    orgName: orgName,
    threatLevel: threatLevel,
    location: loc,
    status: 'ACTIVE',
    phase: 'INTEL',
    daySpawned: V.time.day,
    spawnedAt: V.time.totalMinutes,
    expiresAt: V.time.totalMinutes + expiresIn,
    urgent: isUrgent,
    domestic: true,

    // No foreign target for domestic threats
    _targetInfo: null,

    // Intel collection state
    intelFields: intelFields,
    collectorAssetIds: [],

    // Ops phase reference
    linkedOpId: null,

    // Urgency alert tracking
    urgencyAlertSent: false,
    criticalAlertSent: false,
  };

  V.threats.push(threat);
  fire('threat:spawned', { threat: threat });

  addLog('DOMESTIC THREAT: ' + threat.orgName + ' identified in ' + loc.city + '.', 'log-threat');

  // Count pre-revealed fields
  var revealedCount = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) revealedCount++;
  }

  // Feed item with Orwellian domestic surveillance flavor
  var descPool = DOMESTIC_THREAT_DESCRIPTIONS[type.id];
  if (!descPool || descPool.length === 0) {
    descPool = ['Vigil domestic monitoring has flagged activity in ' + loc.city + '. Subject: ' + orgName + '. Investigation initiated.'];
  }

  var desc = pick(descPool);
  desc = desc.replace(/\{city\}/g, loc.city);
  desc = desc.replace(/\{country\}/g, loc.country);
  desc = desc.replace(/\{orgName\}/g, orgName);

  pushFeedItem({
    id: uid('FI'),
    type: 'THREAT',
    severity: isUrgent ? 'CRITICAL' : (threatLevel >= 4 ? 'HIGH' : 'ELEVATED'),
    header: (isUrgent ? 'URGENT — DOMESTIC: ' : 'DOMESTIC THREAT: ') + orgName,
    body: desc + ' Threat level: ' + threatLevel + '/5. ' +
      revealedCount + '/' + threat.intelFields.length + ' intelligence fields available. Passive collection initiated.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: loc.lat, lon: loc.lon },
    domestic: true,
  });

  // Urgent domestic threats get immediate pop-up
  if (isUrgent) {
    var urgentHoursLeft = Math.max(1, Math.round(expiresIn / 60));
    var urgentMessages = [
      'FLASH — DOMESTIC THREAT: ' + threat.orgName + ' (' + type.label + ') detected in ' +
        loc.city + '. Vigil assesses imminent activity within ' + urgentHoursLeft +
        ' hours. Deploy federal assets immediately. All domestic agency resources authorized.',
      'URGENT — ' + threat.orgName + ' identified in ' + loc.city + '. ' +
        'Domestic surveillance network indicates imminent ' + type.label.toLowerCase() +
        ' activity. Estimated window: ' + urgentHoursLeft + 'h. ' +
        'Federal law enforcement assets must be deployed NOW.',
      'PRIORITY DOMESTIC FLASH: Vigil has intercepted indicators of imminent ' +
        type.label.toLowerCase() + ' activity by ' + threat.orgName + ' in ' + loc.city + '. ' +
        'Only ' + urgentHoursLeft + 'h remain. Deploy sanctioned domestic assets immediately. ' +
        'Unsanctioned military deployment carries severe viability penalties.',
    ];

    queueUrgentAlert({
      id: uid('FI'),
      type: 'URGENT_INTEL',
      severity: 'CRITICAL',
      header: 'URGENT DOMESTIC INTEL: ' + threat.orgName,
      body: pick(urgentMessages),
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      threatId: threat.id,
      geo: { lat: loc.lat, lon: loc.lon },
      domestic: true,
    });
  }

  return threat;
}

// ===================================================================
//  BUILD DOMESTIC INTEL FIELDS
// ===================================================================
// Uses domestic-specific intel value generation.

function buildDomesticIntelFields(threatType, location, orgName) {
  var fieldDefs = THREAT_INTEL_FIELDS[threatType];
  if (!fieldDefs) return [];

  var fields = [];
  for (var i = 0; i < fieldDefs.length; i++) {
    var def = fieldDefs[i];
    var diff = INTEL_DIFFICULTY[def.difficulty];
    if (!diff) continue;

    var ticksToReveal = randInt(diff.ticksRange[0], diff.ticksRange[1]);
    var preRevealed = Math.random() < diff.preRevealChance;

    fields.push({
      key: def.key,
      label: def.label,
      difficulty: def.difficulty,
      source: def.source,
      ticksToReveal: ticksToReveal,
      ticksAccumulated: preRevealed ? ticksToReveal : 0,
      revealed: preRevealed,
      value: generateDomesticIntelValue(def.key, location, orgName),
    });
  }
  return fields;
}

// ===================================================================
//  TICK HOOKS — Domestic Threat Auto-Spawn
// ===================================================================

(function() {

  // --- Auto-spawn domestic threats every few days ---
  hook('tick:day', function() {
    // Domestic threats spawn on their own cadence, independent of theater volatility
    // ~25% chance every 3 days
    if (V.time.day % 3 !== 0) return;
    if (Math.random() < 0.25) {
      spawnDomesticThreat();
    }
    // Small chance of a second domestic threat on the same day
    if (Math.random() < 0.08) {
      spawnDomesticThreat();
    }
  }, 5);

  // --- Initial domestic threats on game start ---
  hook('game:start', function() {
    if (V.initialized) return;
    var count = randInt(1, 2);
    for (var i = 0; i < count; i++) {
      spawnDomesticThreat();
    }
  }, 5); // After bases, assets, and domestic assets

})();

// ===================================================================
//  VIABILITY PENALTY — Unsanctioned Domestic Deployment
// ===================================================================
// Deploying CIA/military assets on US soil violates Posse Comitatus.
// Each unsanctioned deployment incurs a viability hit.

(function() {

  hook('operation:asset:deployed', function(data) {
    if (!data || !data.operation || !data.asset) return;
    var op = data.operation;
    var asset = data.asset;

    if (!op.domestic) return;
    if (asset.domesticAuthority) return; // Sanctioned — no penalty

    // Unsanctioned domestic deployment
    var penalty = randInt(3, 8);
    V.resources.viability = clamp(V.resources.viability - penalty, 0, 100);

    addLog('VIABILITY -' + penalty + '%: Unsanctioned deployment of ' + asset.name + ' on US soil. Posse Comitatus violation.', 'log-fail');

    pushFeedItem({
      id: uid('FI'),
      type: 'VIGIL_ALERT',
      severity: 'HIGH',
      header: 'POSSE COMITATUS VIOLATION',
      body: 'Operator has deployed ' + asset.name + ' (' + (ASSET_CATEGORIES[asset.category] ? ASSET_CATEGORIES[asset.category].label : asset.category) +
        ') on domestic soil without statutory authority. This action violates the Posse Comitatus Act and applicable executive orders. ' +
        'Viability impact: -' + penalty + '%. Continued unsanctioned domestic deployments will result in accelerated viability degradation.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
      domestic: true,
    });
  });

})();
