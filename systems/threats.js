/* ============================================================
   VIGIL — systems/threats.js
   Threat/org generation, threat levels, spawn operations.
   v0.2: Operations use new 8-state lifecycle with operationType.
   ============================================================ */

var THREAT_TYPES = [
  { id: 'TERROR_CELL', label: 'Terror Cell', weight: 3, threatRange: [3, 5] },
  { id: 'STATE_ACTOR', label: 'State Actor', weight: 2, threatRange: [4, 5] },
  { id: 'CYBER_GROUP', label: 'Cyber Threat Group', weight: 3, threatRange: [2, 4] },
  { id: 'CRIMINAL_ORG', label: 'Criminal Organization', weight: 2, threatRange: [2, 4] },
  { id: 'INSURGENCY', label: 'Insurgent Movement', weight: 2, threatRange: [3, 5] },
  { id: 'PROLIFERATOR', label: 'WMD Proliferator', weight: 1, threatRange: [4, 5] },
];

// --- Map threat types to operation types ---
var THREAT_TO_OP_TYPE = {
  TERROR_CELL: ['COUNTER_TERROR', 'SOF_RAID', 'DRONE_STRIKE'],
  STATE_ACTOR: ['MILITARY_STRIKE', 'SURVEILLANCE', 'CYBER_OP'],
  CYBER_GROUP: ['CYBER_OP', 'INTEL_COLLECTION'],
  CRIMINAL_ORG: ['NAVAL_INTERDICTION', 'SOF_RAID', 'INTEL_COLLECTION'],
  INSURGENCY: ['COUNTER_TERROR', 'MILITARY_STRIKE', 'SOF_RAID'],
  PROLIFERATOR: ['SURVEILLANCE', 'INTEL_COLLECTION', 'MILITARY_STRIKE'],
};

function spawnThreat(theaterId) {
  var type = weightedPick(THREAT_TYPES);
  var loc = theaterId ? generateLocationInTheater(theaterId) : generateRandomLocation();

  var threat = {
    id: uid('THR'),
    type: type.id,
    typeLabel: type.label,
    orgName: generateOrgName(),
    threatLevel: randInt(type.threatRange[0], type.threatRange[1]),
    location: loc,
    status: 'ACTIVE',
    daySpawned: V.time.day,
    linkedOpIds: [],
    intel: randInt(10, 40),
  };

  V.threats.push(threat);
  fire('threat:spawned', { threat: threat });

  addLog('THREAT: ' + threat.orgName + ' identified (' + loc.theater.shortName + ')', 'log-threat');
  return threat;
}

// --- Spawn Operation from Event ---

function spawnOperationFromEvent(event, urgent) {
  var loc = event.location || generateRandomLocation();
  var codename = generateCodename();
  var threat = randInt(2, 5);

  // Determine operation type from event category
  var opType = EVENT_TO_OP_TYPE[event.category] || 'SURVEILLANCE';

  var urgencyHours = urgent ? randInt(12, 36) : randInt(48, 168); // hours until expiry
  var detectionDelay = randInt(30, 180); // 30min to 3h before analysis starts

  var op = {
    id: uid('OP'),
    codename: codename,
    label: event.label,
    category: event.category,
    operationType: opType,
    status: 'DETECTED',
    threatLevel: threat,
    location: loc,
    geo: { lat: loc.lat, lon: loc.lon },
    daySpawned: V.time.day,
    urgencyHours: urgencyHours,

    // Lifecycle timing (minute-based)
    nextTransitionAt: V.time.totalMinutes + detectionDelay,
    expiresAt: null,
    execDurationMinutes: 0,
    transitStartTotalMinutes: 0,
    transitDurationMinutes: 0,

    // Vigil options
    options: [],
    selectedOptionIdx: undefined,
    vigilRecommendedIdx: undefined,
    deviatedFromVigil: false,

    // Assets
    assignedAssetIds: [],

    // Content
    briefing: event.description,
    fillVars: {},
    orgName: null,
    targetAlias: generatePersonnelAlias(),
    budgetCost: randInt(5, 20),

    // Debrief
    debrief: null,

    // References
    relatedEventId: event.id,
    relatedThreatId: null,
  };

  V.operations.unshift(op);
  fire('operation:spawned', { operation: op });

  addLog('OP ' + codename + ' detected. Vigil initiating analysis.', 'log-op');

  // Generate feed item
  var feedItem = {
    id: uid('FI'),
    type: 'OPERATION',
    severity: urgent ? 'HIGH' : 'ELEVATED',
    header: 'THREAT DETECTED: ' + codename,
    body: 'Vigil has detected a new threat requiring operational response in ' + loc.city + ', ' + loc.country + '. Operation ' + codename + ' has been initiated. Vigil is analyzing deployment options.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: op.id,
    geo: { lat: loc.lat, lon: loc.lon },
  };
  pushFeedItem(feedItem);
}

// --- Spawn Operation from Threat ---

function spawnOperationFromThreat(threat) {
  var opTypes = THREAT_TO_OP_TYPE[threat.type] || ['SURVEILLANCE'];
  var opType = pick(opTypes);

  var codename = generateCodename();
  var detectionDelay = randInt(30, 120);

  var op = {
    id: uid('OP'),
    codename: codename,
    label: threat.typeLabel + ' Response',
    category: 'SECURITY',
    operationType: opType,
    status: 'DETECTED',
    threatLevel: threat.threatLevel,
    location: threat.location,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
    daySpawned: V.time.day,
    urgencyHours: randInt(24, 120),

    nextTransitionAt: V.time.totalMinutes + detectionDelay,
    expiresAt: null,
    execDurationMinutes: 0,
    transitStartTotalMinutes: 0,
    transitDurationMinutes: 0,

    options: [],
    selectedOptionIdx: undefined,
    vigilRecommendedIdx: undefined,
    deviatedFromVigil: false,
    assignedAssetIds: [],

    briefing: 'Vigil analysis has identified ' + threat.orgName + ' as a priority target in the ' + threat.location.theater.name + ' theater. Operation ' + codename + ' authorized for ' + (OPERATION_TYPES[opType] ? OPERATION_TYPES[opType].label.toLowerCase() : 'response') + '. Location: ' + threat.location.city + ', ' + threat.location.country + '.',
    fillVars: {},
    orgName: threat.orgName,
    targetAlias: generatePersonnelAlias(),
    budgetCost: randInt(5, 20),
    debrief: null,

    relatedEventId: null,
    relatedThreatId: threat.id,
  };

  threat.linkedOpIds.push(op.id);
  V.operations.unshift(op);
  fire('operation:spawned', { operation: op });

  addLog('OP ' + codename + ' created targeting ' + threat.orgName + '.', 'log-op');
}

// --- Auto-spawn threats based on theater volatility ---

(function() {
  hook('tick:day', function() {
    if (V.time.day % 5 !== 0) return;

    for (var tid in V.theaters) {
      var theater = V.theaters[tid];
      if (Math.random() < theater.volatility * 0.3) {
        spawnThreat(tid);
      }
    }
  });

  // Initial threats and operations on game start
  hook('game:start', function() {
    // Spawn 2-3 initial threats
    var count = randInt(2, 3);
    for (var i = 0; i < count; i++) {
      spawnThreat();
    }

    // Spawn 1-2 initial operations
    var opCount = randInt(1, 2);
    for (var j = 0; j < opCount; j++) {
      var loc = generateRandomLocation();
      var codename = generateCodename();
      var opTypes = ['SURVEILLANCE', 'COUNTER_TERROR', 'CYBER_OP', 'INTEL_COLLECTION'];
      var opType = pick(opTypes);

      var op = {
        id: uid('OP'),
        codename: codename,
        label: pick(['SURVEILLANCE', 'COUNTER-TERROR', 'CYBER DEFENSE', 'SIGNAL INTERCEPT']),
        category: pick(['INTELLIGENCE', 'SECURITY', 'CYBER']),
        operationType: opType,
        status: 'DETECTED',
        threatLevel: randInt(2, 4),
        location: loc,
        geo: { lat: loc.lat, lon: loc.lon },
        daySpawned: V.time.day,
        urgencyHours: randInt(48, 168),

        nextTransitionAt: V.time.totalMinutes + randInt(60, 240),
        expiresAt: null,
        execDurationMinutes: 0,
        transitStartTotalMinutes: 0,
        transitDurationMinutes: 0,

        options: [],
        selectedOptionIdx: undefined,
        vigilRecommendedIdx: undefined,
        deviatedFromVigil: false,
        assignedAssetIds: [],

        briefing: 'Vigil analysis has identified a priority intelligence requirement in the ' + loc.theater.name + ' theater. Operation ' + codename + ' has been authorized. Location: ' + loc.city + ', ' + loc.country + '.',
        fillVars: {},
        orgName: null,
        targetAlias: generatePersonnelAlias(),
        budgetCost: randInt(5, 20),
        debrief: null,

        relatedEventId: null,
        relatedThreatId: null,
      };

      V.operations.unshift(op);
      fire('operation:spawned', { operation: op });
    }
  });
})();
