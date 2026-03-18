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
  { id: "TERROR_CELL", label: "Terror Cell", weight: 4, threatRange: [3, 5] },
  { id: "STATE_ACTOR", label: "State Actor", weight: 3, threatRange: [4, 5] },
  {
    id: "CYBER_GROUP",
    label: "Cyber Threat Group",
    weight: 2,
    threatRange: [2, 4],
  },
  {
    id: "HVT_TARGET",
    label: "High-Value Target",
    weight: 2,
    threatRange: [3, 5],
  },
  {
    id: "ASSET_COMPROMISED",
    label: "Compromised Asset",
    weight: 1,
    threatRange: [3, 5],
  },
  {
    id: "HOSTAGE_CRISIS",
    label: "Hostage Crisis",
    weight: 1,
    threatRange: [4, 5],
  },

  // Region-restricted threats
  {
    id: "CRIMINAL_ORG",
    label: "Criminal Organization",
    weight: 3,
    threatRange: [2, 4],
    canBeMaritime: true,
    theaters: ["LATIN_AMERICA", "AFRICA", "EAST_ASIA", "MIDDLE_EAST", "EUROPE"],
  },
  {
    id: "PROLIFERATOR",
    label: "WMD Proliferator",
    weight: 1,
    threatRange: [4, 5],
    theaters: ["MIDDLE_EAST", "EAST_ASIA", "SOUTH_ASIA", "RUSSIA_CIS"],
  },
  {
    id: "ILLEGAL_AGENT_FOREIGN",
    label: "Foreign Illegal Agent",
    weight: 1,
    threatRange: [3, 5],
    theaters: [
      "EUROPE",
      "MIDDLE_EAST",
      "EAST_ASIA",
      "SOUTH_ASIA",
      "AFRICA",
      "RUSSIA_CIS",
      "LATIN_AMERICA",
    ],
  },
];

// Military/strategic targets are DEFCON-1-only — never in the general weighted pool.
// Spawned exclusively by the DEFCON 1 forced-spawn path in AT_WAR countries.
var MILITARY_THREAT_TYPES = [
  { id: "MILITARY_TARGET", label: "Military Target", threatRange: [4, 5] },
  { id: "STRATEGIC_TARGET", label: "Strategic Target", threatRange: [5, 5] },
];

// Countries where WMD proliferation threats can spawn (must also have ≤10% relations)
var PROLIFERATOR_COUNTRIES = [
  "Iran",
  "North Korea",
  "Syria",
  "Pakistan",
  //"Russia",
  //"China",
  "Belarus",
  "Libya",
];

// --- Map threat types to operation types for the DA phase ---
var THREAT_TO_OP_TYPE = {
  TERROR_CELL: [
    "COUNTER_TERROR",
    "SOF_RAID",
    "MILITARY_STRIKE",
    "DRONE_STRIKE",
    "SURVEILLANCE",
    "INTEL_COLLECTION",
  ],
  STATE_ACTOR: [
    "MILITARY_STRIKE",
    "DRONE_STRIKE",
    "SOF_RAID",
    "SURVEILLANCE",
    "INTEL_COLLECTION",
    "CYBER_OP",
    "DIPLOMATIC_RESPONSE",
  ],
  CYBER_GROUP: ["CYBER_OP", "SURVEILLANCE", "INTEL_COLLECTION"],
  CRIMINAL_ORG: [
    "SOF_RAID",
    "SURVEILLANCE",
    "INTEL_COLLECTION",
    "NAVAL_INTERDICTION",
  ],
  PROLIFERATOR: [
    "SURVEILLANCE",
    "INTEL_COLLECTION",
    "MILITARY_STRIKE",
    "DRONE_STRIKE",
    "SOF_RAID",
  ],
  HOSTAGE_CRISIS: ["HOSTAGE_RESCUE"],
  HVT_TARGET: [
    "HVT_ELIMINATION",
    "TARGETED_KILLING",
    "HVT_CAPTURE",
    "COVERT_SNATCH",
    "MILITARY_STRIKE",
    "DRONE_STRIKE",
    "SURVEILLANCE",
    "INTEL_COLLECTION",
  ],
  ASSET_COMPROMISED: ["ASSET_EXTRACTION", "SOF_RAID"],
  MILITARY_TARGET: ["MILITARY_STRIKE", "DRONE_STRIKE", "SOF_RAID"],
  STRATEGIC_TARGET: ["MILITARY_STRIKE", "DRONE_STRIKE"],
  ILLEGAL_AGENT_FOREIGN: ["CAPTURE_OP", "TARGETED_KILLING", "BURN_NOTICE"],
};

// ===================================================================
//  BUILD INTEL FIELDS FOR A NEW THREAT
// ===================================================================

function buildThreatIntelFields(
  threatType,
  location,
  orgName,
  targetInfo,
  sponsorCountry,
) {
  var fieldDefs = THREAT_INTEL_FIELDS[threatType];
  if (!fieldDefs) return [];

  var fields = [];
  for (var i = 0; i < fieldDefs.length; i++) {
    var def = fieldDefs[i];
    var diff = INTEL_DIFFICULTY[def.difficulty];
    if (!diff) continue;

    var ticksToReveal = randInt(diff.ticksRange[0], diff.ticksRange[1]);
    var preRevealed = Math.random() < diff.preRevealChance;

    var value = generateIntelValue(
      def.key,
      location,
      orgName,
      def.key === "TARGET_INTENT" ? targetInfo : null,
      sponsorCountry,
    );

    var fieldObj = {
      key: def.key,
      label: def.label,
      difficulty: def.difficulty,
      source: def.source,
      ticksToReveal: ticksToReveal,
      ticksAccumulated: preRevealed ? ticksToReveal : 0,
      revealed: preRevealed,
      value: value,
    };

    // Parse tagged prefixes from intel values
    var taggedKeys = {
      CELL_STRUCTURE: "_cellType",
      PROGRAM_TYPE: "_programType",
      ASSET_CONDITION: "_assetStatus",
      ACTIVITY_TYPE: "_activityType",
      GUARD_FORCE: "_guardLevel",
    };
    if (
      taggedKeys[def.key] &&
      value.indexOf("|") > 0 &&
      value.indexOf("|") < 12
    ) {
      var pipeIdx = value.indexOf("|");
      var tag = value.substring(0, pipeIdx);
      fieldObj.value = value.substring(pipeIdx + 1);
      fieldObj[taggedKeys[def.key]] = tag;
    }

    fields.push(fieldObj);
  }
  return fields;
}

// ===================================================================
//  SPAWN THREAT
// ===================================================================

function spawnThreat(theaterId, forcedTypeId) {
  // Resolve location first so we know the theater for type filtering
  var loc = theaterId
    ? generateLocationInTheater(theaterId)
    : generateRandomLocation();
  var effectiveTheater = theaterId || (loc && loc.theaterId) || null;

  var type;
  if (forcedTypeId) {
    // Check both pools for the forced type
    var allTypes = THREAT_TYPES.concat(MILITARY_THREAT_TYPES);
    for (var ti = 0; ti < allTypes.length; ti++) {
      if (allTypes[ti].id === forcedTypeId) {
        type = allTypes[ti];
        break;
      }
    }
  }
  if (!type) {
    // Filter threat types to those valid for this theater
    // Exclude ILLEGAL_AGENT_FOREIGN — spawned by illegals.js with its own pipeline
    var eligible = THREAT_TYPES.filter(function (t) {
      return t.id !== "ILLEGAL_AGENT_FOREIGN";
    });
    if (effectiveTheater) {
      eligible = eligible.filter(function (t) {
        return !t.theaters || t.theaters.indexOf(effectiveTheater) >= 0;
      });
    }
    if (eligible.length === 0)
      eligible = THREAT_TYPES.filter(function (t) {
        return t.id !== "ILLEGAL_AGENT_FOREIGN";
      }); // Fallback
    type = weightedPick(eligible);
  }

  // PROLIFERATOR: must spawn in a plausible country with ≤10% relations
  if (type.id === "PROLIFERATOR") {
    var prolifCountry = loc ? loc.country : null;
    var prolifOk =
      prolifCountry && PROLIFERATOR_COUNTRIES.indexOf(prolifCountry) >= 0;
    if (
      prolifOk &&
      typeof V !== "undefined" &&
      V.diplomacy &&
      V.diplomacy[prolifCountry]
    ) {
      prolifOk = V.diplomacy[prolifCountry].relations <= 10;
    }
    if (!prolifOk) {
      // Re-roll: skip this spawn entirely — the type doesn't fit this location
      return null;
    }
  }

  // Military/strategic targets must only spawn in AT_WAR countries
  var isMilitaryType =
    type.id === "MILITARY_TARGET" || type.id === "STRATEGIC_TARGET";
  if (isMilitaryType && effectiveTheater) {
    loc = generateLocationInAtWarCountry(effectiveTheater);
    if (!loc) return null; // No AT_WAR countries in theater — skip spawn
  }

  // Maritime spawn for eligible threat types
  var isMaritime = false;
  if (
    type.canBeMaritime &&
    typeof MARITIME_LOCATIONS !== "undefined" &&
    Math.random() < 0.08
  ) {
    isMaritime = true;
    var maritimeLocs = MARITIME_LOCATIONS;
    if (theaterId) {
      var theaterMaritimeLocs = maritimeLocs.filter(function (m) {
        return m.theaterId === theaterId;
      });
      if (theaterMaritimeLocs.length > 0) maritimeLocs = theaterMaritimeLocs;
    }
    var mLoc = pick(maritimeLocs);
    var mTheater = getTheater(mLoc.theaterId);
    loc = {
      theater: mTheater,
      theaterId: mLoc.theaterId,
      city: mLoc.name,
      country: "International Waters",
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
  var hasTargetField =
    THREAT_INTEL_FIELDS[type.id] &&
    THREAT_INTEL_FIELDS[type.id].some(function (f) {
      return f.key === "TARGET_INTENT";
    });
  if (hasTargetField) {
    var targetLoc =
      typeof generateTargetLocation === "function"
        ? generateTargetLocation(loc.country)
        : null;
    if (targetLoc) {
      targetInfo = { country: targetLoc.country, city: targetLoc.city };
    }
  }

  // STATE_ACTOR: pick a hostile sponsor country (relations ≤10%)
  var sponsorCountry = null;
  if (type.id === "STATE_ACTOR" && typeof V !== "undefined" && V.diplomacy) {
    var hostileCountries = [];
    for (var dc in V.diplomacy) {
      if (V.diplomacy[dc].relations <= 10 && dc !== loc.country) {
        hostileCountries.push(dc);
      }
    }
    sponsorCountry =
      hostileCountries.length > 0 ? pick(hostileCountries) : loc.country;
  }

  var threat = {
    id: uid("THR"),
    type: type.id,
    typeLabel: type.label,
    orgName: orgName,
    threatLevel: threatLevel,
    location: loc,
    status: "ACTIVE",
    phase: "INTEL", // INTEL → OPS → RESOLVED | MANIFESTED | ARCHIVED
    daySpawned: V.time.day,
    spawnedAt: V.time.totalMinutes,
    expiresAt: V.time.totalMinutes + expiresIn,
    urgent: isUrgent,
    maritime: isMaritime,
    sponsorCountry: sponsorCountry,

    // Target info (revealed when TARGET_INTENT field is collected)
    _targetInfo: targetInfo,

    // Intel collection state
    intelFields: buildThreatIntelFields(
      type.id,
      loc,
      orgName,
      targetInfo,
      sponsorCountry,
    ),
    collectorAssetIds: [],

    // Ops phase reference (set when moved to Ops)
    linkedOpId: null,

    // Urgency alert tracking
    urgencyAlertSent: false,
    criticalAlertSent: false,
  };

  // Extract tagged intel metadata from pre-revealed fields
  for (var ci = 0; ci < threat.intelFields.length; ci++) {
    var f = threat.intelFields[ci];
    if (!f.revealed) continue;
    if (f.key === "CELL_STRUCTURE" && f._cellType)
      threat.cellType = f._cellType;
    if (f.key === "PROGRAM_TYPE" && f._programType)
      threat.programType = f._programType;
    if (f.key === "ASSET_CONDITION" && f._assetStatus)
      threat.assetStatus = f._assetStatus;
    if (f.key === "ACTIVITY_TYPE" && f._activityType)
      threat.activityType = f._activityType;
  }

  V.threats.push(threat);
  fire("threat:spawned", { threat: threat });

  addLog(
    "THREAT: " + threat.orgName + " identified (" + loc.theater.shortName + ")",
    "log-threat",
  );

  // Count pre-revealed fields
  var revealedCount = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) revealedCount++;
  }

  // Feed item
  var threatDescriptions = {
    TERROR_CELL: [
      "Vigil has identified a terror cell operating in " +
        loc.city +
        ", " +
        loc.country +
        ". SIGINT intercepts confirm organized activity targeting US interests in the " +
        loc.theater.name +
        " theater. Pattern analysis indicates attack planning directed at American personnel or facilities.",
      "A new terror cell has been flagged by Vigil in " +
        loc.city +
        ". Cell communications reference US diplomatic and military targets in the region. Initial assessment indicates operational capability sufficient to strike American assets.",
      "Vigil intelligence network has surfaced a terror cell in " +
        loc.city +
        ", " +
        loc.country +
        ". Intercepted communications mention US installations, personnel movements, and security protocols. Threat to American interests assessed as CREDIBLE.",
    ],
    STATE_ACTOR: [
      "State-level threat activity detected in " +
        loc.city +
        ", " +
        loc.country +
        ". Force posture and intelligence indicators suggest actions directed against US strategic interests in the " +
        loc.theater.name +
        " theater. American military and diplomatic personnel in-theater may be at risk.",
      "Vigil has flagged state actor operations centered on " +
        loc.city +
        ". Military movements and diplomatic communications indicate aggressive posture toward US allies and forward-deployed American forces. Escalation risk to US interests: ELEVATED.",
    ],
    CYBER_GROUP: [
      "Cyber threat group operating from " +
        loc.city +
        ", " +
        loc.country +
        " has been identified targeting US critical infrastructure. Attribution in progress. Intrusion vectors aimed at American defense networks, financial systems, and government communications.",
      "Vigil has detected organized cyber intrusion operations originating from " +
        loc.city +
        " targeting US government and defense contractor networks. Exploitation patterns consistent with state-sponsored group conducting espionage against American interests.",
    ],
    CRIMINAL_ORG: isMaritime
      ? [
          "Vigil has identified a maritime smuggling operation in the " +
            loc.city +
            ". Vessel intercepts indicate illicit cargo bound for US ports or allied nations. Naval interdiction assets recommended.",
          "Maritime criminal network detected operating in " +
            loc.city +
            ". SIGINT confirms trafficking operations across international shipping lanes threatening US maritime security. Interdiction assets required.",
          "Organized criminal activity detected in " +
            loc.city +
            ". Pattern analysis indicates at-sea transfer operations and evasive routing to avoid maritime patrols. US-bound contraband assessed as likely.",
        ]
      : [
          "Criminal organization flagged in " +
            loc.city +
            ", " +
            loc.country +
            ". Intelligence indicates trafficking operations threatening US national security — narcotics flowing to American cities, weapons, or human trafficking involving US-bound routes.",
          "Vigil has identified organized criminal activity in " +
            loc.city +
            " with direct links to US-bound operations. Scale and sophistication threaten American border security and domestic law enforcement. US citizens may be among victims.",
        ],
    PROLIFERATOR: [
      "WMD proliferation activity detected in " +
        loc.country +
        ". Facility near " +
        loc.city +
        " shows signatures consistent with weapons program capable of threatening US forces in-theater and potentially the American homeland. Threat level: CRITICAL.",
      "Vigil has identified weapons proliferation activity in " +
        loc.city +
        ", " +
        loc.country +
        ". Procurement patterns indicate program targeting delivery systems capable of reaching US bases and allied nations. Direct threat to American strategic interests.",
    ],
    HOSTAGE_CRISIS: [
      "HOSTAGE SITUATION: Vigil has confirmed hostage-taking in " +
        loc.city +
        ", " +
        loc.country +
        ". US citizens are among those held by hostile elements. American lives are at immediate risk. Rescue planning authorized.",
      "Vigil intelligence confirms a hostage crisis in the " +
        loc.theater.name +
        " theater. US nationals seized in " +
        loc.city +
        " — captors are making demands through intermediaries. American lives in danger. Time-sensitive response required.",
      "Hostage crisis in " +
        loc.city +
        ", " +
        loc.country +
        ". Vigil has confirmed US government personnel among the hostages. Intermittent signals intelligence from the location suggests deteriorating conditions. Rescue or negotiation window narrowing.",
      "PRIORITY: Hostage situation developing in " +
        loc.city +
        ", " +
        loc.country +
        ". At least two American citizens confirmed held. Captors have issued demands referencing US foreign policy. State Department liaison activated. Military rescue options being assessed.",
    ],
    HVT_TARGET: [
      "Vigil has positively identified a high-value target operating in " +
        loc.city +
        ", " +
        loc.country +
        ". Target is responsible for operations that have killed or endangered American personnel. On the disposition matrix for 18+ months. Current location confidence: HIGH.",
      "HIGH-VALUE TARGET: Vigil pattern-of-life analysis has located a priority target in " +
        loc.city +
        ". Target has directed attacks against US forces and allied partners in the " +
        loc.theater.name +
        " theater. Window of opportunity may be limited.",
      "Vigil intelligence network has surfaced a confirmed HVT in " +
        loc.city +
        ", " +
        loc.country +
        ". Target is a senior figure directly responsible for anti-American operations. Elimination or capture would significantly degrade threat to US interests in-theater.",
    ],
    ASSET_COMPROMISED: [
      "FLASH — COMPROMISED ASSET: A US intelligence officer has been burned in " +
        loc.city +
        ", " +
        loc.country +
        ". Asset is an American operative attempting to evade hostile surveillance. Extraction must be initiated before capture by local security services.",
      "Vigil has lost contact with a US intelligence officer operating under cover in " +
        loc.city +
        ". Last transmission indicated compromise. American operative at risk of capture, interrogation, and exploitation. Asset extraction is time-critical.",
      "URGENT: US intelligence asset in " +
        loc.city +
        ", " +
        loc.country +
        " has triggered emergency exfiltration protocol. American operative's cover identity compromised. Asset possesses knowledge of active US operations in the " +
        loc.theater.name +
        " theater. Extraction or sanitization required.",
    ],
    MILITARY_TARGET: [
      "Vigil ISR has identified a hostile military installation near " +
        loc.city +
        ", " +
        loc.country +
        ". Satellite imagery confirms active force disposition including armored vehicles, air defense emplacements, and command infrastructure. Target poses direct threat to US forward-deployed forces in the " +
        loc.theater.name +
        " theater.",
      "MILITARY TARGET: Vigil has designated a hostile military position in " +
        loc.city +
        " for strike assessment. SIGINT intercepts confirm this facility is coordinating operations against US and allied forces. Force protection demands rapid intelligence development and strike authorization.",
      "Hostile military forces identified operating from " +
        loc.city +
        ", " +
        loc.country +
        ". Vigil assesses this position as a staging area for offensive operations against US personnel and allied partners. ISR assets tasked for detailed target development.",
    ],
    STRATEGIC_TARGET: [
      "Vigil has designated a strategic facility near " +
        loc.city +
        ", " +
        loc.country +
        " for target development. Facility output directly supports hostile military operations against US forces in the " +
        loc.theater.name +
        " theater. Precision strike package required — collateral assessment pending.",
      "STRATEGIC TARGET: High-value hostile infrastructure identified in " +
        loc.city +
        ". Vigil imagery analysis confirms this facility is critical to adversary war-fighting capability. Neutralization would significantly degrade threat to US forces in-theater. Full intelligence picture required before strike authorization.",
    ],
  };

  var descPool = threatDescriptions[type.id] || threatDescriptions.TERROR_CELL;

  pushFeedItem({
    id: uid("FI"),
    type: "THREAT",
    severity: isUrgent ? "CRITICAL" : threatLevel >= 4 ? "HIGH" : "ELEVATED",
    header: (isUrgent ? "URGENT THREAT: " : "THREAT IDENTIFIED: ") + orgName,
    body:
      pick(descPool) +
      " Threat level: " +
      threatLevel +
      "/5. " +
      revealedCount +
      "/" +
      threat.intelFields.length +
      " intelligence fields available. Passive collection initiated.",
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
    read: false,
    threatId: threat.id,
    geo: { lat: loc.lat, lon: loc.lon },
  });

  // Urgent threats get an immediate pop-up alert
  if (isUrgent) {
    var urgentHoursLeft = Math.max(1, Math.round(expiresIn / 60));
    var urgentAlertMessages = [
      "FLASH INTELLIGENCE: " +
        threat.orgName +
        " (" +
        type.label +
        ") detected in " +
        loc.city +
        ", " +
        loc.country +
        ". Vigil assesses this threat will manifest within " +
        urgentHoursLeft +
        " hours. Immediate active collection and rapid response required. " +
        "The " +
        loc.theater.name +
        " theater must be treated as priority.",
      "URGENT — " +
        threat.orgName +
        " identified near " +
        loc.city +
        ", " +
        loc.country +
        ". Intelligence indicates imminent activity by this " +
        type.label.toLowerCase() +
        ". Estimated window: " +
        urgentHoursLeft +
        " hours. Deploy collection assets immediately " +
        "or this threat WILL manifest before Vigil can assemble a response.",
      "TIME-CRITICAL INTEL: Vigil has intercepted indicators of imminent " +
        type.label.toLowerCase() +
        " activity by " +
        threat.orgName +
        " in the " +
        loc.theater.name +
        " theater (" +
        loc.city +
        "). " +
        "Only " +
        urgentHoursLeft +
        "h remain before the operational window closes. " +
        "All available assets should be redirected to this threat.",
      "PRIORITY FLASH: " +
        threat.orgName +
        " — " +
        type.label +
        " — " +
        loc.city +
        ", " +
        loc.country +
        ". Vigil pattern analysis indicates this threat is " +
        "far more advanced than initial indicators suggested. Window to act: " +
        urgentHoursLeft +
        " hours. Failure to respond will result in manifestation " +
        "in the " +
        loc.theater.name +
        " theater.",
    ];

    queueUrgentAlert({
      id: uid("FI"),
      type: "URGENT_INTEL",
      severity: "CRITICAL",
      header: "URGENT INTEL: " + threat.orgName,
      body: pick(urgentAlertMessages),
      timestamp: {
        day: V.time.day,
        hour: V.time.hour,
        minute: Math.floor(V.time.minutes),
      },
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

(function () {
  // --- PASSIVE + ACTIVE INTEL COLLECTION (priority 6) ---
  // Every game-minute, each unrevealed field accumulates ticks.
  // Passive baseline: 1 tick per game-minute.
  // Active assets add their source-matched multiplier per field.

  hook(
    "tick",
    function (data) {
      var minutesElapsed = data.minutesElapsed || 1;

      for (var i = 0; i < V.threats.length; i++) {
        var threat = V.threats[i];
        if (threat.phase !== "INTEL" || threat.status !== "ACTIVE") continue;

        // Build per-source multiplier from deployed collection assets
        var sourceBonus = {};
        if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
          for (var c = 0; c < threat.collectorAssetIds.length; c++) {
            var asset = getAsset(threat.collectorAssetIds[c]);
            // Only count assets actually on station (COLLECTING), not in-transit
            if (!asset || asset.status !== "COLLECTING") continue;
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
            V.playStats.intelFieldsRevealed =
              (V.playStats.intelFieldsRevealed || 0) + 1;

            // Feed notification for revealed field
            var revealMessages = [
              "Intelligence field revealed on " +
                threat.orgName +
                ": " +
                field.label +
                " (" +
                field.source +
                " source).",
              threat.orgName +
                ": " +
                field.label +
                " now available. " +
                field.source +
                " collection successful.",
              "New intelligence on " +
                threat.orgName +
                " — " +
                field.label +
                " field confirmed via " +
                field.source +
                ".",
            ];
            addLog(pick(revealMessages), "log-intel");
          }
        }

        if (anyRevealed) {
          fire("threat:intel:revealed", { threat: threat });

          // Check for foreign target in newly revealed TARGET_INTENT fields
          for (var ft = 0; ft < threat.intelFields.length; ft++) {
            var iField = threat.intelFields[ft];
            if (
              iField.key === "TARGET_INTENT" &&
              iField.revealed &&
              !threat.foreignTarget
            ) {
              if (threat._targetInfo) {
                threat.foreignTarget = {
                  country: threat._targetInfo.country,
                  city: threat._targetInfo.city,
                  disclosed: false,
                  disclosureType: null,
                };
                fire("threat:foreign_target", { threat: threat });
                addLog(
                  "INTEL: " +
                    threat.orgName +
                    " target identified as " +
                    threat._targetInfo.city +
                    ", " +
                    threat._targetInfo.country +
                    " (non-US).",
                  "log-intel",
                );
              }
            }
          }

          // Extract tagged intel metadata when revealed
          for (var cs = 0; cs < threat.intelFields.length; cs++) {
            var csField = threat.intelFields[cs];
            if (
              csField.key === "CELL_STRUCTURE" &&
              csField.revealed &&
              csField._cellType &&
              !threat.cellType
            ) {
              threat.cellType = csField._cellType;
              addLog(
                "INTEL: " +
                  threat.orgName +
                  " cell structure assessed as " +
                  (threat.cellType === "MULTI"
                    ? "multi-site network"
                    : "single-site operation") +
                  ".",
                "log-intel",
              );
            }
            if (
              csField.key === "PROGRAM_TYPE" &&
              csField.revealed &&
              csField._programType &&
              !threat.programType
            ) {
              threat.programType = csField._programType;
              addLog(
                "INTEL: " +
                  threat.orgName +
                  " classified as " +
                  (threat.programType === "FACILITY"
                    ? "fixed-site production program"
                    : "proliferation network") +
                  ".",
                "log-intel",
              );
            }
            if (
              csField.key === "ASSET_CONDITION" &&
              csField.revealed &&
              csField._assetStatus &&
              !threat.assetStatus
            ) {
              threat.assetStatus = csField._assetStatus;
              addLog(
                "INTEL: Compromised asset assessed as " +
                  (threat.assetStatus === "DETAINED"
                    ? "IN CUSTODY — direct action required"
                    : "EVADING — extraction window open") +
                  ".",
                "log-intel",
              );
            }
            if (
              csField.key === "ACTIVITY_TYPE" &&
              csField.revealed &&
              csField._activityType &&
              !threat.activityType
            ) {
              threat.activityType = csField._activityType;
              var atLabels = {
                ESPIONAGE: "intelligence collection operation",
                PROXY: "proxy military operation",
                SABOTAGE: "covert sabotage operation",
              };
              addLog(
                "INTEL: " +
                  threat.orgName +
                  " classified as " +
                  (atLabels[threat.activityType] || threat.activityType) +
                  (threat.sponsorCountry
                    ? " directed by " + threat.sponsorCountry
                    : "") +
                  ".",
                "log-intel",
              );
            }
          }

          // Smart urgency: timing-related intel adjusts threat window
          adjustUrgencyFromIntel(threat);

          // Vigil assessment: is this threat "cooked" enough for direct action?
          assessThreatReadiness(threat);
        }
      }
    },
    6,
  ); // After asset transit (5)

  // --- THREAT EXPIRATION CHECK (priority 7) ---

  hook(
    "tick",
    function () {
      var now = V.time.totalMinutes;

      for (var i = 0; i < V.threats.length; i++) {
        var threat = V.threats[i];
        if (threat.phase !== "INTEL" || threat.status !== "ACTIVE") continue;
        if (!threat.expiresAt) continue;

        var remaining = threat.expiresAt - now;
        var totalDuration = threat.expiresAt - threat.spawnedAt;
        var pctRemaining = totalDuration > 0 ? remaining / totalDuration : 0;

        // Urgency alerts:
        // For URGENT threats (short windows), use percentage-based thresholds
        // For normal threats (weeks/months/years), use absolute time thresholds
        if (threat.urgent) {
          // Percentage-based for urgent threats (already short windows)
          if (
            !threat.urgencyAlertSent &&
            pctRemaining <= 0.4 &&
            remaining > 0
          ) {
            threat.urgencyAlertSent = true;
            fireUrgencyAlert(threat, "ELEVATED");
          }
          if (
            !threat.criticalAlertSent &&
            pctRemaining <= 0.15 &&
            remaining > 0
          ) {
            threat.criticalAlertSent = true;
            fireUrgencyAlert(threat, "CRITICAL");
          }
        } else {
          // Absolute time thresholds for normal threats
          if (!threat.urgencyAlertSent && remaining <= 2880 && remaining > 0) {
            // 2 days
            threat.urgencyAlertSent = true;
            fireUrgencyAlert(threat, "ELEVATED");
          }
          if (!threat.criticalAlertSent && remaining <= 720 && remaining > 0) {
            // 12 hours
            threat.criticalAlertSent = true;
            fireUrgencyAlert(threat, "CRITICAL");
          }
        }

        // Expiration — threat manifests
        if (remaining <= 0) {
          manifestThreat(threat);
        }
      }
    },
    7,
  ); // After intel collection (6)

  // --- AUTO-SPAWN THREATS (theater volatility) ---

  hook("tick:hour", function () {
    for (var tid in V.theaters) {
      var theater = V.theaters[tid];
      var defcon = theater.defcon || 5;
      var defconMod =
        typeof DEFCON_SPAWN_MOD !== "undefined"
          ? DEFCON_SPAWN_MOD[defcon] || 1.0
          : 1.0;
      var conflictMod =
        typeof getConflictSpawnMultiplier === "function"
          ? getConflictSpawnMultiplier(tid)
          : 1.0;
      var prob = theater.volatility * 0.05 * defconMod * conflictMod;
      if (Math.random() < prob) {
        // At DEFCON 1 with AT_WAR countries, spawn military targets
        if (defcon <= 1) {
          var hasAtWar = false;
          var theaterDef = THEATERS[tid];
          if (theaterDef) {
            for (var ci = 0; ci < theaterDef.countries.length; ci++) {
              var cd = V.diplomacy[theaterDef.countries[ci]];
              if (cd && cd.atWar) {
                hasAtWar = true;
                break;
              }
            }
          }
          if (hasAtWar && Math.random() < 0.4) {
            spawnThreat(
              tid,
              Math.random() < 0.6 ? "MILITARY_TARGET" : "STRATEGIC_TARGET",
            );
            continue;
          }
        }
        spawnThreat(tid);
      }
    }
  });

  // --- INITIAL THREATS ON GAME START ---

  hook(
    "game:start",
    function () {
      if (V.initialized) return;
      var count = randInt(2, 3);
      for (var i = 0; i < count; i++) {
        spawnThreat();
      }
    },
    4,
  ); // After bases (1), assets (2), state init

  // --- AUTO-ASSESS UNREACHABLE INTEL THREATS ---

  hook(
    "tick:hour",
    function () {
      var threats = getIntelThreats();
      for (var i = 0; i < threats.length; i++) {
        var threat = threats[i];
        var timeInfo = getThreatTimeRemaining(threat);

        // Skip if collectors are already deployed
        if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0)
          continue;

        // Skip if already processed
        if (threat._autoAssessChecked) continue;

        // Check if any collection asset can reach in time
        var canReach = false;
        var collectionAssets =
          typeof getCollectionAssets === "function"
            ? getCollectionAssets()
            : [];
        for (var a = 0; a < collectionAssets.length; a++) {
          var transit = calcTransitMinutes(
            collectionAssets[a],
            threat.location.lat,
            threat.location.lon,
          );
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
            addLog(
              "VIGIL: Auto-assessing " +
                threat.orgName +
                " — no assets can reach in time but intel sufficient (" +
                progress.pct +
                "%).",
              "log-vigil",
            );
            vigilMoveThreatToOps(threat);
          } else {
            // Insufficient intel — alert
            pushFeedItem({
              id: uid("FI"),
              type: "VIGIL_ALERT",
              severity: "ELEVATED",
              header: "UNREACHABLE: " + threat.orgName,
              body:
                "Vigil analysis: no collection assets can reach " +
                threat.orgName +
                " in " +
                threat.location.city +
                " before expiration. Intel at " +
                progress.pct +
                "% — insufficient for direct action. " +
                "Vigil recommends archiving this threat unless assets become available.",
              timestamp: {
                day: V.time.day,
                hour: V.time.hour,
                minute: Math.floor(V.time.minutes),
              },
              read: false,
              threatId: threat.id,
            });
          }
        }
      }
    },
    8,
  );
})();

// ===================================================================
//  VIGIL ASSESSMENT — Is the threat "cooked"?
// ===================================================================

function assessThreatReadiness(threat) {
  if (threat.phase !== "INTEL") return;

  var total = threat.intelFields.length;
  var revealed = 0;
  var hardRevealed = 0;
  var hardTotal = 0;

  for (var i = 0; i < total; i++) {
    var f = threat.intelFields[i];
    if (f.revealed) revealed++;
    if (f.difficulty === "HARD" || f.difficulty === "VERY_HARD") {
      hardTotal++;
      if (f.revealed) hardRevealed++;
    }
  }

  var revealPct = total > 0 ? revealed / total : 0;

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
      "Vigil has gathered sufficient intelligence on " +
        threat.orgName +
        " (" +
        threat.typeLabel +
        ") in " +
        threat.location.city +
        ", " +
        threat.location.country +
        " to support direct action. " +
        progress.revealed +
        "/" +
        progress.total +
        " fields collected (" +
        progress.pct +
        "%). " +
        (unrevealed > 0
          ? unrevealed +
            " field" +
            (unrevealed > 1 ? "s remain" : " remains") +
            " unrevealed — continued collection may improve operational outcomes."
          : "All intelligence fields resolved."),
      "Intelligence analysis on " +
        threat.orgName +
        " in the " +
        (threat.location.theater ? threat.location.theater.name : "?") +
        " theater has reached actionable threshold. " +
        "Current coverage: " +
        progress.pct +
        "% (" +
        progress.revealed +
        " of " +
        progress.total +
        " fields). " +
        "Vigil can initiate direct action planning, or the operator may elect to continue intelligence collection for a more complete picture.",
      threat.orgName +
        " (" +
        threat.typeLabel +
        ") presents a credible threat requiring response. " +
        "Vigil has assembled a " +
        progress.pct +
        "% intelligence package from " +
        threat.location.city +
        ". " +
        (unrevealed > 0
          ? "However, " +
            unrevealed +
            " intelligence gap" +
            (unrevealed > 1 ? "s remain" : " remains") +
            " that could affect operational planning. "
          : "") +
        "Recommend operator review before transition to Operations.",
    ];

    var feedItem = {
      id: uid("FI"),
      type: "VIGIL_ASSESSMENT",
      severity: threat.threatLevel >= 4 ? "HIGH" : "ELEVATED",
      header: "VIGIL ASSESSMENT: " + threat.orgName + " — READY FOR ACTION",
      body: pick(assessBodyMessages),
      timestamp: {
        day: V.time.day,
        hour: V.time.hour,
        minute: Math.floor(V.time.minutes),
      },
      read: false,
      threatId: threat.id,
      geo: { lat: threat.location.lat, lon: threat.location.lon },
      actions: [
        {
          label: "MOVE TO OPERATIONS",
          onclick: "approveMoveThreatToOps('" + threat.id + "')",
          primary: true,
        },
        {
          label: "CONTINUE COLLECTION",
          onclick: "declineMoveThreatToOps('" + threat.id + "')",
          primary: false,
        },
      ],
    };

    pushFeedItem(feedItem);

    addLog(
      "VIGIL: " +
        threat.orgName +
        " assessed as actionable (" +
        progress.pct +
        "% intel). Awaiting operator decision.",
      "log-vigil",
    );
    fire("threat:vigil:recommends_ops", { threat: threat });
  }
}

// --- Operator Response to Vigil Assessment ---

function approveMoveThreatToOps(threatId) {
  var threat = getThreat(threatId);
  if (!threat || threat.phase !== "INTEL") {
    dismissUrgentAlert();
    return;
  }

  // TERROR_CELL: require CELL_STRUCTURE intel before allowing move to ops
  if (threat.type === "TERROR_CELL" && !threat.cellType) {
    var cellField = null;
    for (var cf = 0; cf < threat.intelFields.length; cf++) {
      if (threat.intelFields[cf].key === "CELL_STRUCTURE") {
        cellField = threat.intelFields[cf];
        break;
      }
    }
    if (cellField && !cellField.revealed) {
      dismissUrgentAlert();
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "Cell structure intelligence has not been collected. Vigil requires this field to determine " +
          "whether a single-site raid or coordinated multi-site operation is appropriate.<br><br>" +
          "Continue intelligence collection to reveal <strong>CELL STRUCTURE</strong> before approving direct action.</div>",
        { pause: false },
      );
      return;
    }
  }

  // PROLIFERATOR: require PROGRAM_TYPE intel before allowing move to ops
  if (threat.type === "PROLIFERATOR" && !threat.programType) {
    var progField = null;
    for (var pf = 0; pf < threat.intelFields.length; pf++) {
      if (threat.intelFields[pf].key === "PROGRAM_TYPE") {
        progField = threat.intelFields[pf];
        break;
      }
    }
    if (progField && !progField.revealed) {
      dismissUrgentAlert();
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "Program classification has not been determined. Vigil requires this field to assess " +
          "whether this is a fixed-site facility or a proliferation network — the response differs significantly.<br><br>" +
          "Continue intelligence collection to reveal <strong>PROGRAM CLASSIFICATION</strong> before approving direct action.</div>",
        { pause: false },
      );
      return;
    }
  }

  // ASSET_COMPROMISED: require ASSET_CONDITION intel before allowing move to ops
  if (threat.type === "ASSET_COMPROMISED" && !threat.assetStatus) {
    var condField = null;
    for (var af = 0; af < threat.intelFields.length; af++) {
      if (threat.intelFields[af].key === "ASSET_CONDITION") {
        condField = threat.intelFields[af];
        break;
      }
    }
    if (condField && !condField.revealed) {
      dismissUrgentAlert();
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "Asset condition is unknown. Vigil requires this field to determine " +
          "whether a covert extraction or a direct action rescue is appropriate.<br><br>" +
          "Continue intelligence collection to reveal <strong>ASSET CONDITION &amp; STATUS</strong> before approving response.</div>",
        { pause: false },
      );
      return;
    }
  }

  // ILLEGAL_AGENT: require AGENT_TIER and COVER_IDENTITY before allowing move to ops
  if (
    threat.type === "ILLEGAL_AGENT_DOMESTIC" ||
    threat.type === "ILLEGAL_AGENT_FOREIGN"
  ) {
    var tierRevealed = false,
      coverRevealed = false;
    for (var ilf = 0; ilf < threat.intelFields.length; ilf++) {
      if (
        threat.intelFields[ilf].key === "AGENT_TIER" &&
        threat.intelFields[ilf].revealed
      )
        tierRevealed = true;
      if (
        threat.intelFields[ilf].key === "COVER_IDENTITY" &&
        threat.intelFields[ilf].revealed
      )
        coverRevealed = true;
    }
    if (!tierRevealed || !coverRevealed) {
      dismissUrgentAlert();
      var missing = [];
      if (!tierRevealed) missing.push("<strong>AGENT CLASSIFICATION</strong>");
      if (!coverRevealed) missing.push("<strong>COVER IDENTITY</strong>");
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "The following critical intelligence has not been collected: " +
          missing.join(" and ") +
          ".<br><br>" +
          "Vigil requires agent classification to determine appropriate response options and cover identity " +
          "to enable targeting. Continue intelligence collection before approving direct action.</div>",
        { pause: false },
      );
      return;
    }
  }

  // STATE_ACTOR: require ACTIVITY_TYPE intel before allowing move to ops
  if (threat.type === "STATE_ACTOR" && !threat.activityType) {
    var actField = null;
    for (var sf = 0; sf < threat.intelFields.length; sf++) {
      if (threat.intelFields[sf].key === "ACTIVITY_TYPE") {
        actField = threat.intelFields[sf];
        break;
      }
    }
    if (actField && !actField.revealed) {
      dismissUrgentAlert();
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "Activity classification has not been determined. Vigil requires this field to assess " +
          "whether this is espionage, proxy military action, or sabotage — the response differs significantly.<br><br>" +
          "Continue intelligence collection to reveal <strong>ACTIVITY CLASSIFICATION</strong> before approving direct action.</div>",
        { pause: false },
      );
      return;
    }
  }

  // HVT_TARGET: require GUARD_FORCE intel before allowing move to ops
  if (threat.type === "HVT_TARGET") {
    var guardField = null;
    for (var gfi = 0; gfi < threat.intelFields.length; gfi++) {
      if (threat.intelFields[gfi].key === "GUARD_FORCE") {
        guardField = threat.intelFields[gfi];
        break;
      }
    }
    if (guardField && !guardField.revealed) {
      dismissUrgentAlert();
      showModal(
        "INTEL REQUIRED",
        '<div class="response-select-instruction" style="margin-bottom:0;">' +
          "Cannot transition <strong>" +
          threat.orgName +
          "</strong> to Operations.<br><br>" +
          "Guard force assessment has not been completed. Vigil requires this field to determine " +
          "whether a covert snatch operation is viable or if a kinetic strike is the only option.<br><br>" +
          "Continue intelligence collection to reveal <strong>GUARD FORCE &amp; SECURITY DETAIL</strong> before approving direct action.</div>",
        { pause: false },
      );
      return;
    }
  }

  dismissUrgentAlert();
  showResponseSelectionModal(threat);
}

// --- Response Selection Modal ---

// Branch groups: ops that share a parent category in the selection menu
var RESPONSE_BRANCHES = [
  {
    id: "SURVEILLANCE",
    label: "Surveillance",
    shortLabel: "SURV",
    description:
      "Deploy assets to monitor and collect intelligence. Non-kinetic — no direct engagement.",
    children: ["SURVEILLANCE", "INTEL_COLLECTION"],
  },
  {
    id: "STRIKE",
    label: "Strike",
    shortLabel: "STRIKE",
    description:
      "Destroy the target from a distance using stand-off weapons. No boots on the ground.",
    children: ["MILITARY_STRIKE", "DRONE_STRIKE"],
  },
  {
    id: "ELIMINATE",
    label: "Eliminate",
    shortLabel: "ELIM",
    description:
      "Neutralize a high-value target. Choose between a close-quarters assault or a covert stand-off method.",
    children: ["HVT_ELIMINATION", "TARGETED_KILLING"],
  },
  {
    id: "TAKEDOWN",
    label: "Takedown",
    shortLabel: "ASSAULT",
    description:
      "Direct assault on target location(s). Ground forces breach, clear, and secure the objective.",
    children: ["SOF_RAID", "COUNTER_TERROR"],
    minChildren: 1,
  },
];

// Cache: which threatId we're currently selecting for
var _responseSelectThreatId = null;
var _responseSelectOpTypes = null;

function getEligibleOpTypes(threat) {
  var opTypes;
  if (threat.domestic && typeof DOMESTIC_THREAT_TO_OP_TYPE !== "undefined") {
    opTypes = DOMESTIC_THREAT_TO_OP_TYPE[threat.type] ||
      THREAT_TO_OP_TYPE[threat.type] || ["INVESTIGATION"];
  } else {
    opTypes = THREAT_TO_OP_TYPE[threat.type] || ["SURVEILLANCE"];
  }

  // Maritime threats: NAVAL_INTERDICTION only; non-maritime: strip it out
  if (threat.maritime) {
    if (opTypes.indexOf("NAVAL_INTERDICTION") >= 0)
      opTypes = ["NAVAL_INTERDICTION"];
  } else {
    opTypes = opTypes.filter(function (t) {
      return t !== "NAVAL_INTERDICTION";
    });
  }

  // PROLIFERATOR: filter ops by program type
  if (threat.type === "PROLIFERATOR" && threat.programType) {
    if (threat.programType === "FACILITY") {
      // Facility: strike it or raid it — no surveillance as an end-goal op
      opTypes = opTypes.filter(function (t) {
        return (
          t === "MILITARY_STRIKE" || t === "DRONE_STRIKE" || t === "SOF_RAID"
        );
      });
    } else if (threat.programType === "NETWORK") {
      // Network: surveil it, infiltrate it, or raid the transfer point
      opTypes = opTypes.filter(function (t) {
        return (
          t === "SURVEILLANCE" || t === "INTEL_COLLECTION" || t === "SOF_RAID"
        );
      });
    }
  }

  // ASSET_COMPROMISED: filter ops by asset status
  if (threat.type === "ASSET_COMPROMISED" && threat.assetStatus) {
    if (threat.assetStatus === "FREE") {
      opTypes = ["ASSET_EXTRACTION"];
    } else if (threat.assetStatus === "DETAINED") {
      opTypes = ["SOF_RAID"];
    }
  }

  // STATE_ACTOR: filter ops by activity type
  if (threat.type === "STATE_ACTOR" && threat.activityType) {
    if (threat.activityType === "ESPIONAGE") {
      opTypes = opTypes.filter(function (t) {
        return (
          t === "SURVEILLANCE" ||
          t === "INTEL_COLLECTION" ||
          t === "CYBER_OP" ||
          t === "DIPLOMATIC_RESPONSE"
        );
      });
    } else if (threat.activityType === "PROXY") {
      opTypes = opTypes.filter(function (t) {
        return (
          t === "MILITARY_STRIKE" ||
          t === "DRONE_STRIKE" ||
          t === "SURVEILLANCE" ||
          t === "INTEL_COLLECTION" ||
          t === "DIPLOMATIC_RESPONSE"
        );
      });
    } else if (threat.activityType === "SABOTAGE") {
      opTypes = opTypes.filter(function (t) {
        return (
          t === "SOF_RAID" ||
          t === "SURVEILLANCE" ||
          t === "INTEL_COLLECTION" ||
          t === "CYBER_OP"
        );
      });
    }
  }

  // AT_WAR: strip DIPLOMATIC_RESPONSE
  if (
    threat.location &&
    threat.location.country &&
    typeof getCountryStance === "function"
  ) {
    var countryStance = getCountryStance(threat.location.country);
    if (countryStance && countryStance.level === 0) {
      opTypes = opTypes.filter(function (t) {
        return t !== "DIPLOMATIC_RESPONSE";
      });
      if (opTypes.length === 0) opTypes = ["MILITARY_STRIKE"];
    }
  }
  return opTypes;
}

function renderResponseCard(otId, threatId, isDomestic) {
  var ot = OPERATION_TYPES[otId];
  if (!ot) return "";
  var successCls =
    ot.baseSuccessRate >= 75
      ? "high"
      : ot.baseSuccessRate >= 60
        ? "med"
        : "low";
  var execLabel = ot.execHoursRange[0] + "-" + ot.execHoursRange[1] + "h";

  // Gate COVERT_SNATCH: disabled when GUARD_FORCE is revealed as HEAVY
  var gatedOut = false;
  var gatedReason = "";
  if (otId === "COVERT_SNATCH") {
    var threat = getThreat(threatId);
    if (threat && threat.intelFields) {
      for (var gf = 0; gf < threat.intelFields.length; gf++) {
        var f = threat.intelFields[gf];
        if (
          f.key === "GUARD_FORCE" &&
          f.revealed &&
          f._guardLevel === "HEAVY"
        ) {
          gatedOut = true;
          gatedReason =
            "Security detail too heavy for covert snatch — target is in a fortified compound with rotating guards.";
          break;
        }
      }
    }
  }

  var html =
    '<div class="response-card' +
    (gatedOut ? " response-card-disabled" : "") +
    '"' +
    (gatedOut
      ? ""
      : " onclick=\"confirmResponseType('" + threatId + "','" + otId + "')\"") +
    ">" +
    '<div class="response-card-header">' +
    '<span class="response-card-name">' +
    ot.label +
    "</span>" +
    '<span class="response-card-short">' +
    ot.shortLabel +
    "</span>" +
    "</div>" +
    '<div class="response-card-desc">' +
    (ot.description || "") +
    "</div>" +
    '<div class="response-card-stats">' +
    '<span class="response-stat"><span class="response-stat-label">SUCCESS</span><span class="response-stat-value ' +
    successCls +
    '">' +
    ot.baseSuccessRate +
    "%</span></span>" +
    '<span class="response-stat"><span class="response-stat-label">EXEC TIME</span><span class="response-stat-value">' +
    execLabel +
    "</span></span>" +
    '<span class="response-stat"><span class="response-stat-label">REQUIRES</span><span class="response-stat-value">' +
    ot.requiredCapabilities.join(", ") +
    "</span></span>" +
    "</div>";

  if (ot.pros && ot.pros.length > 0) {
    html += '<div class="response-card-pros">';
    for (var p = 0; p < ot.pros.length; p++)
      html += '<div class="response-pro">+ ' + ot.pros[p] + "</div>";
    html += "</div>";
  }
  if (ot.cons && ot.cons.length > 0) {
    html += '<div class="response-card-cons">';
    for (var c = 0; c < ot.cons.length; c++)
      html += '<div class="response-con">- ' + ot.cons[c] + "</div>";
    html += "</div>";
  }
  if (ot.illegalDomestic && isDomestic) {
    html += '<div class="response-card-warning">ILLEGAL ON US SOIL</div>';
  }
  if (gatedOut) {
    html +=
      '<div class="response-card-warning" style="color:var(--text-dim)">' +
      gatedReason +
      "</div>";
  }
  html += "</div>";
  return html;
}

function showResponseSelectionModal(threat) {
  _responseSelectThreatId = threat.id;
  _responseSelectOpTypes = getEligibleOpTypes(threat);

  // Open the modal first, then populate
  showModal("SELECT RESPONSE TYPE", "", { pause: true });
  var box = document.querySelector(".modal-box");
  if (box) box.classList.add("modal-wide");

  renderResponseMainMenu(threat);
}

function renderResponseMainMenu(threat) {
  var opTypes = _responseSelectOpTypes;
  var consumed = {}; // Track op types consumed by branches

  var html =
    '<div class="response-select-context">' +
    '<span class="response-select-tag">' +
    threat.typeLabel +
    "</span>" +
    '<span class="response-select-loc">' +
    threat.location.city +
    ", " +
    threat.location.country +
    "</span>" +
    '<span class="response-select-org">' +
    threat.orgName +
    "</span>" +
    "</div>" +
    '<div class="response-select-instruction">Select an operational response. Vigil will generate deployment options based on your choice.</div>' +
    '<div class="response-select-grid">';

  // Determine which branches apply
  // Standard branches need 2+ children; branches with minChildren:1 activate with 1+
  // ASSET_COMPROMISED: skip branching — show ops as standalone cards (rescue context)
  var activeBranches = [];
  if (threat.type !== "ASSET_COMPROMISED") {
    for (var b = 0; b < RESPONSE_BRANCHES.length; b++) {
      var branch = RESPONSE_BRANCHES[b];
      var presentChildren = [];
      for (var ch = 0; ch < branch.children.length; ch++) {
        if (opTypes.indexOf(branch.children[ch]) >= 0)
          presentChildren.push(branch.children[ch]);
      }
      var minReq = branch.minChildren || 2;
      if (presentChildren.length >= minReq) {
        activeBranches.push({ branch: branch, children: presentChildren });
        for (var pc = 0; pc < presentChildren.length; pc++)
          consumed[presentChildren[pc]] = true;
      }
    }
  }

  // Render branch cards first
  for (var ab = 0; ab < activeBranches.length; ab++) {
    var br = activeBranches[ab].branch;
    var brChildren = activeBranches[ab].children;

    // TAKEDOWN branch with 2+ children (TERROR_CELL): requires cellType intel
    if (br.id === "TAKEDOWN" && brChildren.length >= 2 && !threat.cellType) {
      html +=
        '<div class="response-card response-branch" style="opacity:0.4;cursor:not-allowed;pointer-events:none;">' +
        '<div class="response-card-header">' +
        '<span class="response-card-name">' +
        br.label +
        "</span>" +
        '<span class="response-card-short">LOCKED</span>' +
        "</div>" +
        '<div class="response-card-desc">' +
        br.description +
        "</div>" +
        '<div class="response-card-warning">REQUIRES CELL STRUCTURE INTEL</div>' +
        "</div>";
      continue;
    }

    // TAKEDOWN with resolved cellType: show which op will be selected
    if (br.id === "TAKEDOWN" && brChildren.length >= 2 && threat.cellType) {
      var resolvedOpId =
        threat.cellType === "MULTI" ? "COUNTER_TERROR" : "SOF_RAID";
      var resolvedOt = OPERATION_TYPES[resolvedOpId];
      var resolvedLabel = resolvedOt ? resolvedOt.label : resolvedOpId;
      html +=
        '<div class="response-card response-branch" onclick="showResponseBranch(\'' +
        br.id +
        "')\">" +
        '<div class="response-card-header">' +
        '<span class="response-card-name">' +
        br.label +
        "</span>" +
        '<span class="response-card-short">' +
        br.shortLabel +
        " &#9654;</span>" +
        "</div>" +
        '<div class="response-card-desc">' +
        br.description +
        "</div>" +
        '<div class="response-branch-children">' +
        '<span class="response-branch-child">' +
        resolvedLabel +
        "</span>" +
        '<span class="response-branch-child">' +
        (threat.cellType === "MULTI" ? "MULTI-SITE" : "SINGLE-SITE") +
        "</span>" +
        "</div></div>";
      continue;
    }

    // Standard branch card (including single-child TAKEDOWN)
    html +=
      '<div class="response-card response-branch" onclick="showResponseBranch(\'' +
      br.id +
      "')\">" +
      '<div class="response-card-header">' +
      '<span class="response-card-name">' +
      br.label +
      "</span>" +
      '<span class="response-card-short">' +
      br.shortLabel +
      " &#9654;</span>" +
      "</div>" +
      '<div class="response-card-desc">' +
      br.description +
      "</div>" +
      '<div class="response-branch-children">';
    for (var bc = 0; bc < brChildren.length; bc++) {
      var childOt = OPERATION_TYPES[brChildren[bc]];
      if (childOt)
        html +=
          '<span class="response-branch-child">' + childOt.label + "</span>";
    }
    html += "</div></div>";
  }

  // Render standalone cards (not consumed by branches)
  for (var i = 0; i < opTypes.length; i++) {
    if (consumed[opTypes[i]]) continue;
    html += renderResponseCard(opTypes[i], threat.id, threat.domestic);
  }

  html += "</div>";

  // Update body content (modal already open)
  $("modal-body").innerHTML = html;
}

function showResponseBranch(branchId) {
  var threat = getThreat(_responseSelectThreatId);
  if (!threat) return;

  var branch = null;
  for (var b = 0; b < RESPONSE_BRANCHES.length; b++) {
    if (RESPONSE_BRANCHES[b].id === branchId) {
      branch = RESPONSE_BRANCHES[b];
      break;
    }
  }
  if (!branch) return;

  // TAKEDOWN branch: auto-resolve based on available children
  if (branchId === "TAKEDOWN") {
    var tkChildren = [];
    for (var tc = 0; tc < branch.children.length; tc++) {
      if (_responseSelectOpTypes.indexOf(branch.children[tc]) >= 0)
        tkChildren.push(branch.children[tc]);
    }
    // Single child (e.g. CRIMINAL_ORG has only SOF_RAID) — confirm directly
    if (tkChildren.length === 1) {
      confirmResponseType(threat.id, tkChildren[0]);
      return;
    }
    // Multiple children (TERROR_CELL) — resolve via cellType intel
    if (tkChildren.length >= 2 && threat.cellType) {
      var resolvedOp =
        threat.cellType === "MULTI" ? "COUNTER_TERROR" : "SOF_RAID";
      confirmResponseType(threat.id, resolvedOp);
      return;
    }
  }

  var opTypes = _responseSelectOpTypes;
  var children = [];
  for (var ch = 0; ch < branch.children.length; ch++) {
    if (opTypes.indexOf(branch.children[ch]) >= 0)
      children.push(branch.children[ch]);
  }

  var html =
    '<div class="response-select-context">' +
    '<span class="response-select-tag">' +
    threat.typeLabel +
    "</span>" +
    '<span class="response-select-loc">' +
    threat.location.city +
    ", " +
    threat.location.country +
    "</span>" +
    '<span class="response-select-org">' +
    threat.orgName +
    "</span>" +
    "</div>" +
    '<div class="response-branch-back" onclick="renderResponseMainMenu(getThreat(\'' +
    _responseSelectThreatId +
    "'))\">" +
    "&#9664; BACK TO ALL OPTIONS" +
    "</div>" +
    '<div class="response-branch-title">' +
    branch.label.toUpperCase() +
    "</div>" +
    '<div class="response-select-instruction">' +
    branch.description +
    "</div>" +
    '<div class="response-select-grid">';

  for (var i = 0; i < children.length; i++) {
    html += renderResponseCard(children[i], threat.id, threat.domestic);
  }

  html += "</div>";

  $("modal-body").innerHTML = html;
}

function confirmResponseType(threatId, opTypeId) {
  var threat = getThreat(threatId);
  if (!threat || threat.phase !== "INTEL") {
    hideModal();
    return;
  }

  // Remove wide class before hiding
  var box = document.querySelector(".modal-box");
  if (box) box.classList.remove("modal-wide");
  hideModal();

  threat.vigilRecommendsOps = false;
  threat._chosenOpType = opTypeId;
  vigilMoveThreatToOps(threat);

  addLog(
    "OPERATOR: Approved " +
      (OPERATION_TYPES[opTypeId] ? OPERATION_TYPES[opTypeId].label : opTypeId) +
      " response against " +
      threat.orgName +
      ".",
    "log-info",
  );

  if (
    V.ui.activeWorkspace === "feed" &&
    typeof renderWorkspace === "function"
  ) {
    renderWorkspace("feed");
  }
}

function declineMoveThreatToOps(threatId) {
  var threat = getThreat(threatId);
  if (!threat) {
    dismissUrgentAlert();
    return;
  }

  threat.vigilRecommendsOps = false;
  threat._declinedOpsAt = V.time.totalMinutes;
  dismissUrgentAlert();

  addLog(
    "OPERATOR: Continuing intel collection on " +
      threat.orgName +
      ". Vigil assessment deferred.",
    "log-info",
  );

  // Re-render feed if viewing this threat
  if (V.ui.activeWorkspace === "feed") {
    renderWorkspace("feed");
  }
}

// ===================================================================
//  MOVE THREAT: INTEL → OPS (no duplicates — the entity moves)
// ===================================================================

function vigilMoveThreatToOps(threat) {
  if (threat.phase !== "INTEL") return;

  threat.phase = "OPS";

  // Recall all collection assets
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  // Create operation — the threat's intel fields travel WITH the operation
  spawnOperationFromThreat(threat);

  addLog(
    "VIGIL: " +
      threat.orgName +
      " transferred to Operations. Direct action planning initiated.",
    "log-vigil",
  );

  // Feed item — transition confirmation (operator already saw the assessment pop-up)
  var progress = getThreatIntelProgress(threat);
  var transferMessages = [
    threat.orgName +
      " (" +
      threat.typeLabel +
      ") has been transferred to the Operations board. " +
      "Intelligence package: " +
      progress.revealed +
      "/" +
      progress.total +
      " fields (" +
      progress.pct +
      "%). " +
      "Vigil is analyzing deployment options for " +
      threat.location.city +
      ", " +
      threat.location.country +
      ".",
    "Operator-approved transition of " +
      threat.orgName +
      " to Operations. " +
      "All gathered intelligence has been forwarded for direct action planning in the " +
      (threat.location.theater ? threat.location.theater.name : "?") +
      " theater.",
    "Operation initiated against " +
      threat.orgName +
      " based on " +
      progress.pct +
      "% intelligence coverage. " +
      "Threat profile and collected fields transferred to Operations for response coordination.",
  ];

  pushFeedItem({
    id: uid("FI"),
    type: "OPERATION",
    severity: threat.threatLevel >= 4 ? "HIGH" : "ELEVATED",
    header: threat.orgName + " → OPERATIONS",
    body: pick(transferMessages),
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
    read: false,
    threatId: threat.id,
    opId: threat.linkedOpId,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
  });

  fire("threat:moved:ops", { threat: threat });
}

// ===================================================================
//  THREAT MANIFESTATION — Bad outcome, intel window expired
// ===================================================================

function manifestThreat(threat) {
  threat.phase = "MANIFESTED";
  threat.status = "MANIFESTED";

  // Recall any collection assets
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  // Viability hit scaled by threat level
  var viabilityHit = threat.threatLevel * randInt(2, 4);
  V.resources.viability = clamp(V.resources.viability - viabilityHit, 0, 100);

  // Theater risk increase
  if (
    threat.location &&
    threat.location.theaterId &&
    V.theaters[threat.location.theaterId]
  ) {
    V.theaters[threat.location.theaterId].risk = clamp(
      V.theaters[threat.location.theaterId].risk + 0.5,
      1,
      5,
    );
  }

  V.playStats.threatsManifested = (V.playStats.threatsManifested || 0) + 1;

  addLog(
    "THREAT MANIFESTED: " +
      threat.orgName +
      " — viability -" +
      viabilityHit +
      "%.",
    "log-fail",
  );

  // Rich, varied urgent alert messages
  var manifestMessages = [
    threat.orgName +
      " has executed their operation in " +
      threat.location.city +
      ", " +
      threat.location.country +
      ". " +
      "Intelligence window expired before Vigil could assemble a response. " +
      "Viability impact: -" +
      viabilityHit +
      "%.",
    "FAILURE TO ACT: The operational window on " +
      threat.orgName +
      " has closed. " +
      "The threat has manifested in " +
      threat.location.city +
      ". " +
      "Vigil was unable to gather sufficient intelligence in time for preemptive action. " +
      "This incident will be noted in the monthly viability assessment.",
    threat.orgName +
      " (" +
      threat.typeLabel +
      ") carried out their plan in " +
      threat.location.city +
      ". " +
      "Passive intelligence collection was insufficient and active collection assets were not deployed in time. " +
      "The " +
      threat.location.theater.name +
      " theater risk level has increased.",
    "CRITICAL FAILURE: " +
      threat.orgName +
      " has manifested as a concrete threat in the " +
      threat.location.theater.name +
      " theater. Intelligence collection failed to keep pace with threat timeline. " +
      "Viability impact: -" +
      viabilityHit +
      "%. " +
      "Vigil recommends reviewing collection asset deployment protocols.",
    "The intelligence window on " +
      threat.orgName +
      " expired at " +
      formatTimestamp({
        day: V.time.day,
        hour: V.time.hour,
        minute: Math.floor(V.time.minutes),
      }) +
      ". " +
      "Without adequate intelligence, no direct action was possible. " +
      threat.location.city +
      ", " +
      threat.location.country +
      " is now an active incident zone. " +
      "Operator performance logged.",
  ];

  queueUrgentAlert({
    id: uid("FI"),
    type: "THREAT_MANIFEST",
    severity: "CRITICAL",
    header: "THREAT MANIFESTED: " + threat.orgName,
    body: pick(manifestMessages),
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
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
      if (f.difficulty === "HARD" || f.difficulty === "VERY_HARD") {
        hardUnrevealed++;
      }
    }
  }

  var remaining = Math.max(0, threat.expiresAt - V.time.totalMinutes);
  var hoursLeft = Math.max(1, Math.round(remaining / 60));
  var hasCollectors =
    threat.collectorAssetIds && threat.collectorAssetIds.length > 0;

  var elevatedMessages = [
    "Intelligence window on " +
      threat.orgName +
      " is narrowing — approximately " +
      hoursLeft +
      " hours remain. " +
      unrevealed +
      " of " +
      totalFields +
      " fields still unrevealed. " +
      (hasCollectors
        ? "Active collection assets are on station but may not be sufficient."
        : "Vigil recommends deploying active collection assets immediately."),
    threat.orgName +
      " in " +
      threat.location.city +
      " — collection window shrinking. " +
      "Passive collection alone may not resolve " +
      hardUnrevealed +
      " critical intelligence fields in time. " +
      (hasCollectors
        ? "Consider deploying additional assets to supplement current collection."
        : "Deploy ISR or HUMINT assets to accelerate discovery."),
    "Time-sensitive: " +
      threat.orgName +
      " threat expiration in approximately " +
      hoursLeft +
      "h. " +
      revealed +
      "/" +
      totalFields +
      " fields collected. Without " +
      (hasCollectors ? "additional" : "active") +
      " collection, Vigil cannot guarantee sufficient intel for direct action.",
    "Vigil analysis: current collection rate on " +
      threat.orgName +
      " is insufficient to meet threat timeline. " +
      "Estimated " +
      hoursLeft +
      "h before manifestation. " +
      unrevealed +
      " intelligence gaps require resolution. Recommend active asset deployment.",
  ];

  var criticalMessages = [
    "URGENT: " +
      threat.orgName +
      " will manifest imminently (approximately " +
      hoursLeft +
      "h). " +
      unrevealed +
      " intelligence fields unresolved. " +
      (hasCollectors
        ? "Current collection assets insufficient. Deploy additional resources NOW."
        : "Deploy active collection assets NOW or accept blind engagement."),
    "CRITICAL WINDOW: " +
      threat.orgName +
      " (" +
      threat.location.city +
      "). " +
      "Intelligence collection failing to keep pace with threat timeline. " +
      hardUnrevealed +
      " critical fields unrevealed. Immediate action essential or threat will manifest.",
    "Vigil urgency alert: " +
      threat.orgName +
      " approaching manifestation threshold. " +
      hoursLeft +
      "h remaining. Without immediate " +
      (hasCollectors ? "reinforcement of" : "deployment of") +
      " active collection assets, " +
      "this threat will manifest with inadequate intelligence for response. Viability impact projected: -" +
      threat.threatLevel * 3 +
      "% or worse.",
    "FINAL WARNING — " +
      threat.orgName +
      ": " +
      hoursLeft +
      "h to manifestation. " +
      revealed +
      "/" +
      totalFields +
      " intel fields resolved. Vigil is unable to recommend direct action " +
      "without additional intelligence. The operator must act or accept consequences.",
  ];

  var messages = severity === "CRITICAL" ? criticalMessages : elevatedMessages;

  var feedItem = {
    id: uid("FI"),
    type: "VIGIL_ALERT",
    severity: severity,
    header:
      (severity === "CRITICAL" ? "CRITICAL: " : "ATTENTION: ") +
      threat.orgName +
      " — COLLECTION URGENCY",
    body: pick(messages),
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
    read: false,
    threatId: threat.id,
    geo: { lat: threat.location.lat, lon: threat.location.lon },
  };

  if (severity === "CRITICAL") {
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
    if (threat.domestic && typeof DOMESTIC_THREAT_TO_OP_TYPE !== "undefined") {
      opTypes = DOMESTIC_THREAT_TO_OP_TYPE[threat.type] ||
        THREAT_TO_OP_TYPE[threat.type] || ["INVESTIGATION"];
    } else {
      opTypes = THREAT_TO_OP_TYPE[threat.type] || ["SURVEILLANCE"];
    }
    if (
      threat.location &&
      threat.location.country &&
      typeof getCountryStance === "function"
    ) {
      var countryStance = getCountryStance(threat.location.country);
      if (countryStance && countryStance.level === 0) {
        opTypes = opTypes.filter(function (t) {
          return t !== "DIPLOMATIC_RESPONSE";
        });
        if (opTypes.length === 0) opTypes = ["MILITARY_STRIKE"];
      }
    }
    opType = pick(opTypes);
  }

  // If NAVAL_INTERDICTION was picked, force maritime flag for consistency
  if (opType === "NAVAL_INTERDICTION" && !threat.maritime) {
    threat.maritime = true;
  }

  var codename = generateCodename();
  var detectionDelay = randInt(2, 5); // Vigil processes near-instantly

  // Calculate remaining urgency from threat expiration
  var remainingMinutes = Math.max(360, threat.expiresAt - V.time.totalMinutes);
  var urgencyHours = Math.max(6, Math.round(remainingMinutes / 60));

  var opTypeLabel = OPERATION_TYPES[opType]
    ? OPERATION_TYPES[opType].label.toLowerCase()
    : "response";

  // Rich, parametrized briefings
  var briefings = [
    "Vigil intelligence analysis has identified " +
      threat.orgName +
      " as requiring direct action in the " +
      threat.location.theater.name +
      " theater. " +
      threat.typeLabel +
      " activity in " +
      threat.location.city +
      ", " +
      threat.location.country +
      " has reached actionable intelligence threshold. Operation " +
      codename +
      " authorized for " +
      opTypeLabel +
      ". Operational window: " +
      urgencyHours +
      " hours.",
    "Following sustained intelligence collection on " +
      threat.orgName +
      ", Vigil has assessed that direct action is " +
      "the optimal response. " +
      threat.typeLabel +
      " operations centered on " +
      threat.location.city +
      " present an imminent threat requiring " +
      opTypeLabel +
      ". Operation " +
      codename +
      " initiated. " +
      "All gathered intelligence has been transferred to this operational file.",
    "Operation " +
      codename +
      " established in response to " +
      threat.orgName +
      " (" +
      threat.typeLabel +
      ") " +
      "in " +
      threat.location.city +
      ", " +
      threat.location.country +
      ". Vigil recommends " +
      opTypeLabel +
      " based on threat profile analysis. Estimated " +
      urgencyHours +
      "h until threat manifests. " +
      "Intelligence package contains " +
      threat.intelFields.length +
      " assessed fields.",
  ];

  var op = {
    id: uid("OP"),
    codename: codename,
    label: threat.typeLabel + " Response",
    category: "SECURITY",
    operationType: opType,
    status: "DETECTED",
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
  fire("operation:spawned", { operation: op });

  addLog(
    "OP " + codename + " created targeting " + threat.orgName + ".",
    "log-op",
  );
}

// ===================================================================
//  SPAWN OPERATION FROM EVENT (separate path — no threat card)
// ===================================================================

function spawnOperationFromEvent(event, urgent) {
  var loc = event.location || generateRandomLocation();
  var codename = generateCodename();
  var threatLvl = randInt(2, 5);

  var opType = EVENT_TO_OP_TYPE[event.category] || "SURVEILLANCE";
  var urgencyHours = urgent ? randInt(12, 36) : randInt(48, 168);
  var detectionDelay = randInt(2, 5);

  var op = {
    id: uid("OP"),
    codename: codename,
    label: event.label,
    category: event.category,
    operationType: opType,
    status: "DETECTED",
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
  fire("operation:spawned", { operation: op });

  addLog("OP " + codename + " detected. Vigil initiating analysis.", "log-op");

  pushFeedItem({
    id: uid("FI"),
    type: "OPERATION",
    severity: urgent ? "HIGH" : "ELEVATED",
    header: "THREAT DETECTED: " + codename,
    body:
      "Vigil has detected a new threat requiring operational response in " +
      loc.city +
      ", " +
      loc.country +
      ". Operation " +
      codename +
      " has been initiated. Vigil is analyzing deployment options.",
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
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
  if (
    v.indexOf("imminent") >= 0 ||
    v.indexOf("48-72 hours") >= 0 ||
    v.indexOf("48h") >= 0
  ) {
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
  if (
    v.indexOf("window closing") >= 0 ||
    v.indexOf("reinforcements expected") >= 0
  ) {
    return randInt(24 * 60, 48 * 60);
  }
  // "no proof of life for 72h" or "condition unknown" = urgent
  if (
    v.indexOf("no proof of life") >= 0 ||
    v.indexOf("condition unknown") >= 0 ||
    v.indexOf("urgency critical") >= 0
  ) {
    return randInt(12 * 60, 36 * 60);
  }
  // "medical intervention within 24 hours" or similar
  if (/medical.{0,30}within (\d+)/.test(v)) {
    var h4 = parseInt(RegExp.$1);
    return randInt(h4 * 40, h4 * 60);
  }
  // Week-range: "2-4 weeks", "timeline: 2-4 weeks"
  if (/(\d+)-(\d+) weeks?/.test(v)) {
    var w1 = parseInt(RegExp.$1),
      w2 = parseInt(RegExp.$2);
    return randInt(w1 * 7 * 24 * 60, w2 * 7 * 24 * 60);
  }
  // "elevated alert", "strategic rocket forces" = days
  if (v.indexOf("elevated alert") >= 0 || v.indexOf("being fueled") >= 0) {
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
      var timeStr =
        remaining.hours < 48
          ? remaining.hours + "h"
          : remaining.days < 30
            ? remaining.days + "d"
            : Math.round(remaining.days / 30) + "mo";
      addLog(
        "VIGIL ANALYSIS: " +
          threat.orgName +
          " — intel indicates operational window of " +
          timeStr +
          ". Threat timeline adjusted.",
        "log-warn",
      );

      // Push a feed notification
      fire("notification:push", {
        title: "TIMELINE ADJUSTMENT",
        body:
          field.label +
          " on " +
          threat.orgName +
          " reveals shortened operational window. " +
          "Estimated " +
          timeStr +
          " remaining.",
        severity: remaining.hours <= 48 ? "HIGH" : "ELEVATED",
        icon: "⏱",
      });
      break; // Only adjust once per threat
    }
  }
}

function getIntelThreats() {
  return V.threats.filter(function (t) {
    return t.phase === "INTEL" && t.status === "ACTIVE";
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
  if (!threat.expiresAt)
    return { minutes: Infinity, hours: Infinity, days: Infinity, pct: 100 };
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
  threat.phase = "ARCHIVED";
  threat.status = "ARCHIVED";

  // Recall collectors
  if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
    returnAssetsToBase(threat.collectorAssetIds.slice());
    threat.collectorAssetIds = [];
  }

  addLog(
    threat.orgName + " archived — threat assessment: non-actionable.",
    "log-info",
  );
}
