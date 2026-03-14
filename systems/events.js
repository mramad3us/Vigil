/* ============================================================
   VIGIL — systems/events.js
   Event catalog, random spawning, choice events.
   ============================================================ */

var EVENT_CATALOG = [
  {
    id: 'TERROR_PLOT',
    label: 'Terror Plot Detected',
    weight: 3,
    category: 'SECURITY',
    description: 'Intelligence indicates a terror cell is planning an attack against {target} in {city}, {country}. The threat is assessed as credible. Vigil recommends immediate action.',
    hasChoice: true,
    choices: [
      { label: 'AUTHORIZE SURVEILLANCE', desc: 'Deploy SIGINT and HUMINT assets to gather more intelligence.', effect: 'spawn_op' },
      { label: 'DIRECT INTERVENTION', desc: 'Dispatch field teams for immediate disruption.', effect: 'spawn_op_urgent' },
    ],
    vars: {
      target: ['a government facility', 'critical infrastructure', 'a transportation hub', 'a financial district', 'a diplomatic compound'],
    },
  },
  {
    id: 'CYBER_INTRUSION',
    label: 'Cyber Intrusion Detected',
    weight: 3,
    category: 'CYBER',
    description: 'Vigil has detected a sophisticated cyber intrusion targeting {target}. The attack bears the hallmarks of a state-sponsored operation originating from {country}. Response is required.',
    hasChoice: true,
    choices: [
      { label: 'TRACE AND MONITOR', desc: 'Allow controlled access to identify the attackers.', effect: 'intel_gain' },
      { label: 'SEVER AND HARDEN', desc: 'Immediately cut the intrusion and reinforce defenses.', effect: 'confidence_gain' },
    ],
    vars: {
      target: ['DoD classified networks', 'intelligence databases', 'critical infrastructure SCADA systems', 'satellite command channels', 'diplomatic communications'],
    },
  },
  {
    id: 'DIPLOMATIC_INCIDENT',
    label: 'Diplomatic Incident',
    weight: 2,
    category: 'DIPLOMATIC',
    description: 'A diplomatic incident has occurred involving {country}. {detail}. The situation risks escalation if not managed carefully.',
    vars: {
      detail: [
        'An embassy staff member has been detained on espionage charges',
        'A surveillance operation has been exposed by the foreign press',
        'Military forces have violated sovereign airspace',
        'Trade negotiations have collapsed amid mutual recriminations',
        'A covert operative has been identified and expelled',
      ],
    },
    hasChoice: true,
    choices: [
      { label: 'DE-ESCALATE', desc: 'Issue a diplomatic response and work through channels.', effect: 'confidence_small' },
      { label: 'HOLD FIRM', desc: 'Maintain current posture and accept diplomatic fallout.', effect: 'theater_risk_up' },
    ],
  },
  {
    id: 'MILITARY_BUILDUP',
    label: 'Military Buildup Detected',
    weight: 2,
    category: 'MILITARY',
    description: 'Satellite imagery reveals an unusual military buildup near {city}, {country}. Force disposition suggests {intent}. Theater risk is increasing.',
    vars: {
      intent: [
        'preparations for a limited border incursion',
        'a show of force intended to intimidate regional partners',
        'staging for a potential amphibious operation',
        'deployment of strategic missile systems',
        'mobilization of reserve forces for unknown purposes',
      ],
    },
    hasChoice: false,
  },
  {
    id: 'ASSET_COMPROMISED',
    label: 'Asset Compromised',
    weight: 2,
    category: 'INTELLIGENCE',
    description: 'Source {source} operating in {city}, {country} may have been compromised. Counter-intelligence analysis indicates a {probability}% chance of exposure. {detail}',
    vars: {
      source: function() { return generateSourceCode(); },
      probability: function() { return randInt(40, 85); },
      detail: [
        'The source has missed two consecutive dead drops.',
        'Communications patterns suggest hostile surveillance.',
        'A defector from the target service has offered to sell agent identities.',
        'Encrypted communications from the source contain anomalous patterns.',
      ],
    },
    hasChoice: true,
    choices: [
      { label: 'EXTRACT IMMEDIATELY', desc: 'Pull the asset out before they can be detained.', effect: 'budget_cost' },
      { label: 'CONTINUE MONITORING', desc: 'Keep the source in place and assess the situation.', effect: 'intel_gain' },
    ],
  },
  {
    id: 'POLITICAL_UNREST',
    label: 'Political Unrest',
    weight: 2,
    category: 'DOMESTIC',
    description: 'Mass protests have erupted in {city}, {country} following {trigger}. The situation is volatile and could destabilize the region.',
    vars: {
      trigger: [
        'allegations of election fraud',
        'a government crackdown on opposition media',
        'a sharp increase in food and fuel prices',
        'the assassination of a political figure',
        'revelations of government corruption',
      ],
    },
    hasChoice: false,
  },
  {
    id: 'WMD_INTELLIGENCE',
    label: 'WMD Intelligence Report',
    weight: 1,
    category: 'WMD',
    description: 'Vigil analysis indicates that {country} has made significant progress in {program}. Confidence level: {confidence}. This assessment is based on {basis}.',
    vars: {
      program: [
        'uranium enrichment beyond civilian thresholds',
        'miniaturization of nuclear warhead designs',
        'development of advanced biological agents',
        'chemical weapons precursor stockpiling',
        'hypersonic delivery vehicle testing',
      ],
      confidence: ['HIGH', 'MODERATE', 'LOW-MODERATE'],
      basis: [
        'SIGINT intercepts corroborated by HUMINT',
        'satellite imagery and procurement tracking',
        'defector testimony and open-source analysis',
        'cyber-collected documents from classified networks',
      ],
    },
    hasChoice: false,
  },
  {
    id: 'NARCO_TRAFFICKING',
    label: 'Narcotics Trafficking Operation',
    weight: 2,
    category: 'CRIME',
    description: 'A major narcotics trafficking route has been identified between {city} and US territory. The operation is linked to {org}. Estimated annual revenue: ${revenue}M.',
    vars: {
      org: function() { return generateOrgName(); },
      revenue: function() { return randInt(50, 500); },
    },
    hasChoice: true,
    choices: [
      { label: 'INTERDICT', desc: 'Launch a joint operation to disrupt the supply chain.', effect: 'spawn_op' },
      { label: 'MONITOR AND MAP', desc: 'Continue surveillance to map the full network.', effect: 'intel_gain' },
    ],
  },
  {
    id: 'SPACE_ANOMALY',
    label: 'Space Domain Anomaly',
    weight: 1,
    category: 'SPACE',
    description: 'Vigil space surveillance has detected {anomaly}. The activity is attributed to {country} with {confidence} confidence.',
    vars: {
      anomaly: [
        'an unannounced satellite maneuvering near US intelligence assets',
        'debris consistent with an anti-satellite weapons test',
        'a new satellite in a non-standard orbit with active RF emissions',
        'jamming activity targeting GPS constellation frequencies',
        'a rapid orbital plane change by a previously dormant object',
      ],
      confidence: ['HIGH', 'MODERATE', 'LOW'],
    },
    hasChoice: false,
  },
  {
    id: 'REFUGEE_CRISIS',
    label: 'Refugee Crisis',
    weight: 1,
    category: 'HUMANITARIAN',
    description: 'A mass displacement event in {country} has generated an estimated {count} refugees moving toward allied territory. Intelligence suggests hostile elements may be embedded among the population.',
    vars: {
      count: function() { return (randInt(5, 50) * 10000).toLocaleString(); },
    },
    hasChoice: true,
    choices: [
      { label: 'SCREEN AND ASSIST', desc: 'Deploy intelligence assets to screen while providing aid.', effect: 'budget_cost' },
      { label: 'BORDER REINFORCEMENT', desc: 'Prioritize security screening at border crossings.', effect: 'confidence_small' },
    ],
  },
];

// --- Event Spawning ---

(function() {

  hook('tick:day', function(data) {
    if (V.time.day < V.events.nextEventDay) return;

    // 50% chance each eligible day
    if (Math.random() < 0.5) {
      spawnRandomEvent();
    }

    V.events.nextEventDay = V.time.day + randInt(2, 5);
  });

  function spawnRandomEvent() {
    var pool = EVENT_CATALOG.slice();
    var event = weightedPick(pool);
    if (!event) return;

    // Pick location
    var loc = generateRandomLocation();

    // Build base vars
    var baseVars = {
      city: loc.city,
      country: loc.country,
      region: loc.theater.name,
      theaterId: loc.theaterId,
      date: formatGameDate(V.time),
    };

    // Resolve event vars
    var vars = resolveVars(event.vars || {}, baseVars);

    // Generate description
    var description = fillTemplate(event.description, vars);

    var eventObj = {
      id: uid('EVT'),
      typeId: event.id,
      label: event.label,
      category: event.category,
      description: description,
      location: loc,
      day: V.time.day,
      hasChoice: event.hasChoice,
      choices: event.choices || [],
      resolved: false,
    };

    V.events.history.push(eventObj);
    fire('event:spawned', { event: eventObj });

    // Generate feed item
    var feedItem = {
      id: uid('FI'),
      type: event.category,
      severity: event.hasChoice ? 'HIGH' : pick(['ELEVATED', 'ROUTINE', 'HIGH']),
      header: event.label.toUpperCase() + ' — ' + loc.theater.shortName,
      body: description,
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      eventId: eventObj.id,
      geo: { lat: loc.lat, lon: loc.lon },
    };

    pushFeedItem(feedItem);

    // Choice events auto-pause and show modal
    if (event.hasChoice) {
      eventObj.feedItemId = feedItem.id;
      showEventChoiceModal(eventObj);
    }

    // Non-choice events may affect theater risk
    if (!event.hasChoice) {
      if (V.theaters[loc.theaterId]) {
        V.theaters[loc.theaterId].risk = clamp(V.theaters[loc.theaterId].risk + 0.5, 1, 5);
      }
    }

    addLog('EVENT: ' + event.label + ' (' + loc.theater.shortName + ')', 'log-event');
  }

  // --- Event Choice Resolution ---

  hook('event:choice', function(data) {
    var event = null;
    for (var i = 0; i < V.events.history.length; i++) {
      if (V.events.history[i].id === data.eventId) {
        event = V.events.history[i];
        break;
      }
    }
    if (!event) return;

    var choice = event.choices[data.choiceIdx];
    event.resolved = true;
    event.chosenIdx = data.choiceIdx;

    // Apply choice effects
    if (choice && choice.effect) {
      switch (choice.effect) {
        case 'spawn_op':
          spawnOperationFromEvent(event);
          break;
        case 'spawn_op_urgent':
          spawnOperationFromEvent(event, true);
          break;
        case 'intel_gain':
          V.resources.intel += randInt(5, 15);
          addLog('Intelligence gain: +' + randInt(5, 15) + ' INTEL', 'log-info');
          break;
        case 'confidence_gain':
          V.resources.confidence = clamp(V.resources.confidence + randInt(2, 5), 0, 100);
          break;
        case 'confidence_small':
          V.resources.confidence = clamp(V.resources.confidence + randInt(1, 3), 0, 100);
          break;
        case 'budget_cost':
          V.resources.budget = clamp(V.resources.budget - randInt(5, 15), 0, 200);
          break;
        case 'theater_risk_up':
          if (event.location && V.theaters[event.location.theaterId]) {
            V.theaters[event.location.theaterId].risk = clamp(
              V.theaters[event.location.theaterId].risk + 1, 1, 5
            );
          }
          break;
      }
    }

    addLog('Decision: ' + choice.label, 'log-decision');
  });

})();
