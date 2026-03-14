/* ============================================================
   VIGIL — systems/threats.js
   Threat/org generation, threat levels, spawn operations.
   ============================================================ */

var THREAT_TYPES = [
  { id: 'TERROR_CELL', label: 'Terror Cell', weight: 3, threatRange: [3, 5] },
  { id: 'STATE_ACTOR', label: 'State Actor', weight: 2, threatRange: [4, 5] },
  { id: 'CYBER_GROUP', label: 'Cyber Threat Group', weight: 3, threatRange: [2, 4] },
  { id: 'CRIMINAL_ORG', label: 'Criminal Organization', weight: 2, threatRange: [2, 4] },
  { id: 'INSURGENCY', label: 'Insurgent Movement', weight: 2, threatRange: [3, 5] },
  { id: 'PROLIFERATOR', label: 'WMD Proliferator', weight: 1, threatRange: [4, 5] },
];

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

  var op = {
    id: uid('OP'),
    codename: codename,
    label: event.label,
    category: event.category,
    status: 'INCOMING',
    threatLevel: threat,
    location: loc,
    geo: { lat: loc.lat, lon: loc.lon },
    daySpawned: V.time.day,
    urgencyLeft: urgent ? randInt(3, 5) : randInt(5, 12),
    invDays: randInt(2, 4),
    invDaysLeft: 0,
    execDays: randInt(2, 4),
    execDaysLeft: 0,
    assignedDept: null,
    assignedExecDepts: [],
    assignedBudget: 0,
    baseBudget: randInt(5, 20),
    successProb: 0,
    briefing: event.description,
    fillVars: {},
    intelFields: generateIntelFields(),
    relatedEventId: event.id,
    relatedThreatId: null,
  };

  V.operations.unshift(op);
  fire('operation:spawned', { operation: op });

  addLog('OP ' + codename + ' created from event.', 'log-op');

  // Generate feed item for the new operation
  var feedItem = {
    id: uid('FI'),
    type: 'OPERATION',
    severity: urgent ? 'HIGH' : 'ELEVATED',
    header: 'NEW OPERATION: ' + codename,
    body: 'Operation ' + codename + ' has been authorized in response to ' + event.label.toLowerCase() + '. Location: ' + loc.city + ', ' + loc.country + '. Awaiting department assignment.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: op.id,
    geo: { lat: loc.lat, lon: loc.lon },
  };
  pushFeedItem(feedItem);
}

// --- Intel Fields ---

function generateIntelFields() {
  var fields = [
    { key: 'target_identity', label: 'TARGET IDENTITY', revealed: false, value: '' },
    { key: 'location_detail', label: 'PRECISE LOCATION', revealed: false, value: '' },
    { key: 'network_size', label: 'NETWORK SIZE', revealed: false, value: '' },
    { key: 'capabilities', label: 'CAPABILITIES', revealed: false, value: '' },
    { key: 'timeline', label: 'OPERATIONAL TIMELINE', revealed: false, value: '' },
    { key: 'funding', label: 'FUNDING SOURCE', revealed: false, value: '' },
  ];

  // Randomly reveal 0-2 fields initially
  var toReveal = randInt(0, 2);
  var shuffled = shuffle(fields);
  for (var i = 0; i < toReveal && i < shuffled.length; i++) {
    shuffled[i].revealed = true;
    shuffled[i].value = generateIntelFieldValue(shuffled[i].key);
  }

  return fields;
}

function generateIntelFieldValue(key) {
  var values = {
    target_identity: [
      'Identified: {alias}, known operative of {org}',
      'Partial ID — facial recognition match at {confidence}%',
      'Unknown — operating under alias "{alias}"',
    ],
    location_detail: [
      'Confirmed: {city} commercial district, building identified',
      'Approximate — {city} industrial zone, 500m radius',
      'Unknown — last signal intercept from {city} area',
    ],
    network_size: [
      'Estimated 4-8 operatives based on communications analysis',
      'Large network: 15-30 individuals across multiple cells',
      'Small cell: 2-3 operatives, likely self-directed',
    ],
    capabilities: [
      'Conventional weapons only — small arms and IEDs',
      'Advanced capability — access to military-grade hardware',
      'Cyber-enabled — demonstrated network exploitation capability',
    ],
    timeline: [
      'Imminent — activity consistent with final preparations',
      'Near-term — estimated 7-14 days to operational readiness',
      'Unknown — insufficient data to assess timeline',
    ],
    funding: [
      'State-sponsored — traced to foreign government accounts',
      'Criminal enterprise — narcotics and arms trafficking revenue',
      'Crowdfunded — distributed cryptocurrency donations',
    ],
  };

  var templates = values[key] || ['Classified — assessment pending'];
  var vars = {
    alias: generatePersonnelAlias(),
    org: generateOrgName(),
    city: pick(['the target city', 'the operational area']),
    confidence: randInt(60, 95),
  };
  return fillTemplate(pick(templates), vars);
}

// --- Auto-spawn threats based on theater volatility ---

(function() {
  hook('tick:day', function() {
    // Every 5 days, chance to spawn a threat in a volatile theater
    if (V.time.day % 5 !== 0) return;

    for (var tid in V.theaters) {
      var theater = V.theaters[tid];
      if (Math.random() < theater.volatility * 0.3) {
        spawnThreat(tid);
      }
    }
  });

  // Initial threats on game start
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
      var op = {
        id: uid('OP'),
        codename: codename,
        label: pick(['SURVEILLANCE', 'COUNTER-TERROR', 'CYBER DEFENSE', 'SIGNAL INTERCEPT']),
        category: pick(['INTELLIGENCE', 'SECURITY', 'CYBER']),
        status: 'INCOMING',
        threatLevel: randInt(2, 4),
        location: loc,
        geo: { lat: loc.lat, lon: loc.lon },
        daySpawned: V.time.day,
        urgencyLeft: randInt(5, 15),
        invDays: randInt(2, 4),
        invDaysLeft: 0,
        execDays: randInt(2, 4),
        execDaysLeft: 0,
        assignedDept: null,
        assignedExecDepts: [],
        assignedBudget: 0,
        baseBudget: randInt(5, 20),
        successProb: 0,
        briefing: 'Vigil analysis has identified a priority intelligence requirement in the ' + loc.theater.name + ' theater. Operation ' + codename + ' has been authorized. Location: ' + loc.city + ', ' + loc.country + '.',
        fillVars: {},
        intelFields: generateIntelFields(),
        relatedEventId: null,
        relatedThreatId: null,
      };
      V.operations.unshift(op);
      fire('operation:spawned', { operation: op });
    }
  });
})();
