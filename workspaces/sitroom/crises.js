/* ============================================================
   VIGIL — workspaces/sitroom/crises.js
   Crisis generation, escalation basics.
   ============================================================ */

var CRISIS_TYPES = [
  {
    id: 'MILITARY_STANDOFF',
    label: 'Military Standoff',
    category: 'MILITARY',
    descriptions: [
      'Forces from {country} have deployed to a forward position near {city}. The situation risks military confrontation with allied forces in the area.',
      'A naval standoff has developed between US forces and {country} vessels near {city}. Rules of engagement are unclear.',
    ],
    durationRange: [5, 15],
    severities: ['CRITICAL', 'HIGH'],
    responses: [
      { label: 'SHOW OF FORCE', desc: 'Deploy additional assets to demonstrate resolve.', effect: 'confidence_up' },
      { label: 'DIPLOMATIC CHANNEL', desc: 'Open back-channel communications to de-escalate.', effect: 'risk_down' },
    ],
  },
  {
    id: 'TERROR_IMMINENT',
    label: 'Imminent Terror Attack',
    category: 'SECURITY',
    descriptions: [
      'Intelligence from multiple sources indicates an imminent attack in {city}, {country}. The threat is assessed as credible and specific.',
      'Chatter analysis suggests a terror cell is in the final stage of preparations near {city}. Attack may occur within 48 hours.',
    ],
    durationRange: [2, 5],
    severities: ['CRITICAL'],
    responses: [
      { label: 'LOCKDOWN', desc: 'Initiate security lockdown at probable target sites.', effect: 'confidence_up' },
      { label: 'COVERT INTERDICTION', desc: 'Attempt to neutralize the cell before execution.', effect: 'spawn_op' },
    ],
  },
  {
    id: 'CYBER_ATTACK',
    label: 'Major Cyber Attack',
    category: 'CYBER',
    descriptions: [
      'A sophisticated cyber attack has been detected targeting {target}. Attribution points to {country}. Systems are degrading.',
      'Critical infrastructure in {city} is under cyber attack. {target} reports loss of control over key systems.',
    ],
    durationRange: [3, 8],
    severities: ['HIGH', 'CRITICAL'],
    vars: {
      target: ['power grid operations', 'financial markets', 'military communications', 'air traffic control', 'water treatment systems'],
    },
    responses: [
      { label: 'CYBER COUNTERATTACK', desc: 'Launch offensive cyber operations against the attacker.', effect: 'risk_up' },
      { label: 'ISOLATE AND DEFEND', desc: 'Focus on containment and restoration.', effect: 'confidence_small' },
    ],
  },
  {
    id: 'DIPLOMATIC_CRISIS',
    label: 'Diplomatic Crisis',
    category: 'DIPLOMATIC',
    descriptions: [
      '{country} has expelled US diplomatic personnel following {trigger}. Relations are at their lowest point in decades.',
      'An international incident involving {country} threatens to destabilize the {region} region. Allies are demanding a response.',
    ],
    durationRange: [5, 12],
    severities: ['HIGH', 'ELEVATED'],
    vars: {
      trigger: ['an intelligence scandal', 'a military incident', 'economic sanctions', 'a cyber operation exposure'],
    },
    responses: [
      { label: 'NEGOTIATE', desc: 'Seek a diplomatic resolution through third-party mediation.', effect: 'risk_down' },
      { label: 'ESCALATE PRESSURE', desc: 'Increase economic and diplomatic pressure.', effect: 'risk_up' },
    ],
  },
  {
    id: 'HOSTAGE_SITUATION',
    label: 'Hostage Situation',
    category: 'SECURITY',
    descriptions: [
      '{count} US nationals have been taken hostage in {city}, {country}. A group claiming to be {org} has issued demands.',
      'An armed group has seized control of a facility in {city}, holding {count} personnel. Demands include the release of imprisoned operatives.',
    ],
    durationRange: [3, 7],
    severities: ['CRITICAL'],
    vars: {
      count: function() { return randInt(3, 20); },
      org: function() { return generateOrgName(); },
    },
    responses: [
      { label: 'SPECIAL OPERATIONS', desc: 'Deploy SPECOPS for a rescue mission.', effect: 'spawn_op' },
      { label: 'NEGOTIATE', desc: 'Open negotiations while gathering intelligence.', effect: 'intel_gain' },
    ],
  },
];

// --- Crisis Spawning ---

(function() {
  hook('tick:day', function() {
    // Chance to spawn a crisis every 7-10 days
    if (V.time.day < 5) return;
    if (V.crises.filter(function(c) { return !c.resolved; }).length >= 3) return;

    if (V.time.day % 7 === 0 && Math.random() < 0.4) {
      spawnCrisis();
    }
  });

  function spawnCrisis() {
    var type = pick(CRISIS_TYPES);
    var loc = generateRandomLocation();

    var baseVars = {
      city: loc.city,
      country: loc.country,
      region: loc.theater.name,
    };
    var vars = resolveVars(type.vars || {}, baseVars);

    var description = fillTemplate(pick(type.descriptions), vars);

    var crisis = {
      id: uid('CRS'),
      typeId: type.id,
      label: type.label,
      category: type.category,
      description: description,
      severity: pick(type.severities),
      location: loc,
      daySpawned: V.time.day,
      duration: randInt(type.durationRange[0], type.durationRange[1]),
      daysLeft: randInt(type.durationRange[0], type.durationRange[1]),
      responses: type.responses,
      resolved: false,
      chosenResponse: null,
    };

    V.crises.push(crisis);
    fire('crisis:spawned', { crisis: crisis });

    // Feed item
    var feedItem = {
      id: uid('FI'),
      type: 'CRISIS',
      severity: crisis.severity,
      header: 'CRISIS: ' + crisis.label.toUpperCase(),
      body: description,
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      crisisId: crisis.id,
      geo: { lat: loc.lat, lon: loc.lon },
    };
    pushFeedItem(feedItem);

    addLog('CRISIS: ' + crisis.label + ' (' + loc.city + ')', 'log-crisis');
  }

  // --- Crisis timer ---
  hook('tick:day', function() {
    for (var i = 0; i < V.crises.length; i++) {
      var c = V.crises[i];
      if (c.resolved) continue;
      c.daysLeft = Math.max(0, c.daysLeft - 1);
      if (c.daysLeft <= 0) {
        // Auto-resolve if not addressed
        c.resolved = true;
        V.resources.viability = clamp(V.resources.viability - randInt(3, 8), 0, 100);
        addLog('Crisis expired: ' + c.label + '. Viability -.', 'log-warn');
      }
    }
  });

  // --- Crisis Response ---

  window.respondToCrisis = function(crisisId, responseIdx) {
    var crisis = getCrisis(crisisId);
    if (!crisis || crisis.resolved) return;

    var response = crisis.responses[responseIdx];
    crisis.resolved = true;
    crisis.chosenResponse = responseIdx;

    if (response && response.effect) {
      switch (response.effect) {
        case 'confidence_up':
          V.resources.viability = clamp(V.resources.viability + randInt(3, 6), 0, 100);
          break;
        case 'confidence_small':
          V.resources.viability = clamp(V.resources.viability + randInt(1, 3), 0, 100);
          break;
        case 'risk_down':
          if (crisis.location && V.theaters[crisis.location.theaterId]) {
            V.theaters[crisis.location.theaterId].risk = clamp(V.theaters[crisis.location.theaterId].risk - 0.5, 1, 5);
          }
          break;
        case 'risk_up':
          if (crisis.location && V.theaters[crisis.location.theaterId]) {
            V.theaters[crisis.location.theaterId].risk = clamp(V.theaters[crisis.location.theaterId].risk + 0.5, 1, 5);
          }
          break;
        case 'spawn_op':
          spawnOperationFromEvent({ id: crisis.id, label: crisis.label, description: crisis.description, location: crisis.location, category: crisis.category });
          break;
        case 'intel_gain':
          V.resources.intel += randInt(5, 15);
          break;
      }
    }

    addLog('Crisis response: ' + response.label, 'log-decision');
  };

})();
