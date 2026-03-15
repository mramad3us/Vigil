/* ============================================================
   VIGIL — systems/threats.js
   Threat generation, tick-based intel collection (passive + active),
   threat expiration & manifestation, Vigil assessment → Ops transition.

   Core loop: Threat spawns in INTEL phase → passive collection reveals
   fields over time → operator can deploy active collection assets to
   speed up discovery → Vigil assesses when enough intel is gathered →
   moves threat to OPS phase (creates operation) → direct action.

   Source-matched collection: each asset's collectionProfile determines
   its effectiveness per-field based on the field's source type.
   A Reaper (IMAGERY:5) accelerates IMAGERY fields but not HUMINT.
   ============================================================ */

var THREAT_TYPES = [
  // Global threats — can occur in any theater
  { id: 'TERROR_CELL', label: 'Terror Cell', weight: 3, threatRange: [3, 5] },
  { id: 'STATE_ACTOR', label: 'State Actor', weight: 2, threatRange: [4, 5] },
  { id: 'CYBER_GROUP', label: 'Cyber Threat Group', weight: 3, threatRange: [2, 4] },
  { id: 'HVT_TARGET', label: 'High-Value Target', weight: 2, threatRange: [3, 5] },
  { id: 'ASSET_COMPROMISED', label: 'Compromised Asset', weight: 1, threatRange: [3, 5] },
  { id: 'HOSTAGE_CRISIS', label: 'Hostage Crisis', weight: 1, threatRange: [4, 5] },

  // Region-restricted threats
  { id: 'INSURGENCY', label: 'Insurgent Movement', weight: 2, threatRange: [3, 5],
    theaters: ['MIDDLE_EAST', 'SOUTH_ASIA', 'AFRICA', 'LATIN_AMERICA'] },
  { id: 'CRIMINAL_ORG', label: 'Criminal Organization', weight: 2, threatRange: [2, 4], canBeMaritime: true,
    theaters: ['LATIN_AMERICA', 'AFRICA', 'EAST_ASIA', 'MIDDLE_EAST', 'EUROPE'] },
  { id: 'PROLIFERATOR', label: 'WMD Proliferator', weight: 1, threatRange: [4, 5],
    theaters: ['MIDDLE_EAST', 'EAST_ASIA', 'SOUTH_ASIA', 'RUSSIA_CIS'] },
];

// Military/strategic targets are DEFCON-1-only — never in the general weighted pool.
// Spawned exclusively by the DEFCON 1 forced-spawn path in AT_WAR countries.
var MILITARY_THREAT_TYPES = [
  { id: 'MILITARY_TARGET', label: 'Military Target', threatRange: [4, 5] },
  { id: 'STRATEGIC_TARGET', label: 'Strategic Target', threatRange: [5, 5] },
];

// --- Map threat types to operation types for the DA phase ---
var THREAT_TO_OP_TYPE = {
  TERROR_CELL: ['COUNTER_TERROR', 'SOF_RAID', 'DRONE_STRIKE', 'HVT_ELIMINATION', 'HOSTAGE_RESCUE'],
  STATE_ACTOR: ['MILITARY_STRIKE', 'SURVEILLANCE', 'CYBER_OP', 'DIPLOMATIC_RESPONSE'],
  CYBER_GROUP: ['CYBER_OP', 'INTEL_COLLECTION', 'SURVEILLANCE'],
  CRIMINAL_ORG: ['NAVAL_INTERDICTION', 'SOF_RAID', 'INTEL_COLLECTION', 'HVT_CAPTURE'],
  INSURGENCY: ['COUNTER_TERROR', 'MILITARY_STRIKE', 'SOF_RAID', 'DRONE_STRIKE', 'HVT_ELIMINATION'],
  PROLIFERATOR: ['SURVEILLANCE', 'INTEL_COLLECTION', 'MILITARY_STRIKE', 'SOF_RAID'],
  HOSTAGE_CRISIS: ['HOSTAGE_RESCUE', 'SOF_RAID', 'COUNTER_TERROR'],
  HVT_TARGET: ['HVT_ELIMINATION', 'HVT_CAPTURE', 'DRONE_STRIKE', 'TARGETED_KILLING', 'SOF_RAID'],
  ASSET_COMPROMISED: ['ASSET_EXTRACTION', 'SOF_RAID', 'HOSTAGE_RESCUE'],
  MILITARY_TARGET: ['MILITARY_STRIKE', 'DRONE_STRIKE', 'SOF_RAID'],
  STRATEGIC_TARGET: ['MILITARY_STRIKE', 'DRONE_STRIKE'],
};

// ===================================================================
//  BUILD INTEL FIELDS FOR A NEW THREAT
// ===================================================================

function buildThreatIntelFields(threatType, location, orgName, targetInfo) {
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
      value: generateIntelValue(def.key, location, orgName, def.key === 'TARGET_INTENT' ? targetInfo : null),
    });
  }
  return fields;
}

// ===================================================================
//  SPAWN THREAT
// ===================================================================

function spawnThreat(theaterId, forcedTypeId) {
  var type;
  if (forcedTypeId) {
    // Check both pools for the forced type
    var allTypes = THREAT_TYPES.concat(MILITARY_THREAT_TYPES);
    for (var ti = 0; ti < allTypes.length; ti++) {
      if (allTypes[ti].id === forcedTypeId) { type = allTypes[ti]; break; }
    }
  }
  if (!type) {
    // Filter threat types to those valid for this theater
    var eligible = THREAT_TYPES;
    if (theaterId) {
      eligible = THREAT_TYPES.filter(function(t) {
        return !t.theaters || t.theaters.indexOf(theaterId) >= 0;
      });
    }
    if (eligible.length === 0) eligible = THREAT_TYPES; // Fallback
    type = weightedPick(eligible);
  }

  // Military/strategic targets must only spawn in AT_WAR countries
  var isMilitaryType = (type.id === 'MILITARY_TARGET' || type.id === 'STRATEGIC_TARGET');
  var loc;
  if (isMilitaryType && theaterId) {
    loc = generateLocationInAtWarCountry(theaterId);
    if (!loc) return null; // No AT_WAR countries in theater — skip spawn
  } else {
    loc = theaterId ? generateLocationInTheater(theaterId) : generateRandomLocation();
  }

  // Maritime spawn for eligible threat types
  var isMaritime = false;
  if (type.canBeMaritime && typeof MARITIME_LOCATIONS !== 'undefined' && Math.random() < 0.45) {
    isMaritime = true;
    var maritimeLocs = MARITIME_LOCATIONS;
    if (theaterId) {
      var theaterMaritimeLocs = maritimeLocs.filter(function(m) { return m.theaterId === theaterId; });
      if (theaterMaritimeLocs.length > 0) maritimeLocs = theaterMaritimeLocs;
    }
    var mLoc = pick(maritimeLocs);
    var mTheater = getTheater(mLoc.theaterId);
    loc = {
      theater: mTheater,
      theaterId: mLoc.theaterId,
      city: mLoc.name,
      country: 'International Waters',
      lat: mLoc.lat,
      lon: mLoc.lon,
      maritime: true,
    };
  }

  var threatLevel = randInt(type.threatRange[0], type.threatRange[1]);

  // Expiration timer — higher threat = shorter window
  var expRange = THREAT_EXPIRATION[threatLevel] || THREAT_EXPIRATION[3];
  var expiresIn = randInt(expRange[0], expRange[1]);

  // ~12% chance of URGENT intel — drastically shortened window
  var isUrgent = Math.random() < 0.12;
  if (isUrgent) {
    expiresIn = randInt(120, 1440); // 2-24 hours
  }

  var orgName = generateOrgName();

  // Generate target location for threats that attack a specific place
  // Most threats target somewhere other than where they operate from
  var targetInfo = null;
  var hasTargetField = THREAT_INTEL_FIELDS[type.id] &&
    THREAT_INTEL_FIELDS[type.id].some(function(f) { return f.key === 'TARGET_INTENT'; });
  if (hasTargetField) {
    var targetLoc = typeof generateTargetLocation === 'function' ?
      generateTargetLocation(loc.country) : null;
    if (targetLoc) {
      targetInfo = { country: targetLoc.country, city: targetLoc.city };
    }
  }

  var threat = {
    id: uid('THR'),
    type: type.id,
    typeLabel: type.label,
    orgName: orgName,
    threatLevel: threatLevel,
    location: loc,
    status: 'ACTIVE',
    phase: 'INTEL',           // INTEL → OPS → RESOLVED | MANIFESTED | ARCHIVED
    daySpawned: V.time.day,
    spawnedAt: V.time.totalMinutes,
    expiresAt: V.time.totalMinutes + expiresIn,
    urgent: isUrgent,
    maritime: isMaritime || (loc.maritime && type.canBeMaritime) || false,

    // Target info (revealed when TARGET_INTENT field is collected)
    _targetInfo: targetInfo,

    // Intel collection state
    intelFields: buildThreatIntelFields(type.id, loc, orgName, targetInfo),
    collectorAssetIds: [],

    // Ops phase reference (set when moved to Ops)
    linkedOpId: null,

    // Urgency alert tracking
    urgencyAlertSent: false,
    criticalAlertSent: false,
  };

  V.threats.push(threat);
  fire('threat:spawned', { threat: threat });

  addLog('THREAT: ' + threat.orgName + ' identified (' + loc.theater.shortName + ')', 'log-threat');

  // Count pre-revealed fields
  var revealedCount = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) revealedCount++;
  }

  // Feed item
  var threatDescriptions = {
    TERROR_CELL: [
      'Vigil has identified a terror cell operating in ' + loc.city + ', ' + loc.country + '. SIGINT intercepts confirm organized activity targeting US interests in the ' + loc.theater.name + ' theater. Pattern analysis indicates attack planning directed at American personnel or facilities.',
      'A new terror cell has been flagged by Vigil in ' + loc.city + '. Cell communications reference US diplomatic and military targets in the region. Initial assessment indicates operational capability sufficient to strike American assets.',
      'Vigil intelligence network has surfaced a terror cell in ' + loc.city + ', ' + loc.country + '. Intercepted communications mention US installations, personnel movements, and security protocols. Threat to American interests assessed as CREDIBLE.',
    ],
    STATE_ACTOR: [
      'State-level threat activity detected in ' + loc.city + ', ' + loc.country + '. Force posture and intelligence indicators suggest actions directed against US strategic interests in the ' + loc.theater.name + ' theater. American military and diplomatic personnel in-theater may be at risk.',
      'Vigil has flagged state actor operations centered on ' + loc.city + '. Military movements and diplomatic communications indicate aggressive posture toward US allies and forward-deployed American forces. Escalation risk to US interests: ELEVATED.',
    ],
    CYBER_GROUP: [
      'Cyber threat group operating from ' + loc.city + ', ' + loc.country + ' has been identified targeting US critical infrastructure. Attribution in progress. Intrusion vectors aimed at American defense networks, financial systems, and government communications.',
      'Vigil has detected organized cyber intrusion operations originating from ' + loc.city + ' targeting US government and defense contractor networks. Exploitation patterns consistent with state-sponsored group conducting espionage against American interests.',
    ],
    CRIMINAL_ORG: isMaritime ? [
      'Vigil has identified a maritime smuggling operation in the ' + loc.city + '. Vessel intercepts indicate illicit cargo bound for US ports or allied nations. Naval interdiction assets recommended.',
      'Maritime criminal network detected operating in ' + loc.city + '. SIGINT confirms trafficking operations across international shipping lanes threatening US maritime security. Interdiction assets required.',
      'Organized criminal activity detected in ' + loc.city + '. Pattern analysis indicates at-sea transfer operations and evasive routing to avoid maritime patrols. US-bound contraband assessed as likely.',
    ] : [
      'Criminal organization flagged in ' + loc.city + ', ' + loc.country + '. Intelligence indicates trafficking operations threatening US national security — narcotics flowing to American cities, weapons, or human trafficking involving US-bound routes.',
      'Vigil has identified organized criminal activity in ' + loc.city + ' with direct links to US-bound operations. Scale and sophistication threaten American border security and domestic law enforcement. US citizens may be among victims.',
    ],
    INSURGENCY: [
      'Insurgent movement detected in ' + loc.city + ' region, ' + loc.country + '. Activity patterns indicate growing threat to US personnel, allied forces, and American-supported governance structures in the ' + loc.theater.name + ' theater.',
      'Vigil has flagged insurgent activity near ' + loc.city + ' threatening US forward operating positions and allied partners. Force estimates suggest organized resistance with capability to strike American installations.',
    ],
    PROLIFERATOR: [
      'WMD proliferation activity detected in ' + loc.country + '. Facility near ' + loc.city + ' shows signatures consistent with weapons program capable of threatening US forces in-theater and potentially the American homeland. Threat level: CRITICAL.',
      'Vigil has identified weapons proliferation activity in ' + loc.city + ', ' + loc.country + '. Procurement patterns indicate program targeting delivery systems capable of reaching US bases and allied nations. Direct threat to American strategic interests.',
    ],
    HOSTAGE_CRISIS: [
      'HOSTAGE SITUATION: Vigil has confirmed hostage-taking in ' + loc.city + ', ' + loc.country + '. US citizens are among those held by hostile elements. American lives are at immediate risk. Rescue planning authorized.',
      'Vigil intelligence confirms a hostage crisis in the ' + loc.theater.name + ' theater. US nationals seized in ' + loc.city + ' — captors are making demands through intermediaries. American lives in danger. Time-sensitive response required.',
      'Hostage crisis in ' + loc.city + ', ' + loc.country + '. Vigil has confirmed US government personnel among the hostages. Intermittent signals intelligence from the location suggests deteriorating conditions. Rescue or negotiation window narrowing.',
      'PRIORITY: Hostage situation developing in ' + loc.city + '. At least two American citizens confirmed held. Captors have issued demands referencing US foreign policy. State Department liaison activated. Military rescue options being assessed.',
    ],
    HVT_TARGET: [
      'Vigil has positively identified a high-value target operating in ' + loc.city + ', ' + loc.country + '. Target is responsible for operations that have killed or endangered American personnel. On the disposition matrix for 18+ months. Current location confidence: HIGH.',
      'HIGH-VALUE TARGET: Vigil pattern-of-life analysis has located a priority target in ' + loc.city + '. Target has directed attacks against US forces and allied partners in the ' + loc.theater.name + ' theater. Window of opportunity may be limited.',
      'Vigil intelligence network has surfaced a confirmed HVT in ' + loc.city + ', ' + loc.country + '. Target is a senior figure directly responsible for anti-American operations. Elimination or capture would significantly degrade threat to US interests in-theater.',
    ],
    ASSET_COMPROMISED: [
      'FLASH — COMPROMISED ASSET: A US intelligence officer has been burned in ' + loc.city + ', ' + loc.country + '. Asset is an American operative attempting to evade hostile surveillance. Extraction must be initiated before capture by local security services.',
      'Vigil has lost contact with a US intelligence officer operating under cover in ' + loc.city + '. Last transmission indicated compromise. American operative at risk of capture, interrogation, and exploitation. Asset extraction is time-critical.',
      'URGENT: US intelligence asset in ' + loc.city + ', ' + loc.country + ' has triggered emergency exfiltration protocol. American operative\'s cover identity compromised. Asset possesses knowledge of active US operations in the ' + loc.theater.name + ' theater. Extraction or sanitization required.',
    ],
    MILITARY_TARGET: [
      'Vigil ISR has identified a hostile military installation near ' + loc.city + ', ' + loc.country + '. Satellite imagery confirms active force disposition including armored vehicles, air defense emplacements, and command infrastructure. Target poses direct threat to US forward-deployed forces in the ' + loc.theater.name + ' theater.',
      'MILITARY TARGET: Vigil has designated a hostile military position in ' + loc.city + ' for strike assessment. SIGINT intercepts confirm this facility is coordinating operations against US and allied forces. Force protection demands rapid intelligence development and strike authorization.',
      'Hostile military forces identified operating from ' + loc.city + ', ' + loc.country + '. Vigil assesses this position as a staging area for offensive operations against US personnel and allied partners. ISR assets tasked for detailed target development.',
    ],
    STRATEGIC_TARGET: [
      'Vigil has designated a strategic facility near ' + loc.city + ', ' + loc.country + ' for target development. Facility output directly supports hostile military operations against US forces in the ' + loc.theater.name + ' theater. Precision strike package required — collateral assessment pending.',
      'STRATEGIC TARGET: High-value hostile infrastructure identified in ' + loc.city + '. Vigil imagery analysis confirms this facility is critical to adversary war-fighting capability. Neutralization would significantly degrade threat to US forces in-theater. Full intelligence picture required before strike authorization.',
    ],
  };

  var descPool = threatDescriptions[type.id] || threatDescriptions.TERROR_CELL;

  pushFeedItem({
    id: uid('FI'),
    type: 'THREAT',
    severity: isUrgent ? 'CRITICAL' : (threatLevel >= 4 ? 'HIGH' : 'ELEVATED'),
    header: (isUrgent ? 'URGENT THREAT: ' : 'THREAT IDENTIFIED: ') + orgName,
    body: pick(descPool) + ' Threat level: ' + threatLevel + '/5. ' +
      revealedCount + '/' + threat.intelFields.length + ' intelligence fields available. Passive collection initiated.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: loc.lat, lon: loc.lon },
  });

  // Urgent threats get an immediate pop-up alert
  if (isUrgent) {
    var urgentHoursLeft = Math.max(1, Math.round(expiresIn / 60));
    var urgentAlertMessages = [
      'FLASH INTELLIGENCE: ' + threat.orgName + ' (' + type.label + ') detected in ' +
        loc.city + ', ' + loc.country + '. Vigil assesses this threat will manifest within ' +
        urgentHoursLeft + ' hours. Immediate active collection and rapid response required. ' +
        'The ' + loc.theater.name + ' theater must be treated as priority.',
      'URGENT — ' + threat.orgName + ' identified near ' + loc.city + ', ' + loc.country +
        '. Intelligence indicates imminent activity by this ' + type.label.toLowerCase() +
        '. Estimated window: ' + urgentHoursLeft + ' hours. Deploy collection assets immediately ' +
        'or this threat WILL manifest before Vigil can assemble a response.',
      'TIME-CRITICAL INTEL: Vigil has intercepted indicators of imminent ' +
        type.label.toLowerCase() + ' activity by ' + threat.orgName + ' in the ' +
        loc.theater.name + ' theater (' + loc.city + '). ' +
        'Only ' + urgentHoursLeft + 'h remain before the operational window closes. ' +
        'All available assets should be redirected to this threat.',
      'PRIORITY FLASH: ' + threat.orgName + ' — ' + type.label + ' — ' +
        loc.city + ', ' + loc.country + '. Vigil pattern analysis indicates this threat is ' +
        'far more advanced than initial indicators suggested. Window to act: ' +
        urgentHoursLeft + ' hours. Failure to respond will result in manifestation ' +
        'in the ' + loc.theater.name + ' theater.',
    ];

    queueUrgentAlert({
      id: uid('FI'),
      type: 'URGENT_INTEL',
      severity: 'CRITICAL',
      header: 'URGENT INTEL: ' + threat.orgName,
      body: pick(urgentAlertMessages),
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      threatId: threat.id,
      geo: { lat: loc.lat, lon: loc.lon },
    });
  }

  return threat;
}

// ===================================================================
//  TICK HOOKS — Intel Collection, Expiration, Auto-spawn
// ===================================================================

(function() {

  // --- PASSIVE + ACTIVE INTEL COLLECTION (priority 6) ---
  // Every game-minute, each unrevealed field accumulates ticks.
  // Passive baseline: 1 tick per game-minute.
  // Active assets add their source-matched multiplier per field.

  hook('tick', function(data) {
    var minutesElapsed = data.minutesElapsed || 1;

    for (var i = 0; i < V.threats.length; i++) {
      var threat = V.threats[i];
      if (threat.phase !== 'INTEL' || threat.status !== 'ACTIVE') continue;

      // Build per-source multiplier from deployed collection assets
      var sourceBonus = {};
      if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
        for (var c = 0; c < threat.collectorAssetIds.length; c++) {
          var asset = getAsset(threat.collectorAssetIds[c]);
          // Only count assets actually on station (COLLECTING), not in-transit
          if (!asset || asset.status !== 'COLLECTING') continue;
          var profile = asset.collectionProfile || {};
          for (var src in profile) {
            sourceBonus[src] = (sourceBonus[src] || 0) + profile[src];
          }
        }
      }

      var anyRevealed = false;

      for (var f = 0; f < threat.intelFields.length; f++) {
        var field = threat.intelFields[f];
        if (field.revealed) continue;

        // Per-field multiplier: 1 (passive) + source-matched bonus
        var fieldMultiplier = 1 + (sourceBonus[field.source] || 0);
        var ticksThisCycle = minutesElapsed * fieldMultiplier;

        field.ticksAccumulated += ticksThisCycle;

        if (field.ticksAccumulated >= field.ticksToReveal) {
          field.revealed = true;
          field.ticksAccumulated = field.ticksToReveal;
          anyRevealed = true;
          V.playStats.intelFieldsRevealed = (V.playStats.intelFieldsRevealed || 0) + 1;

          // Feed notification for revealed field
          var revealMessages = [
            'Intelligence field revealed on ' + threat.orgName + ': ' + field.label + ' (' + field.source + ' source).',
            threat.orgName + ': ' + field.label + ' now available. ' + field.source + ' collection successful.',
            'New intelligence on ' + threat.orgName + ' — ' + field.label + ' field confirmed via ' + field.source + '.',
          ];
          addLog(pick(revealMessages), 'log-intel');
        }
      }

      if (anyRevealed) {
        fire('threat:intel:revealed', { threat: threat });

        // Check for foreign target in newly revealed TARGET_INTENT fields
        for (var ft = 0; ft < threat.intelFields.length; ft++) {
          var iField = threat.intelFields[ft];
          if (iField.key === 'TARGET_INTENT' && iField.revealed && !threat.foreignTarget) {
            if (threat._targetInfo) {
              threat.foreignTarget = {
                country: threat._targetInfo.country,
                city: threat._targetInfo.city,
                disclosed: false,
                disclosureType: null,
              };
              fire('threat:foreign_target', { threat: threat });
              addLog('INTEL: ' + threat.orgName + ' target identified as ' + threat._targetInfo.city + ', ' + threat._targetInfo.country + ' (non-US).', 'log-intel');
            }
          }
        }

        // Smart urgency: timing-related intel adjusts threat window
        adjustUrgencyFromIntel(threat);

        // Vigil assessment: is this threat "cooked" enough for direct action?
        assessThreatReadiness(threat);
      }
    }
  }, 6); // After asset transit (5)


  // --- THREAT EXPIRATION CHECK (priority 7) ---

  hook('tick', function() {
    var now = V.time.totalMinutes;

    for (var i = 0; i < V.threats.length; i++) {
      var threat = V.threats[i];
      if (threat.phase !== 'INTEL' || threat.status !== 'ACTIVE') continue;
      if (!threat.expiresAt) continue;

      var remaining = threat.expiresAt - now;
      var totalDuration = threat.expiresAt - threat.spawnedAt;
      var pctRemaining = totalDuration > 0 ? (remaining / totalDuration) : 0;

      // Urgency alerts:
      // For URGENT threats (short windows), use percentage-based thresholds
      // For normal threats (weeks/months/years), use absolute time thresholds
      if (threat.urgent) {
        // Percentage-based for urgent threats (already short windows)
        if (!threat.urgencyAlertSent && pctRemaining <= 0.4 && remaining > 0) {
          threat.urgencyAlertSent = true;
          fireUrgencyAlert(threat, 'ELEVATED');
        }
        if (!threat.criticalAlertSent && pctRemaining <= 0.15 && remaining > 0) {
          threat.criticalAlertSent = true;
          fireUrgencyAlert(threat, 'CRITICAL');
        }
      } else {
        // Absolute time thresholds for normal threats
        if (!threat.urgencyAlertSent && remaining <= 2880 && remaining > 0) { // 2 days
          threat.urgencyAlertSent = true;
          fireUrgencyAlert(threat, 'ELEVATED');
        }
        if (!threat.criticalAlertSent && remaining <= 720 && remaining > 0) { // 12 hours
          threat.criticalAlertSent = true;
          fireUrgencyAlert(threat, 'CRITICAL');
        }
      }

      // Expiration — threat manifests
      if (remaining <= 0) {
        manifestThreat(threat);
      }
    }
  }, 7); // After intel collection (6)


  // --- AUTO-SPAWN THREATS (theater volatility) ---

  hook('tick:hour', function() {
    for (var tid in V.theaters) {
      var theater = V.theaters[tid];
      var defcon = theater.defcon || 5;
      var defconMod = (typeof DEFCON_SPAWN_MOD !== 'undefined') ? (DEFCON_SPAWN_MOD[defcon] || 1.0) : 1.0;
      var conflictMod = (typeof getConflictSpawnMultiplier === 'function') ? getConflictSpawnMultiplier(tid) : 1.0;
      var prob = theater.volatility * 0.05 * defconMod * conflictMod;
      if (Math.random() < prob) {
        // At DEFCON 1 with AT_WAR countries, spawn military targets
        if (defcon <= 1) {
          var hasAtWar = false;
          var theaterDef = THEATERS[tid];
          if (theaterDef) {
            for (var ci = 0; ci < theaterDef.countries.length; ci++) {
              var cd = V.diplomacy[theaterDef.countries[ci]];
              if (cd && cd.atWar) { hasAtWar = true; break; }
            }
          }
          if (hasAtWar && Math.random() < 0.4) {
            spawnThreat(tid, Math.random() < 0.6 ? 'MILITARY_TARGET' : 'STRATEGIC_TARGET');
            continue;
          }
        }
        spawnThreat(tid);
      }
    }
  });


  // --- INITIAL THREATS ON GAME START ---

  hook('game:start', function() {
    if (V.initialized) return;
    var count = randInt(2, 3);
    for (var i = 0; i < count; i++) {
      spawnThreat();
    }
  }, 4); // After bases (1), assets (2), state init


  // --- AUTO-ASSESS UNREACHABLE INTEL THREATS ---

  hook('tick:hour', function() {
    var threats = getIntelThreats();
    for (var i = 0; i < threats.length; i++) {
      var threat = threats[i];
      var timeInfo = getThreatTimeRemaining(threat);

      // Skip if collectors are already deployed
      if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) continue;

      // Skip if already processed
      if (threat._autoAssessChecked) continue;

      // Check if any collection asset can reach in time
      var canReach = false;
      var collectionAssets = typeof getCollectionAssets === 'function' ? getCollectionAssets() : [];
      for (var a = 0; a < collectionAssets.length; a++) {
        var transit = calcTransitMinutes(collectionAssets[a], threat.location.lat, threat.location.lon);
        if (transit < timeInfo.minutes) {
          canReach = true;
          break;
        }
      }

      if (!canReach) {
        threat._autoAssessChecked = true;
        var progress = getThreatIntelProgress(threat);

        if (progress.pct >= 40) {
          // Enough intel — Vigil auto-moves to Ops
          addLog('VIGIL: Auto-assessing ' + threat.orgName + ' — no assets can reach in time but intel sufficient (' + progress.pct + '%).', 'log-vigil');
          vigilMoveThreatToOps(threat);
        } else {
          // Insufficient intel — alert
          pushFeedItem({
            id: uid('FI'),
            type: 'VIGIL_ALERT',
            severity: 'ELEVATED',
            header: 'UNREACHABLE: ' + threat.orgName,
            body: 'Vigil analysis: no collection assets can reach ' + threat.orgName + ' in ' + threat.location.city +
              ' before expiration. Intel at ' + progress.pct + '% — insufficient for direct action. ' +
              'Vigil recommends archiving this threat unless assets become available.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
            threatId: threat.id,
          });
        }
      }
    }
  }, 8);

})();

// ===================================================================
//  VIGIL ASSESSMENT — Is the threat "cooked"?
// ===================================================================

function assessThreatReadiness(threat) {
  if (threat.phase !== 'INTEL') return;

  var total = threat.intelFields.length;
  var revealed = 0;
  var hardRevealed = 0;
  var hardTotal = 0;

  for (var i = 0; i < total; i++) {
    var f = threat.intelFields[i];
    if (f.revealed) revealed++;
    if (f.difficulty === 'HARD' || f.difficulty === 'VERY_HARD') {
      hardTotal++;
      if (f.revealed) hardRevealed++;
    }
  }

  var revealPct = total > 0 ? (revealed / total) : 0;

  // Vigil triggers DA transition when:
  // 1. 60%+ of all fields revealed, OR
  // 2. 50%+ revealed AND at least one hard/very_hard revealed, OR
  // 3. Threat level 5 AND 40%+ revealed (too urgent to wait)
  var needsAction = false;
  if (revealPct >= 0.6) needsAction = true;
  else if (revealPct >= 0.5 && hardRevealed >= 1) needsAction = true;
  else if (threat.threatLevel >= 5 && revealPct >= 0.4) needsAction = true;

  // Only fire the pop-up once — when the threshold is first crossed
  if (threat._reachedActionable) return;
  if (threat.vigilRecommendsOps) return;

  if (needsAction) {
    threat._reachedActionable = true;
    threat.vigilRecommendsOps = true;

    var progress = getThreatIntelProgress(threat);
    var timeInfo = getThreatTimeRemaining(threat);
    var unrevealed = progress.total - progress.revealed;

    // Varied assessment messages
    var assessBodyMessages = [
      'Vigil has gathered sufficient intelligence on ' + threat.orgName + ' (' + threat.typeLabel + ') in ' +
        threat.location.city + ', ' + threat.location.country + ' to support direct action. ' +
        progress.revealed + '/' + progress.total + ' fields collected (' + progress.pct + '%). ' +
        (unrevealed > 0 ? unrevealed + ' field' + (unrevealed > 1 ? 's remain' : ' remains') + ' unrevealed — continued collection may improve operational outcomes.' : 'All intelligence fields resolved.'),
      'Intelligence analysis on ' + threat.orgName + ' in the ' +
        (threat.location.theater ? threat.location.theater.name : '?') + ' theater has reached actionable threshold. ' +
        'Current coverage: ' + progress.pct + '% (' + progress.revealed + ' of ' + progress.total + ' fields). ' +
        'Vigil can initiate direct action planning, or the operator may elect to continue intelligence collection for a more complete picture.',
      threat.orgName + ' (' + threat.typeLabel + ') presents a credible threat requiring response. ' +
        'Vigil has assembled a ' + progress.pct + '% intelligence package from ' + threat.location.city + '. ' +
        (unrevealed > 0 ? 'However, ' + unrevealed + ' intelligence gap' + (unrevealed > 1 ? 's remain' : ' remains') + ' that could affect operational planning. ' : '') +
        'Recommend operator review before transition to Operations.',
    ];

    var feedItem = {
      id: uid('FI'),
      type: 'VIGIL_ASSESSMENT',
      severity: threat.threatLevel >= 4 ? 'HIGH' : 'ELEVATED',
      header: 'VIGIL ASSESSMENT: ' + threat.orgName + ' — READY FOR ACTION',
      body: pick(assessBodyMessages),
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      threatId: threat.id,
      geo: { lat: threat.location.lat, lon: threat.location.lon },
      actions: [
        { label: 'MOVE TO OPERATIONS', onclick: "approveMoveThreatToOps('" + threat.id + "')", primary: true },
        { label: 'CONTINUE COLLECTION', onclick: "declineMoveThreatToOps('" + threat.id + "')", primary: false },
      ],
    };

    pushFeedItem(feedItem);

    addLog('VIGIL: ' + threat.orgName + ' assessed as actionable (' + progress.pct + '% intel). Awaiting operator decision.', 'log-vigil');
    fire('threat:vigil:recommends_ops', { threat: threat });
  }
}

// --- Operator Response to Vigil Assessment ---

function approveMoveThreatToOps(threatId) {
  var threat = getThreat(threatId);
  if (!threat || threat.phase !== 'INTEL') {
    dismissUrgentAlert();
    return;
  }

  dismissUrgentAlert();
  showResponseSelectionModal(threat);
}

// --- Response Selection Modal ---

function showResponseSelectionModal(threat) {
  var opTypes;
  if (threat.domestic && typeof DOMESTIC_THREAT_TO_OP_TYPE !== 'undefined') {
    opTypes = DOMESTIC_THREAT_TO_OP_TYPE[threat.type] || THREAT_TO_OP_TYPE[threat.type] || ['INVESTIGATION'];
  } else {
    opTypes = THREAT_TO_OP_TYPE[threat.type] || ['SURVEILLANCE'];
  }

  // AT_WAR: strip DIPLOMATIC_RESPONSE
  if (threat.location && threat.location.country && typeof getCountryStance === 'function') {
    var countryStance = getCountryStance(threat.location.country);
    if (countryStance && countryStance.level === 0) {
      opTypes = opTypes.filter(function(t) { return t !== 'DIPLOMATIC_RESPONSE'; });
      if (opTypes.length === 0) opTypes = ['MILITARY_STRIKE'];
    }
  }

  var html = '<div class="response-select-context">' +
    '<span class="response-select-tag">' + threat.typeLabel + '</span>' +
    '<span class="response-select-loc">' + threat.location.city + ', ' + threat.location.country + '</span>' +
    '<span class="response-select-org">' + threat.orgName + '</span>' +
  '</div>' +
  '<div class="response-select-instruction">Select an operational response. Vigil will generate deployment options based on your choice.</div>' +
  '<div class="response-select-grid">';

  for (var i = 0; i < opTypes.length; i++) {
    var otId = opTypes[i];
    var ot = OPERATION_TYPES[otId];
    if (!ot) continue;

    var successCls = ot.baseSuccessRate >= 75 ? 'high' : ot.baseSuccessRate >= 60 ? 'med' : 'low';
    var execLabel = ot.execHoursRange[0] + '-' + ot.execHoursRange[1] + 'h';

    html += '<div class="response-card" onclick="confirmResponseType(\'' + threat.id + '\',\'' + otId + '\')">' +
      '<div class="response-card-header">' +
        '<span class="response-card-name">' + ot.label + '</span>' +
        '<span class="response-card-short">' + ot.shortLabel + '</span>' +
      '</div>' +
      '<div class="response-card-desc">' + (ot.description || '') + '</div>' +
      '<div class="response-card-stats">' +
        '<span class="response-stat"><span class="response-stat-label">SUCCESS</span><span class="response-stat-value ' + successCls + '">' + ot.baseSuccessRate + '%</span></span>' +
        '<span class="response-stat"><span class="response-stat-label">EXEC TIME</span><span class="response-stat-value">' + execLabel + '</span></span>' +
        '<span class="response-stat"><span class="response-stat-label">REQUIRES</span><span class="response-stat-value">' + ot.requiredCapabilities.join(', ') + '</span></span>' +
      '</div>';

    // Pros
    if (ot.pros && ot.pros.length > 0) {
      html += '<div class="response-card-pros">';
      for (var p = 0; p < ot.pros.length; p++) {
        html += '<div class="response-pro">+ ' + ot.pros[p] + '</div>';
      }
      html += '</div>';
    }

    // Cons
    if (ot.cons && ot.cons.length > 0) {
      html += '<div class="response-card-cons">';
      for (var c = 0; c < ot.cons.length; c++) {
        html += '<div class="response-con">- ' + ot.cons[c] + '</div>';
      }
      html += '</div>';
    }

    // Warnings
    if (ot.illegalDomestic && threat.domestic) {
      html += '<div class="response-card-warning">ILLEGAL ON US SOIL</div>';
    }

    html += '</div>';
  }

  html += '</div>';

  showModal('SELECT RESPONSE TYPE', html, { pause: true });
  // Widen the modal for this content
  var box = document.querySelector('.modal-box');
  if (box) box.classList.add('modal-wide');
}

function confirmResponseType(threatId, opTypeId) {
  var threat = getThreat(threatId);
  if (!threat || threat.phase !== 'INTEL') {
    hideModal();
    return;
  }

  // Remove wide class before hiding
  var box = document.querySelector('.modal-box');
  if (box) box.classList.remove('modal-wide');
  hideModal();

  threat.vigilRecommendsOps = false;
  threat._chosenOpType = opTypeId;
  vigilMoveThreatToOps(threat);

  addLog('OPERATOR: Approved ' + (OPERATION_TYPES[opTypeId] ? OPERATION_TYPES[opTypeId].label : opTypeId) + ' response against ' + threat.orgName + '.', 'log-info');

  if (V.ui.activeWorkspace === 'feed' && typeof renderWorkspace === 'function') {
    renderWorkspace('feed');
  }
}

function declineMoveThreatToOps(threatId) {
  var threat = getThreat(threatId);
  if (!threat) { dismissUrgentAlert(); return; }

  threat.vigilRecommendsOps = false;
  threat._declinedOpsAt = V.time.totalMinutes;
  dismissUrgentAlert();

  addLog('OPERATOR: Continuing intel collection on ' + threat.orgName + '. Vigil assessment deferred.', 'log-info');

  // Re-render feed if viewing this threat
  if (V.ui.activeWorkspace === 'feed') {
    renderWorkspace('feed');
  }
}

// ===================================================================
//  MOVE THREAT: INTEL → OPS (no duplicates — the entity moves)
// ===================================================================

function vigilMoveThreatToOps(threat) {
  if (threat.phase !== 'INTEL') return;

  threat.phase = 'OPS';

  // Recall all collection assets
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  // Create operation — the threat's intel fields travel WITH the operation
  spawnOperationFromThreat(threat);

  addLog('VIGIL: ' + threat.orgName + ' transferred to Operations. Direct action planning initiated.', 'log-vigil');

  // Feed item — transition confirmation (operator already saw the assessment pop-up)
  var progress = getThreatIntelProgress(threat);
  var transferMessages = [
    threat.orgName + ' (' + threat.typeLabel + ') has been transferred to the Operations board. ' +
      'Intelligence package: ' + progress.revealed + '/' + progress.total + ' fields (' + progress.pct + '%). ' +
      'Vigil is analyzing deployment options for ' + threat.location.city + ', ' + threat.location.country + '.',
    'Operator-approved transition of ' + threat.orgName + ' to Operations. ' +
      'All gathered intelligence has been forwarded for direct action planning in the ' +
      (threat.location.theater ? threat.location.theater.name : '?') + ' theater.',
    'Operation initiated against ' + threat.orgName + ' based on ' + progress.pct + '% intelligence coverage. ' +
      'Threat profile and collected fields transferred to Operations for response coordination.',
  ];

  pushFeedItem({
    id: uid('FI'),
    type: 'OPERATION',
    severity: threat.threatLevel >= 4 ? 'HIGH' : 'ELEVATED',
    header: threat.orgName + ' → OPERATIONS',
    body: pick(transferMessages),
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    opId: threat.linkedOpId,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
  });

  fire('threat:moved:ops', { threat: threat });
}

// ===================================================================
//  THREAT MANIFESTATION — Bad outcome, intel window expired
// ===================================================================

function manifestThreat(threat) {
  threat.phase = 'MANIFESTED';
  threat.status = 'MANIFESTED';

  // Recall any collection assets
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  // Viability hit scaled by threat level
  var viabilityHit = threat.threatLevel * randInt(2, 4);
  V.resources.viability = clamp(V.resources.viability - viabilityHit, 0, 100);

  // Theater risk increase
  if (threat.location && threat.location.theaterId && V.theaters[threat.location.theaterId]) {
    V.theaters[threat.location.theaterId].risk = clamp(
      V.theaters[threat.location.theaterId].risk + 0.5, 1, 5
    );
  }

  V.playStats.threatsManifested = (V.playStats.threatsManifested || 0) + 1;

  addLog('THREAT MANIFESTED: ' + threat.orgName + ' — viability -' + viabilityHit + '%.', 'log-fail');

  // Rich, varied urgent alert messages
  var manifestMessages = [
    threat.orgName + ' has executed their operation in ' + threat.location.city + ', ' + threat.location.country + '. ' +
      'Intelligence window expired before Vigil could assemble a response. ' +
      'Viability impact: -' + viabilityHit + '%.',
    'FAILURE TO ACT: The operational window on ' + threat.orgName + ' has closed. ' +
      'The threat has manifested in ' + threat.location.city + '. ' +
      'Vigil was unable to gather sufficient intelligence in time for preemptive action. ' +
      'This incident will be noted in the monthly viability assessment.',
    threat.orgName + ' (' + threat.typeLabel + ') carried out their plan in ' + threat.location.city + '. ' +
      'Passive intelligence collection was insufficient and active collection assets were not deployed in time. ' +
      'The ' + threat.location.theater.name + ' theater risk level has increased.',
    'CRITICAL FAILURE: ' + threat.orgName + ' has manifested as a concrete threat in the ' +
      threat.location.theater.name + ' theater. Intelligence collection failed to keep pace with threat timeline. ' +
      'Viability impact: -' + viabilityHit + '%. ' +
      'Vigil recommends reviewing collection asset deployment protocols.',
    'The intelligence window on ' + threat.orgName + ' expired at ' + formatTimestamp({ day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) }) + '. ' +
      'Without adequate intelligence, no direct action was possible. ' +
      threat.location.city + ', ' + threat.location.country + ' is now an active incident zone. ' +
      'Operator performance logged.',
  ];

  queueUrgentAlert({
    id: uid('FI'),
    type: 'THREAT_MANIFEST',
    severity: 'CRITICAL',
    header: 'THREAT MANIFESTED: ' + threat.orgName,
    body: pick(manifestMessages),
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
  });
}

// ===================================================================
//  URGENCY ALERTS — Vigil warns operator when time is running out
// ===================================================================

function fireUrgencyAlert(threat, severity) {
  var unrevealed = 0;
  var hardUnrevealed = 0;
  var totalFields = threat.intelFields.length;
  var revealed = 0;

  for (var i = 0; i < totalFields; i++) {
    var f = threat.intelFields[i];
    if (f.revealed) {
      revealed++;
    } else {
      unrevealed++;
      if (f.difficulty === 'HARD' || f.difficulty === 'VERY_HARD') {
        hardUnrevealed++;
      }
    }
  }

  var remaining = Math.max(0, threat.expiresAt - V.time.totalMinutes);
  var hoursLeft = Math.max(1, Math.round(remaining / 60));
  var hasCollectors = threat.collectorAssetIds && threat.collectorAssetIds.length > 0;

  var elevatedMessages = [
    'Intelligence window on ' + threat.orgName + ' is narrowing — approximately ' + hoursLeft + ' hours remain. ' +
      unrevealed + ' of ' + totalFields + ' fields still unrevealed. ' +
      (hasCollectors ? 'Active collection assets are on station but may not be sufficient.' : 'Vigil recommends deploying active collection assets immediately.'),
    threat.orgName + ' in ' + threat.location.city + ' — collection window shrinking. ' +
      'Passive collection alone may not resolve ' + hardUnrevealed + ' critical intelligence fields in time. ' +
      (hasCollectors ? 'Consider deploying additional assets to supplement current collection.' : 'Deploy ISR or HUMINT assets to accelerate discovery.'),
    'Time-sensitive: ' + threat.orgName + ' threat expiration in approximately ' + hoursLeft + 'h. ' +
      revealed + '/' + totalFields + ' fields collected. Without ' +
      (hasCollectors ? 'additional' : 'active') + ' collection, Vigil cannot guarantee sufficient intel for direct action.',
    'Vigil analysis: current collection rate on ' + threat.orgName + ' is insufficient to meet threat timeline. ' +
      'Estimated ' + hoursLeft + 'h before manifestation. ' +
      unrevealed + ' intelligence gaps require resolution. Recommend active asset deployment.',
  ];

  var criticalMessages = [
    'URGENT: ' + threat.orgName + ' will manifest imminently (approximately ' + hoursLeft + 'h). ' +
      unrevealed + ' intelligence fields unresolved. ' +
      (hasCollectors ? 'Current collection assets insufficient. Deploy additional resources NOW.' : 'Deploy active collection assets NOW or accept blind engagement.'),
    'CRITICAL WINDOW: ' + threat.orgName + ' (' + threat.location.city + '). ' +
      'Intelligence collection failing to keep pace with threat timeline. ' +
      hardUnrevealed + ' critical fields unrevealed. Immediate action essential or threat will manifest.',
    'Vigil urgency alert: ' + threat.orgName + ' approaching manifestation threshold. ' +
      hoursLeft + 'h remaining. Without immediate ' +
      (hasCollectors ? 'reinforcement of' : 'deployment of') + ' active collection assets, ' +
      'this threat will manifest with inadequate intelligence for response. Viability impact projected: -' +
      (threat.threatLevel * 3) + '% or worse.',
    'FINAL WARNING — ' + threat.orgName + ': ' + hoursLeft + 'h to manifestation. ' +
      revealed + '/' + totalFields + ' intel fields resolved. Vigil is unable to recommend direct action ' +
      'without additional intelligence. The operator must act or accept consequences.',
  ];

  var messages = severity === 'CRITICAL' ? criticalMessages : elevatedMessages;

  var feedItem = {
    id: uid('FI'),
    type: 'VIGIL_ALERT',
    severity: severity,
    header: (severity === 'CRITICAL' ? 'CRITICAL: ' : 'ATTENTION: ') +
      threat.orgName + ' — COLLECTION URGENCY',
    body: pick(messages),
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
  };

  if (severity === 'CRITICAL') {
    queueUrgentAlert(feedItem);
  }
  pushFeedItem(feedItem);
}

// ===================================================================
//  SPAWN OPERATION FROM THREAT (Intel → Ops transition)
// ===================================================================
// The threat's intel fields MOVE to the operation. No duplicates.

function spawnOperationFromThreat(threat) {
  // Use operator's chosen response type if available, otherwise fallback to random
  var opType;
  if (threat._chosenOpType && OPERATION_TYPES[threat._chosenOpType]) {
    opType = threat._chosenOpType;
    delete threat._chosenOpType;
  } else {
    var opTypes;
    if (threat.domestic && typeof DOMESTIC_THREAT_TO_OP_TYPE !== 'undefined') {
      opTypes = DOMESTIC_THREAT_TO_OP_TYPE[threat.type] || THREAT_TO_OP_TYPE[threat.type] || ['INVESTIGATION'];
    } else {
      opTypes = THREAT_TO_OP_TYPE[threat.type] || ['SURVEILLANCE'];
    }
    if (threat.location && threat.location.country && typeof getCountryStance === 'function') {
      var countryStance = getCountryStance(threat.location.country);
      if (countryStance && countryStance.level === 0) {
        opTypes = opTypes.filter(function(t) { return t !== 'DIPLOMATIC_RESPONSE'; });
        if (opTypes.length === 0) opTypes = ['MILITARY_STRIKE'];
      }
    }
    opType = pick(opTypes);
  }

  // If NAVAL_INTERDICTION was picked, force maritime flag for consistency
  if (opType === 'NAVAL_INTERDICTION' && !threat.maritime) {
    threat.maritime = true;
  }

  var codename = generateCodename();
  var detectionDelay = randInt(2, 5); // Vigil processes near-instantly

  // Calculate remaining urgency from threat expiration
  var remainingMinutes = Math.max(360, threat.expiresAt - V.time.totalMinutes);
  var urgencyHours = Math.max(6, Math.round(remainingMinutes / 60));

  var opTypeLabel = OPERATION_TYPES[opType] ? OPERATION_TYPES[opType].label.toLowerCase() : 'response';

  // Rich, parametrized briefings
  var briefings = [
    'Vigil intelligence analysis has identified ' + threat.orgName + ' as requiring direct action in the ' +
      threat.location.theater.name + ' theater. ' + threat.typeLabel + ' activity in ' + threat.location.city +
      ', ' + threat.location.country + ' has reached actionable intelligence threshold. Operation ' + codename +
      ' authorized for ' + opTypeLabel + '. Operational window: ' + urgencyHours + ' hours.',
    'Following sustained intelligence collection on ' + threat.orgName + ', Vigil has assessed that direct action is ' +
      'the optimal response. ' + threat.typeLabel + ' operations centered on ' + threat.location.city +
      ' present an imminent threat requiring ' + opTypeLabel + '. Operation ' + codename + ' initiated. ' +
      'All gathered intelligence has been transferred to this operational file.',
    'Operation ' + codename + ' established in response to ' + threat.orgName + ' (' + threat.typeLabel + ') ' +
      'in ' + threat.location.city + ', ' + threat.location.country + '. Vigil recommends ' + opTypeLabel +
      ' based on threat profile analysis. Estimated ' + urgencyHours + 'h until threat manifests. ' +
      'Intelligence package contains ' + threat.intelFields.length + ' assessed fields.',
  ];

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
    urgencyHours: urgencyHours,

    // Lifecycle timing
    nextTransitionAt: V.time.totalMinutes + detectionDelay,
    phaseDuration: detectionDelay,
    expiresAt: null,
    execDurationMinutes: 0,
    transitStartTotalMinutes: 0,
    transitDurationMinutes: 0,

    // Vigil options (populated during ANALYSIS → OPTIONS_PRESENTED)
    options: [],
    selectedOptionIdx: undefined,
    vigilRecommendedIdx: undefined,
    deviatedFromVigil: false,
    assignedAssetIds: [],

    // Content — parametrized
    briefing: pick(briefings),
    fillVars: {},
    orgName: threat.orgName,
    targetAlias: generatePersonnelAlias(),
    budgetCost: randInt(5, 20),

    // Intel fields MOVED from threat — this is the same array reference
    intelFields: threat.intelFields,

    // Debrief (generated on resolution)
    debrief: null,

    // Domestic flag
    domestic: threat.domestic || false,
    // Maritime flag — open-ocean or port-city maritime threat
    maritime: threat.maritime || false,

    // References
    relatedEventId: null,
    relatedThreatId: threat.id,
  };

  threat.linkedOpId = op.id;
  V.operations.unshift(op);
  fire('operation:spawned', { operation: op });

  addLog('OP ' + codename + ' created targeting ' + threat.orgName + '.', 'log-op');
}

// ===================================================================
//  SPAWN OPERATION FROM EVENT (separate path — no threat card)
// ===================================================================

function spawnOperationFromEvent(event, urgent) {
  var loc = event.location || generateRandomLocation();
  var codename = generateCodename();
  var threatLvl = randInt(2, 5);

  var opType = EVENT_TO_OP_TYPE[event.category] || 'SURVEILLANCE';
  var urgencyHours = urgent ? randInt(12, 36) : randInt(48, 168);
  var detectionDelay = randInt(2, 5);

  var op = {
    id: uid('OP'),
    codename: codename,
    label: event.label,
    category: event.category,
    operationType: opType,
    status: 'DETECTED',
    threatLevel: threatLvl,
    location: loc,
    geo: { lat: loc.lat, lon: loc.lon },
    daySpawned: V.time.day,
    urgencyHours: urgencyHours,

    nextTransitionAt: V.time.totalMinutes + detectionDelay,
    phaseDuration: detectionDelay,
    expiresAt: null,
    execDurationMinutes: 0,
    transitStartTotalMinutes: 0,
    transitDurationMinutes: 0,

    options: [],
    selectedOptionIdx: undefined,
    vigilRecommendedIdx: undefined,
    deviatedFromVigil: false,
    assignedAssetIds: [],

    briefing: event.description,
    fillVars: {},
    orgName: null,
    targetAlias: generatePersonnelAlias(),
    budgetCost: randInt(5, 20),

    // Event-based ops don't carry threat intel
    intelFields: null,

    debrief: null,
    relatedEventId: event.id,
    relatedThreatId: null,
  };

  V.operations.unshift(op);
  fire('operation:spawned', { operation: op });

  addLog('OP ' + codename + ' detected. Vigil initiating analysis.', 'log-op');

  pushFeedItem({
    id: uid('FI'),
    type: 'OPERATION',
    severity: urgent ? 'HIGH' : 'ELEVATED',
    header: 'THREAT DETECTED: ' + codename,
    body: 'Vigil has detected a new threat requiring operational response in ' + loc.city + ', ' + loc.country +
      '. Operation ' + codename + ' has been initiated. Vigil is analyzing deployment options.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    opId: op.id,
    geo: { lat: loc.lat, lon: loc.lon },
  });
}

// ===================================================================
//  HELPERS
// ===================================================================

// --- Smart Urgency: intel fields that reveal timing info adjust threat window ---
// Timing-sensitive field keys and the urgency windows they can impose (in minutes)
var URGENCY_INTEL_KEYS = {
  ATTACK_PLANNING: true,
  COMMS_PATTERN: true,
  RESCUE_WINDOW: true,
  HOSTAGE_CONDITION: true,
  ESCALATION_POSTURE: true,
  OPERATIONAL_TIMELINE: true,
  STRATEGIC_INTENT: true,
};

// Parse a revealed intel value for timing indicators and return new expiry minutes from now
function parseUrgencyFromValue(value) {
  if (!value) return null;
  var v = value.toLowerCase();

  // Imminent / hours-based windows
  if (v.indexOf('imminent') >= 0 || v.indexOf('48-72 hours') >= 0 || v.indexOf('48h') >= 0) {
    return randInt(48 * 60, 72 * 60); // 48-72h
  }
  if (/within (\d+)h/.test(v)) {
    var h = parseInt(RegExp.$1);
    return randInt(h * 45, h * 60); // slight compression
  }
  if (/within (\d+) hours?/.test(v)) {
    var h2 = parseInt(RegExp.$1);
    return randInt(h2 * 45, h2 * 60);
  }
  if (/(\d+)h ultimatum/.test(v) || /(\d+)h deadline/.test(v)) {
    var h3 = parseInt(RegExp.$1);
    return randInt(h3 * 50, h3 * 60);
  }
  // "window closing" = urgent but unspecified → 24-48h
  if (v.indexOf('window closing') >= 0 || v.indexOf('reinforcements expected') >= 0) {
    return randInt(24 * 60, 48 * 60);
  }
  // "no proof of life for 72h" or "condition unknown" = urgent
  if (v.indexOf('no proof of life') >= 0 || v.indexOf('condition unknown') >= 0 || v.indexOf('urgency critical') >= 0) {
    return randInt(12 * 60, 36 * 60);
  }
  // "medical intervention within 24 hours" or similar
  if (/medical.{0,30}within (\d+)/.test(v)) {
    var h4 = parseInt(RegExp.$1);
    return randInt(h4 * 40, h4 * 60);
  }
  // Week-range: "2-4 weeks", "timeline: 2-4 weeks"
  if (/(\d+)-(\d+) weeks?/.test(v)) {
    var w1 = parseInt(RegExp.$1), w2 = parseInt(RegExp.$2);
    return randInt(w1 * 7 * 24 * 60, w2 * 7 * 24 * 60);
  }
  // "elevated alert", "strategic rocket forces" = days
  if (v.indexOf('elevated alert') >= 0 || v.indexOf('being fueled') >= 0) {
    return randInt(3 * 24 * 60, 7 * 24 * 60);
  }

  return null; // No actionable timing info
}

function adjustUrgencyFromIntel(threat) {
  if (!threat.intelFields || threat._urgencyAdjusted) return;

  for (var i = 0; i < threat.intelFields.length; i++) {
    var field = threat.intelFields[i];
    if (!field.revealed || !URGENCY_INTEL_KEYS[field.key]) continue;
    if (field._urgencyProcessed) continue;

    field._urgencyProcessed = true;
    var newExpiryMinutes = parseUrgencyFromValue(field.value);
    if (!newExpiryMinutes) continue;

    var now = V.time.totalMinutes;
    var newExpiresAt = now + newExpiryMinutes;
    var oldExpiresAt = threat.expiresAt;

    // Only tighten the window, never extend it
    if (newExpiresAt < oldExpiresAt) {
      threat.expiresAt = newExpiresAt;
      threat._urgencyAdjusted = true;

      // Reset urgency alerts so they re-trigger at appropriate thresholds
      threat.urgencyAlertSent = false;
      threat.criticalAlertSent = false;

      var remaining = getThreatTimeRemaining(threat);
      var timeStr = remaining.hours < 48 ? remaining.hours + 'h' :
        remaining.days < 30 ? remaining.days + 'd' : Math.round(remaining.days / 30) + 'mo';
      addLog('VIGIL ANALYSIS: ' + threat.orgName + ' — intel indicates operational window of ' +
        timeStr + '. Threat timeline adjusted.', 'log-warn');

      // Push a feed notification
      fire('notification:push', {
        title: 'TIMELINE ADJUSTMENT',
        body: field.label + ' on ' + threat.orgName + ' reveals shortened operational window. ' +
          'Estimated ' + timeStr + ' remaining.',
        severity: remaining.hours <= 48 ? 'HIGH' : 'ELEVATED',
        icon: '⏱',
      });
      break; // Only adjust once per threat
    }
  }
}

function getIntelThreats() {
  return V.threats.filter(function(t) {
    return t.phase === 'INTEL' && t.status === 'ACTIVE';
  });
}

function getThreatIntelProgress(threat) {
  if (!threat.intelFields || threat.intelFields.length === 0) {
    return { revealed: 0, total: 0, pct: 0 };
  }
  var revealed = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) revealed++;
  }
  return {
    revealed: revealed,
    total: threat.intelFields.length,
    pct: Math.round((revealed / threat.intelFields.length) * 100),
  };
}

function getThreatTimeRemaining(threat) {
  if (!threat.expiresAt) return { minutes: Infinity, hours: Infinity, days: Infinity, pct: 100 };
  var remaining = Math.max(0, threat.expiresAt - V.time.totalMinutes);
  var total = threat.expiresAt - threat.spawnedAt;
  return {
    minutes: remaining,
    hours: Math.round(remaining / 60),
    days: Math.round(remaining / 1440),
    pct: total > 0 ? Math.round((remaining / total) * 100) : 0,
  };
}

function archiveThreat(threatId) {
  var threat = getThreat(threatId);
  if (!threat) return;
  threat.phase = 'ARCHIVED';
  threat.status = 'ARCHIVED';

  // Recall collectors
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  addLog(threat.orgName + ' archived — threat assessment: non-actionable.', 'log-info');
}
