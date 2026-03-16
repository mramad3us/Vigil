/* ============================================================
   VIGIL — systems/illegals.js
   Illegal agent system: spawning (domestic + foreign), agency
   state initialization, interrogation tick, prisoner management,
   capture pipeline, repatriation.
   ============================================================ */

// ===================================================================
//  AGENCY STATE INITIALIZATION
// ===================================================================
// Build persistent agency objects with intel fields from the config
// data tables. Called at game:start.

function initAgencies() {
  if (!V.agencies) V.agencies = {};

  // State services
  for (var i = 0; i < INTELLIGENCE_SERVICES.length; i++) {
    var svc = INTELLIGENCE_SERVICES[i];
    if (V.agencies[svc.id]) continue; // already exists (loaded save)
    V.agencies[svc.id] = buildAgencyState(svc);
  }

  // Non-state agencies
  for (var j = 0; j < NON_STATE_AGENCIES.length; j++) {
    var nsa = NON_STATE_AGENCIES[j];
    if (V.agencies[nsa.id]) continue;
    V.agencies[nsa.id] = buildAgencyState(nsa);
  }
}

function buildAgencyState(svc) {
  var sizeMod = getAgencySizeModifier(svc);
  var fields = [];

  for (var i = 0; i < AGENCY_INTEL_FIELDS.length; i++) {
    var def = AGENCY_INTEL_FIELDS[i];
    var diff = AGENCY_INTEL_DIFFICULTY[def.difficulty];
    if (!diff) continue;

    var baseTicks = randInt(diff.ticksRange[0], diff.ticksRange[1]);
    var scaledTicks = Math.round(baseTicks * sizeMod);

    fields.push({
      key: def.key,
      label: def.label,
      difficulty: def.difficulty,
      source: def.source,
      dynamic: def.dynamic || false,
      ticksToReveal: scaledTicks,
      ticksAccumulated: 0,
      revealed: false,
      value: null, // generated when revealed
      pendingPursue: false, // for ACTIVE_OPS dynamic field
    });
  }

  return {
    id: svc.id,
    label: svc.label,
    shortLabel: svc.shortLabel,
    country: svc.country || null,
    countries: svc.countries || null,
    type: svc.type,
    region: svc.region || null,
    intelFields: fields,
  };
}

// Size modifier — larger/more capable agencies have harder-to-reveal fields
function getAgencySizeModifier(svc) {
  var majorServices = ['SVR', 'GRU', 'MSS', 'MOIS', 'SIS', 'DGSE', 'BND', 'MOSSAD', 'ISI', 'RAW', 'MIT'];
  var mediumServices = ['RGB', 'GIP', 'NIS_KR', 'CSIS', 'ASIS', 'CIRO', 'GIS', 'ABIN', 'SEBIN', 'DI', 'KGB_BY'];
  if (majorServices.indexOf(svc.id) >= 0) return 1.0;
  if (mediumServices.indexOf(svc.id) >= 0) return 0.6;
  if (svc.type === 'NON_STATE') return 0.4;
  return 0.3; // smaller state services
}

// ===================================================================
//  SPAWN DOMESTIC ILLEGAL
// ===================================================================

function spawnDomesticIllegal() {
  var service = pickSponsoringService(true); // domestic = true
  if (!service) return null;

  var tier = pickAgentTier(service);
  var loc = generateDomesticLocation();

  var threatLevel = randInt(3, 5);
  var expRange = THREAT_EXPIRATION[threatLevel] || THREAT_EXPIRATION[3];
  var expiresIn = randInt(expRange[0], expRange[1]);

  var orgName = service.shortLabel + ' Operative';
  var intelFields = buildIllegalIntelFields('ILLEGAL_AGENT_DOMESTIC', loc, orgName, service, tier);

  var threat = {
    id: uid('THR'),
    type: 'ILLEGAL_AGENT_DOMESTIC',
    typeLabel: 'Foreign Illegal Agent',
    orgName: orgName,
    threatLevel: threatLevel,
    location: loc,
    status: 'ACTIVE',
    phase: 'INTEL',
    daySpawned: V.time.day,
    spawnedAt: V.time.totalMinutes,
    expiresAt: V.time.totalMinutes + expiresIn,
    urgent: false,
    domestic: true,

    // Illegal-specific
    agencyId: service.id,
    agencyLabel: service.label,
    agencyCountry: service.country || (service.countries ? service.countries[0] : ''),
    agentTier: null, // set when AGENT_TIER field is revealed
    killingMethod: null,

    _targetInfo: null,
    intelFields: intelFields,
    collectorAssetIds: [],
    linkedOpId: null,
    urgencyAlertSent: false,
    criticalAlertSent: false,
  };

  V.threats.push(threat);
  fire('threat:spawned', { threat: threat });

  addLog('DOMESTIC ILLEGAL: ' + service.shortLabel + ' operative detected in ' + loc.city + '.', 'log-threat');

  // Count pre-revealed fields
  var revealedCount = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) {
      revealedCount++;
      // Extract tier if pre-revealed
      if (threat.intelFields[i].key === 'AGENT_TIER' && threat.intelFields[i]._agentTier) {
        threat.agentTier = threat.intelFields[i]._agentTier;
      }
    }
  }

  var descPool = ILLEGAL_DOMESTIC_DESCRIPTIONS || [];
  var desc = descPool.length > 0 ? pick(descPool) : 'Vigil domestic monitoring has identified a suspected foreign intelligence operative in ' + loc.city + '.';
  desc = desc.replace(/\{city\}/g, loc.city).replace(/\{agency\}/g, service.shortLabel).replace(/\{orgName\}/g, orgName);

  pushFeedItem({
    id: uid('FI'),
    type: 'THREAT',
    severity: threatLevel >= 4 ? 'HIGH' : 'ELEVATED',
    header: 'DOMESTIC ILLEGAL: ' + orgName,
    body: desc + ' Threat level: ' + threatLevel + '/5. ' +
      revealedCount + '/' + threat.intelFields.length + ' intelligence fields available. Passive collection initiated.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: loc.lat, lon: loc.lon },
    domestic: true,
  });

  return threat;
}

// ===================================================================
//  SPAWN FOREIGN ILLEGAL
// ===================================================================

function spawnForeignIllegal() {
  var service = pickSponsoringService(false); // domestic = false, hostile only
  if (!service) return null;

  var tier = pickAgentTier(service);

  var homeCountry = service.country || (service.countries ? service.countries[0] : '');
  var eligibleLocations = [];
  var isNonState = service.type === 'NON_STATE';

  if (isNonState && service.targets) {
    // Non-state: spawn in their target countries (excluding US — that's domestic)
    var foreignTargets = service.targets.filter(function(t) { return t !== 'United States'; });
    for (var tid in THEATERS) {
      var theater = THEATERS[tid];
      if (!theater.cities) continue;
      for (var c = 0; c < theater.cities.length; c++) {
        var city = theater.cities[c];
        if (foreignTargets.indexOf(city.country) >= 0) {
          eligibleLocations.push(city);
        }
      }
    }
  } else {
    // State service: third country — NOT the service's home, NOT the US
    // Must be a country where US has relations >= 20%
    for (var tid2 in THEATERS) {
      var theater2 = THEATERS[tid2];
      if (!theater2.cities) continue;
      for (var c2 = 0; c2 < theater2.cities.length; c2++) {
        var city2 = theater2.cities[c2];
        if (city2.country === 'United States') continue;
        if (city2.country === homeCountry) continue;
        var cd = V.diplomacy[city2.country];
        if (cd && cd.relations >= 20) {
          eligibleLocations.push(city2);
        }
      }
    }
  }

  if (eligibleLocations.length === 0) return null;
  var loc = pick(eligibleLocations);
  // Add theater info
  var theaterInfo = null;
  for (var tid3 in THEATERS) {
    if (THEATERS[tid3].countries && THEATERS[tid3].countries.indexOf(loc.country) >= 0) {
      theaterInfo = tid3;
      break;
    }
  }

  var threatLevel = randInt(3, 5);
  var expRange = THREAT_EXPIRATION[threatLevel] || THREAT_EXPIRATION[3];
  var expiresIn = randInt(expRange[0], expRange[1]);

  var orgName = service.shortLabel + ' Operative';
  var intelFields = buildIllegalIntelFields('ILLEGAL_AGENT_FOREIGN', loc, orgName, service, tier);

  var threat = {
    id: uid('THR'),
    type: 'ILLEGAL_AGENT_FOREIGN',
    typeLabel: 'Foreign Illegal Agent',
    orgName: orgName,
    threatLevel: threatLevel,
    location: {
      city: loc.city,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon,
      theater: theaterInfo,
      maritime: loc.maritime || false,
    },
    status: 'ACTIVE',
    phase: 'INTEL',
    daySpawned: V.time.day,
    spawnedAt: V.time.totalMinutes,
    expiresAt: V.time.totalMinutes + expiresIn,
    urgent: false,
    domestic: false,

    // Illegal-specific
    agencyId: service.id,
    agencyLabel: service.label,
    agencyCountry: homeCountry,
    agentTier: null,
    killingMethod: null,

    _targetInfo: null,
    intelFields: intelFields,
    collectorAssetIds: [],
    linkedOpId: null,
    urgencyAlertSent: false,
    criticalAlertSent: false,
  };

  V.threats.push(threat);
  fire('threat:spawned', { threat: threat });

  addLog('FOREIGN ILLEGAL: ' + service.shortLabel + ' operative detected in ' + loc.city + ', ' + loc.country + '.', 'log-threat');

  var revealedCount = 0;
  for (var i = 0; i < threat.intelFields.length; i++) {
    if (threat.intelFields[i].revealed) {
      revealedCount++;
      if (threat.intelFields[i].key === 'AGENT_TIER' && threat.intelFields[i]._agentTier) {
        threat.agentTier = threat.intelFields[i]._agentTier;
      }
    }
  }

  var descPool = ILLEGAL_FOREIGN_DESCRIPTIONS || [];
  var desc = descPool.length > 0 ? pick(descPool) : 'Vigil has identified a suspected ' + service.shortLabel + ' operative in ' + loc.city + ', ' + loc.country + '.';
  desc = desc.replace(/\{city\}/g, loc.city).replace(/\{country\}/g, loc.country).replace(/\{agency\}/g, service.shortLabel).replace(/\{orgName\}/g, orgName);

  pushFeedItem({
    id: uid('FI'),
    type: 'THREAT',
    severity: threatLevel >= 4 ? 'HIGH' : 'ELEVATED',
    header: 'FOREIGN ILLEGAL: ' + orgName,
    body: desc + ' Threat level: ' + threatLevel + '/5. ' +
      revealedCount + '/' + threat.intelFields.length + ' intelligence fields available. Passive collection initiated.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
    threatId: threat.id,
    geo: { lat: loc.lat, lon: loc.lon },
  });

  return threat;
}

// ===================================================================
//  PICK SPONSORING SERVICE
// ===================================================================

function pickSponsoringService(isDomestic) {
  var candidates = [];

  if (isDomestic) {
    // State services: weighted from countries with relations <= 35%
    for (var i = 0; i < INTELLIGENCE_SERVICES.length; i++) {
      var svc = INTELLIGENCE_SERVICES[i];
      if (svc.country === 'United States') continue;
      var cd = V.diplomacy[svc.country];
      if (!cd) continue;
      if (cd.relations <= 10) candidates.push({ svc: svc, weight: 6 });
      else if (cd.relations <= 20) candidates.push({ svc: svc, weight: 3 });
      else if (cd.relations <= 35) candidates.push({ svc: svc, weight: 1 });
    }
    // Non-state: always hostile, but only if US is in their targets list
    for (var j = 0; j < NON_STATE_AGENCIES.length; j++) {
      var nsa = NON_STATE_AGENCIES[j];
      if (!nsa.targets || nsa.targets.indexOf('United States') < 0) continue;
      candidates.push({ svc: nsa, weight: 3 });
    }
  } else {
    // State services: only those with hostile relations
    for (var i2 = 0; i2 < INTELLIGENCE_SERVICES.length; i2++) {
      var svc2 = INTELLIGENCE_SERVICES[i2];
      var cd2 = V.diplomacy[svc2.country];
      if (!cd2 || cd2.relations > 10) continue;
      candidates.push({ svc: svc2, weight: 3 });
    }
    // Non-state: always eligible — they're terrorists, relations irrelevant.
    // Must have at least one non-US target country to spawn foreign illegals.
    for (var j2 = 0; j2 < NON_STATE_AGENCIES.length; j2++) {
      var nsa2 = NON_STATE_AGENCIES[j2];
      if (!nsa2.targets) continue;
      var hasForeignTarget = false;
      for (var k2 = 0; k2 < nsa2.targets.length; k2++) {
        if (nsa2.targets[k2] !== 'United States') { hasForeignTarget = true; break; }
      }
      if (hasForeignTarget) candidates.push({ svc: nsa2, weight: 2 });
    }
  }

  if (candidates.length === 0) return null;

  // Weighted pick
  var totalWeight = 0;
  for (var w = 0; w < candidates.length; w++) totalWeight += candidates[w].weight;
  var roll = Math.random() * totalWeight;
  var cumulative = 0;
  for (var w2 = 0; w2 < candidates.length; w2++) {
    cumulative += candidates[w2].weight;
    if (roll < cumulative) return candidates[w2].svc;
  }
  return candidates[candidates.length - 1].svc;
}

// ===================================================================
//  PICK AGENT TIER
// ===================================================================

function pickAgentTier(service) {
  var tiers = [];
  for (var tid in AGENT_TIERS) {
    var t = AGENT_TIERS[tid];
    if (t.stateOnly && service.type === 'NON_STATE') continue;
    tiers.push(t);
  }
  // Weighted pick
  var totalWeight = 0;
  for (var i = 0; i < tiers.length; i++) totalWeight += tiers[i].weight;
  var roll = Math.random() * totalWeight;
  var cumulative = 0;
  for (var j = 0; j < tiers.length; j++) {
    cumulative += tiers[j].weight;
    if (roll < cumulative) return tiers[j];
  }
  return tiers[tiers.length - 1];
}

// ===================================================================
//  BUILD ILLEGAL INTEL FIELDS
// ===================================================================

function buildIllegalIntelFields(threatType, location, orgName, service, tier) {
  var fieldDefs = THREAT_INTEL_FIELDS[threatType];
  if (!fieldDefs) return [];

  var fields = [];
  var genContext = {};  // shared context across field generation (e.g., cover name for identity consistency)
  for (var i = 0; i < fieldDefs.length; i++) {
    var def = fieldDefs[i];
    var diff = INTEL_DIFFICULTY[def.difficulty];
    if (!diff) continue;

    var baseTicks = randInt(diff.ticksRange[0], diff.ticksRange[1]);
    // Apply tier difficulty modifier
    var scaledTicks = Math.round(baseTicks * tier.difficultyMod);
    var preRevealed = Math.random() < diff.preRevealChance;

    var value = generateIllegalIntelValue(def.key, location, orgName, service, tier, genContext);

    var fieldObj = {
      key: def.key,
      label: def.label,
      difficulty: def.difficulty,
      source: def.source,
      ticksToReveal: scaledTicks,
      ticksAccumulated: preRevealed ? scaledTicks : 0,
      revealed: preRevealed,
      value: value,
    };

    // Tag parsing for AGENT_TIER
    if (def.key === 'AGENT_TIER' && value && value.indexOf('|') > 0 && value.indexOf('|') < 20) {
      var pipeIdx = value.indexOf('|');
      var tag = value.substring(0, pipeIdx);
      fieldObj.value = value.substring(pipeIdx + 1);
      fieldObj._agentTier = tag;
    }

    fields.push(fieldObj);
  }
  return fields;
}

// ===================================================================
//  PRISONER CREATION PIPELINE
// ===================================================================

// Extract just the person's name from an intel value string.
// Handles formats like:
//   "Ahmed Tahan — taxi driver based in Seattle. Cover legend..."
//   "True identity confirmed: Ahmed Tahan — a Afghanistan national..."
//   "True identity: Major Dmitri Kozlov, SVR (Foreign Intelligence Service)..."
// Derive display name live from a prisoner's intel field state:
//   1. Real name (if REAL_IDENTITY revealed)
//   2. Cover name (if COVER_IDENTITY revealed)
//   3. Internal codename
function getPrisonerDisplayName(p) {
  if (p.intelFields) {
    for (var i = 0; i < p.intelFields.length; i++) {
      if (p.intelFields[i].key === 'REAL_IDENTITY' && p.intelFields[i].revealed) {
        return extractNameFromIntel(p.intelFields[i].value);
      }
    }
    for (var j = 0; j < p.intelFields.length; j++) {
      if (p.intelFields[j].key === 'COVER_IDENTITY' && p.intelFields[j].revealed) {
        return extractNameFromIntel(p.intelFields[j].value);
      }
    }
  }
  return p.codename || p.name || 'UNKNOWN';
}

function extractNameFromIntel(val) {
  if (!val) return val;
  // Strip "True identity confirmed: " or "True identity: " prefix
  var s = val.replace(/^True identity(?:\s+confirmed)?:\s*/i, '');
  // Take everything before " — " or ", " (agency/description separator)
  var dash = s.indexOf(' — ');
  var comma = s.indexOf(', ');
  if (dash > 0 && (comma < 0 || dash < comma)) return s.substring(0, dash).trim();
  if (comma > 0) return s.substring(0, comma).trim();
  return s.split('.')[0].trim();
}

function createPrisonerFromThreat(threat, sourceOpId) {
  var site = assignDetentionSite(threat.domestic, threat.agentTier);

  var tierDef = threat.agentTier ? AGENT_TIERS[threat.agentTier] : AGENT_TIERS.RECRUITED_AGENT;
  var params = INTERROGATION_PARAMS[tierDef.id] || INTERROGATION_PARAMS.RECRUITED_AGENT;

  var prisoner = {
    id: uid('PRS'),
    codename: threat.orgName,  // internal Vigil designation — always available as fallback
    agency: threat.agencyId,
    agencyLabel: threat.agencyLabel,
    agencyCountry: threat.agencyCountry,
    tier: tierDef.id,
    tierLabel: tierDef.label,
    detentionSite: site.label,
    detentionSiteId: site.id,
    capturedDay: V.time.day,
    capturedAt: V.time.totalMinutes,
    sourceOpId: sourceOpId,
    sourceThreatId: threat.id,

    // Carry over intel fields from threat
    intelFields: [],

    // Interrogation state
    interrogation: {
      progress: 0,
      progressRate: params.progressRate,
      intelPerHour: params.intelPerHour,
      agencyTicksPerHour: params.agencyTicksPerHour,
      totalIntelYielded: 0,
      driedUp: false,
    },

    repatriated: false,
    repatriatedDay: null,
  };

  // Copy intel fields (deep copy)
  for (var j = 0; j < threat.intelFields.length; j++) {
    var src = threat.intelFields[j];
    var copy = {
      key: src.key,
      label: src.label,
      difficulty: src.difficulty,
      source: src.source,
      ticksToReveal: src.ticksToReveal,
      ticksAccumulated: src.ticksAccumulated,
      revealed: src.revealed,
      value: src.value,
    };
    if (src._agentTier) copy._agentTier = src._agentTier;
    prisoner.intelFields.push(copy);
  }

  V.prisoners.push(prisoner);
  fire('prisoner:captured', { prisoner: prisoner });

  addLog('PRISONER: ' + threat.orgName + ' (' + tierDef.label + ') captured. Detained at ' + site.label + '.', 'log-info');

  pushFeedItem({
    id: uid('FI'),
    type: 'VIGIL_ALERT',
    severity: 'HIGH',
    header: 'ILLEGAL CAPTURED: ' + getPrisonerDisplayName(prisoner),
    body: tierDef.label + ' from ' + threat.agencyLabel + ' captured and transferred to ' +
      site.label + ' (' + site.location + '). Interrogation initiated. ' +
      'Expected intel yield based on agent classification: ' + tierDef.id.replace(/_/g, ' ').toLowerCase() + '.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });

  return prisoner;
}

// ===================================================================
//  DETENTION SITE ASSIGNMENT
// ===================================================================

function assignDetentionSite(isDomestic, agentTier) {
  if (isDomestic) {
    // Federal prisons for domestic arrests
    var federal = DETENTION_SITES.filter(function(s) { return s.type === 'FEDERAL'; });
    return pick(federal);
  }
  // Foreign captures — black sites for deep cover, military for others
  if (agentTier === 'DEEP_COVER') {
    var blackSites = DETENTION_SITES.filter(function(s) { return s.type === 'BLACK_SITE'; });
    if (blackSites.length > 0 && Math.random() < 0.7) return pick(blackSites);
  }
  var military = DETENTION_SITES.filter(function(s) { return s.type === 'MILITARY' || s.type === 'BLACK_SITE'; });
  return pick(military);
}

// ===================================================================
//  REPATRIATION
// ===================================================================

// targetCountry: for state agencies this is the agency's home country.
// For non-state agencies, this is the enemy country the player chose to transfer to.
function repatriatePrisoner(prisonerId, targetCountry) {
  var prisoner = getPrisoner(prisonerId);
  if (!prisoner || prisoner.repatriated) return;

  var svc = getServiceById(prisoner.agency);
  var isNonState = svc && svc.type === 'NON_STATE';

  // Default target for state agencies
  if (!targetCountry) targetCountry = prisoner.agencyCountry;

  prisoner.repatriated = true;
  prisoner.repatriatedDay = V.time.day;
  prisoner.repatriatedTo = targetCountry;
  prisoner.interrogation.driedUp = true;

  // Relations boost scales by tier
  var boostRanges = {
    RECRUITED_AGENT: [3, 5],
    MISSION_SPECIFIC: [8, 12],
    DEEP_COVER: [15, 25],
  };
  var range = boostRanges[prisoner.tier] || [3, 5];
  var boost = randInt(range[0], range[1]);

  if (targetCountry && typeof shiftRelations === 'function') {
    shiftRelations(targetCountry, boost, (isNonState ? 'Intelligence transfer' : 'Prisoner repatriation') + ' (' + prisoner.tierLabel + ')');
  }

  var displayName = getPrisonerDisplayName(prisoner);
  var actionVerb = isNonState ? 'transferred to' : 'repatriated to';

  addLog((isNonState ? 'TRANSFER: ' : 'REPATRIATED: ') + displayName + ' ' + actionVerb + ' ' + targetCountry + '. Relations +' + boost + '%.', 'log-info');

  pushFeedItem({
    id: uid('FI'),
    type: 'VIGIL_ALERT',
    severity: 'ELEVATED',
    header: (isNonState ? 'PRISONER TRANSFERRED: ' : 'PRISONER REPATRIATED: ') + displayName,
    body: prisoner.tierLabel + ' from ' + prisoner.agencyLabel + ' ' + actionVerb + ' ' +
      targetCountry + '. ' + (isNonState ? 'Intelligence sharing gesture' : 'Diplomatic gesture') +
      ' — relations improved by ' + boost + '%. ' +
      'Total intelligence yielded during detention: ' + Math.round(prisoner.interrogation.totalIntelYielded) + ' INTEL.',
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });
}

// ===================================================================
//  TICK HOOKS
// ===================================================================

(function() {

  // --- Agency initialization at game start ---
  hook('game:start', function() {
    initAgencies();
    // Initial domestic illegal (0-1)
    if (Math.random() < 0.4) {
      spawnDomesticIllegal();
    }
  }, 6); // After other systems

  // --- Auto-spawn illegals ---
  hook('tick:day', function() {
    // Domestic: ~15% every 5 days
    if (V.time.day % 5 === 0 && Math.random() < 0.15) {
      spawnDomesticIllegal();
    }
    // Foreign: ~10% every 5 days
    if (V.time.day % 5 === 2 && Math.random() < 0.10) {
      spawnForeignIllegal();
    }
  }, 5);

  // --- Interrogation tick ---
  hook('tick:hour', function() {
    for (var i = 0; i < V.prisoners.length; i++) {
      var p = V.prisoners[i];
      if (p.repatriated || p.interrogation.driedUp) continue;

      // Progress
      p.interrogation.progress = Math.min(100, p.interrogation.progress + p.interrogation.progressRate);

      // Intel yield (diminishes with progress)
      var yieldRate = p.interrogation.intelPerHour * (1 - p.interrogation.progress / 100);

      // Bonus if real identity is known
      var realIdKnown = false;
      for (var f = 0; f < p.intelFields.length; f++) {
        if (p.intelFields[f].key === 'REAL_IDENTITY' && p.intelFields[f].revealed) {
          realIdKnown = true;
          break;
        }
      }
      if (realIdKnown) yieldRate *= 1.5;

      if (yieldRate > 0.01) {
        V.resources.intel += yieldRate;
        p.interrogation.totalIntelYielded += yieldRate;
      }

      // Reveal unrevealed intel fields (2x passive speed)
      for (var fi = 0; fi < p.intelFields.length; fi++) {
        var field = p.intelFields[fi];
        if (field.revealed) continue;
        field.ticksAccumulated += 2; // 2x passive rate
        if (field.ticksAccumulated >= field.ticksToReveal) {
          field.revealed = true;
          addLog('INTERROGATION: ' + getPrisonerDisplayName(p) + ' revealed ' + field.label + '.', 'log-info');
        }
      }

      // Contribute to agency intel fields
      var agency = V.agencies[p.agency];
      if (agency && p.interrogation.agencyTicksPerHour > 0) {
        var contribution = p.interrogation.agencyTicksPerHour;
        if (realIdKnown) contribution = Math.round(contribution * 1.5);
        for (var ai = 0; ai < agency.intelFields.length; ai++) {
          var af = agency.intelFields[ai];
          if (af.revealed && !af.dynamic) continue; // static fields stay revealed
          if (af.revealed && af.dynamic && !af.pendingPursue) continue; // dynamic: already pending
          af.ticksAccumulated += contribution;
          if (!af.revealed && af.ticksAccumulated >= af.ticksToReveal) {
            af.revealed = true;
            af.value = generateAgencyIntelValue(af.key, agency);
            if (af.dynamic) af.pendingPursue = true;
            addLog('AGENCY INTEL: ' + agency.shortLabel + ' — ' + af.label + ' revealed.', 'log-info');
          }
        }
      }

      // Dried up check
      if (p.interrogation.progress >= 100) {
        p.interrogation.driedUp = true;
        addLog('INTERROGATION: ' + getPrisonerDisplayName(p) + ' has been fully exploited. No further intelligence expected.', 'log-warn');
      }
    }
  }, 3);

  // --- Passive agency intel tick (Vigil background collection) ---
  hook('tick:hour', function() {
    for (var agencyId in V.agencies) {
      var agency = V.agencies[agencyId];
      for (var i = 0; i < agency.intelFields.length; i++) {
        var field = agency.intelFields[i];
        if (field.revealed && !field.dynamic) continue;
        if (field.revealed && field.dynamic && !field.pendingPursue) continue;
        // Passive: 1 tick per hour
        field.ticksAccumulated += 1;
        if (!field.revealed && field.ticksAccumulated >= field.ticksToReveal) {
          field.revealed = true;
          field.value = generateAgencyIntelValue(field.key, agency);
          if (field.dynamic) field.pendingPursue = true;
          addLog('AGENCY INTEL: ' + agency.shortLabel + ' — ' + field.label + ' revealed through background collection.', 'log-info');
        }
      }
    }
  }, 4);

  // --- AGENT_TIER reveal handler: DEEP_COVER urgency ---
  hook('threat:intel:revealed', function(data) {
    if (!data || !data.threat || !data.field) return;
    var threat = data.threat;
    if (threat.type !== 'ILLEGAL_AGENT_DOMESTIC' && threat.type !== 'ILLEGAL_AGENT_FOREIGN') return;

    if (data.field.key === 'AGENT_TIER' && data.field._agentTier) {
      threat.agentTier = data.field._agentTier;

      // DEEP_COVER: cap expiration at 24h
      if (threat.agentTier === 'DEEP_COVER') {
        var maxExpiry = V.time.totalMinutes + 1440; // 24 hours
        if (threat.expiresAt > maxExpiry) {
          threat.expiresAt = maxExpiry;
          addLog('VIGIL ASSESSMENT: Deep cover illegal identified — operational window reduced to 24h. This agent will vanish.', 'log-warn');

          pushFeedItem({
            id: uid('FI'),
            type: 'URGENT_INTEL',
            severity: 'CRITICAL',
            header: 'DEEP COVER ILLEGAL — WINDOW CLOSING',
            body: 'Vigil has classified ' + threat.orgName + ' as a deep cover illegal in ' +
              threat.location.city + '. Assessment: this operative possesses the tradecraft to ' +
              'disappear within 24 hours. Move to operations immediately or risk losing the target.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
            threatId: threat.id,
          });
        }
      }
    }
  });

  // --- Operation resolution: capture, burn notice, killing method ---
  hook('operation:resolved', function(data) {
    if (!data || !data.operation) return;
    var op = data.operation;
    var threat = op.relatedThreatId ? getThreat(op.relatedThreatId) : null;
    if (!threat) return;

    var isIllegal = (threat.type === 'ILLEGAL_AGENT_DOMESTIC' || threat.type === 'ILLEGAL_AGENT_FOREIGN');
    if (!isIllegal) return;

    if (op.status === 'SUCCESS') {

      // CAPTURE_OP or ARREST_OPERATION on illegal → create prisoner
      if (op.operationType === 'CAPTURE_OP' || op.operationType === 'ARREST_OPERATION') {
        var prisoner = createPrisonerFromThreat(threat, op.id);
        if (prisoner) {
          op._prisonerId = prisoner.id;
          op._prisonerName = getPrisonerDisplayName(prisoner);
        }
      }

      // BURN_NOTICE → relations boost with host country
      if (op.operationType === 'BURN_NOTICE') {
        var hostCountry = threat.location ? threat.location.country : null;
        if (hostCountry && typeof shiftRelations === 'function') {
          var burnBoost = randInt(15, 20);
          shiftRelations(hostCountry, burnBoost, 'Burn notice: illegal agent exposed');
          op._burnNoticeCountry = hostCountry;
          op._burnNoticeBoost = burnBoost;
          addLog('BURN NOTICE: ' + threat.orgName + ' exposed in ' + hostCountry + '. Relations +' + burnBoost + '%.', 'log-info');

          pushFeedItem({
            id: uid('FI'),
            type: 'DIPLOMATIC',
            severity: 'ROUTINE',
            header: 'BURN NOTICE: DIPLOMATIC WINDFALL',
            body: 'The exposure of ' + threat.orgName + ' (' + (threat.agencyLabel || 'foreign service') +
              ') to ' + hostCountry + ' authorities has significantly improved bilateral relations. ' +
              hostCountry + ' relations +' + burnBoost + '%. The agent has been declared persona non grata.',
            timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
            read: false,
          });
        }
      }

      // TARGETED_KILLING on illegal → store killing method for debrief
      if (op.operationType === 'TARGETED_KILLING') {
        if (typeof KILLING_METHODS !== 'undefined' && KILLING_METHODS.length > 0) {
          op._killingMethod = pick(KILLING_METHODS);
        }
      }
    }
  });

  // --- Save compatibility ---
  hook('game:load', function() {
    if (!V.prisoners) V.prisoners = [];
    if (!V.agencies || Object.keys(V.agencies).length === 0) initAgencies();

    // Migrate old saves: backfill codename from legacy name field
    for (var pi = 0; pi < V.prisoners.length; pi++) {
      var p = V.prisoners[pi];
      if (!p.codename) {
        // Old saves stored display name in p.name — use orgName from source threat if possible, else keep as-is
        p.codename = p.name || 'UNKNOWN';
      }
    }
  }, 1);

})();

// ===================================================================
//  PURSUE AGENCY ACTIVE OPS
// ===================================================================
// When an agency's ACTIVE_OPS field is revealed, the player can click
// "Pursue" to spawn a threat associated with that agency.

function pursueAgencyOp(agencyId) {
  var agency = V.agencies[agencyId];
  if (!agency) return;

  // Find the ACTIVE_OPS field
  var opsField = null;
  for (var i = 0; i < agency.intelFields.length; i++) {
    if (agency.intelFields[i].key === 'ACTIVE_OPS' && agency.intelFields[i].revealed && agency.intelFields[i].pendingPursue) {
      opsField = agency.intelFields[i];
      break;
    }
  }
  if (!opsField) return;

  // Spawn a threat associated with this agency
  var service = getServiceById(agencyId);
  if (!service) return;

  // Determine if domestic or foreign based on agency type
  var threat;
  if (service.type === 'NON_STATE') {
    // Non-state: spawn a foreign illegal
    threat = spawnForeignIllegal();
    if (threat) {
      threat.agencyId = agencyId;
      threat.agencyLabel = agency.label;
      threat.orgName = agency.shortLabel + ' Operative';
    }
  } else {
    // State: foreign illegal
    threat = spawnForeignIllegal();
    if (threat) {
      threat.agencyId = agencyId;
      threat.agencyLabel = agency.label;
      threat.agencyCountry = agency.country;
      threat.orgName = agency.shortLabel + ' Operative';
    }
  }

  // Reset the dynamic field
  opsField.revealed = false;
  opsField.pendingPursue = false;
  opsField.ticksAccumulated = 0;
  var diff = AGENCY_INTEL_DIFFICULTY[opsField.difficulty];
  if (diff) {
    var sizeMod = getAgencySizeModifier(service);
    opsField.ticksToReveal = Math.round(randInt(diff.ticksRange[0], diff.ticksRange[1]) * sizeMod);
  }
  opsField.value = null;

  addLog('PURSUE: Intelligence on ' + agency.shortLabel + ' operation operationalized. New threat spawned.', 'log-info');
}
