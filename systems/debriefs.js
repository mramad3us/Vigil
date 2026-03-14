/* ============================================================
   VIGIL — systems/debriefs.js
   Faux13-style after-action reports. Every line parametrized
   with real op/asset data. 10 generator types, success/failure
   branches.
   ============================================================ */

// --- Vocabulary Pools ---

var DEBRIEF_CALLSIGNS = [
  'VANGUARD', 'SENTINEL', 'OVERLORD', 'GUARDIAN', 'WARDEN', 'PALADIN',
  'SPECTER', 'PHANTOM', 'NOMAD', 'ROGUE', 'BISHOP', 'KNIGHT',
  'CASTLE', 'PROPHET', 'ORACLE', 'REAPER', 'HUNTER', 'PROWLER',
  'TALON', 'RAZOR', 'SABER', 'RAPTOR', 'CONDOR', 'VULTURE',
  'WRAITH', 'SHADE', 'EMBER', 'FROST', 'APEX', 'ZENITH',
];

var DEBRIEF_WEATHER = [
  'Clear skies, visibility unlimited',
  'Partial cloud cover at 8,000ft, visibility 10km',
  'Overcast, ceiling at 3,000ft, light rain',
  'Heavy cloud cover, intermittent precipitation',
  'Sandstorm conditions, visibility reduced to 500m',
  'Dense fog, visibility under 200m',
  'Clear with high winds, 35kt gusting to 50kt',
  'Scattered thunderstorms in AO',
  'Night operations — no illumination, new moon',
  'Tropical humidity, temperatures exceeding 45°C',
];

var DEBRIEF_BREACH = [
  'Explosive breach on primary entry point',
  'Simultaneous entry through two access points',
  'Covert infiltration via an unguarded perimeter section',
  'Rooftop insertion via fast-rope',
  'Subsurface approach through drainage infrastructure',
  'Vehicle-borne approach under cover of civilian traffic',
  'Maritime insertion from rigid-hull inflatable boats',
  'HALO insertion from 25,000ft AGL',
  'Diversionary action drew guards; primary team entered undetected',
  'Electronic lock bypass followed by silent entry',
];

var DEBRIEF_EVIDENCE = [
  'Communications equipment and encrypted storage devices',
  'Financial records linking the organization to state funding',
  'Weapons cache including military-grade ordnance',
  'Biometric data and identity documents of cell members',
  'Planning documents detailing future operations',
  'Chemical precursors consistent with IED manufacturing',
  'Satellite phones with recoverable call history',
  'Laptop computers containing operational correspondence',
  'Maps and surveillance photography of potential targets',
  'Cash reserves totaling approximately $2.3M USD',
];

var DEBRIEF_COMPROMISE = [
  'counter-surveillance detected the approach',
  'an encrypted communication was intercepted by the target',
  'a local informant alerted the target organization',
  'unexpected civilian presence in the operational area',
  'target relocated to an alternate site 6 hours prior',
  'electronic countermeasures disrupted team communications',
  'hostile QRF responded faster than intelligence predicted',
  'weather conditions degraded ISR coverage at a critical moment',
];

var DEBRIEF_EXFIL = [
  'Exfiltration via tiltrotor to a forward staging area',
  'Ground exfil to a pre-positioned extraction vehicle',
  'Maritime extraction by submarine',
  'Helicopter extraction under covering fire',
  'Overland movement to a safe house, extraction at dawn',
  'Commercial cover — team departed via civilian aviation',
  'Exfil to a nearby allied military installation',
  'Emergency extraction via V-22 Osprey under hostile fire',
  'Dispersed exfil — team members departed individually over 48 hours',
];

// --- Main Entry Point ---

function generateDebrief(op, success) {
  var v = op.fillVars || {};
  var generator = DEBRIEF_GENERATORS[op.operationType];
  if (!generator) generator = DEBRIEF_GENERATORS.MILITARY_STRIKE;

  var sections = generator(op, v, success);
  return assemblDebrief(sections, op, success);
}

// --- Debrief Assembly ---

function assemblDebrief(sections, op, success) {
  var html = '';
  html += headerSection(op, success);
  html += deployedSection(op);
  html += vigilAssessmentSection(op);

  for (var i = 0; i < sections.length; i++) {
    html += sections[i];
  }

  html += classificationFooter(op);
  return html;
}

// --- Common Sections ---

function headerSection(op, success) {
  var outcomeClass = success ? 'debrief-success' : 'debrief-failure';
  var outcomeLabel = success ? 'MISSION SUCCESS' : 'MISSION FAILURE';
  var dt = dayToDate(V.time.day, V.time.year, V.time.month);
  var dateStr = dt.dayOfMonth + ' ' + MONTH_NAMES[dt.month] + ' ' + dt.year;

  return '<div class="debrief-header">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-title">AFTER-ACTION REPORT</div>' +
    '<div class="debrief-codename">' + op.codename + '</div>' +
    '<div class="debrief-outcome ' + outcomeClass + '">' + outcomeLabel + '</div>' +
    '<div class="debrief-date">' + dateStr + ' — ' + (op.location ? op.location.city + ', ' + op.location.country : 'UNKNOWN AO') + '</div>' +
  '</div>';
}

function deployedSection(op) {
  if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">DEPLOYED ASSETS</div>' +
    '<div class="debrief-assets">';

  for (var i = 0; i < op.assignedAssetIds.length; i++) {
    var asset = getAsset(op.assignedAssetIds[i]);
    if (!asset) continue;
    var base = getBase(asset.homeBaseId);
    var catInfo = ASSET_CATEGORIES[asset.category] || {};

    html += '<div class="debrief-asset-card">' +
      '<div class="debrief-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || asset.category) + '</div>' +
      '<div class="debrief-asset-name">' + asset.name + '</div>' +
      '<div class="debrief-asset-origin">Origin: ' + (base ? base.name + ', ' + base.country : 'Unknown') + '</div>' +
    '</div>';
  }

  html += '</div></div>';
  return html;
}

function vigilAssessmentSection(op) {
  if (!op.options || op.selectedOptionIdx === undefined) return '';

  var selected = op.options[op.selectedOptionIdx];
  var recommended = op.options[op.vigilRecommendedIdx];
  var deviated = op.deviatedFromVigil;

  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">VIGIL ASSESSMENT</div>' +
    '<div class="debrief-vigil-assessment">';

  html += '<div class="debrief-meta-row">' +
    '<span class="debrief-meta-key">SELECTED OPTION</span>' +
    '<span class="debrief-meta-val">' + selected.label + ' (Confidence: ' + selected.confidencePercent + '%)</span>' +
  '</div>';

  if (deviated && recommended) {
    html += '<div class="debrief-meta-row debrief-deviation">' +
      '<span class="debrief-meta-key">VIGIL RECOMMENDED</span>' +
      '<span class="debrief-meta-val">' + recommended.label + ' (Confidence: ' + recommended.confidencePercent + '%)</span>' +
    '</div>' +
    '<div class="debrief-deviation-note">⚠ OPERATOR DEVIATED FROM VIGIL RECOMMENDATION. This deviation has been logged and will be factored into viability assessment.</div>';
  } else {
    html += '<div class="debrief-compliance-note">Operator followed Vigil recommendation.</div>';
  }

  html += '</div></div>';
  return html;
}

function classificationFooter(op) {
  return '<div class="debrief-footer">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-case-file">CASE FILE: ' + generateCaseFileId() + ' — VIGIL INTERNAL DISTRIBUTION ONLY</div>' +
  '</div>';
}

// --- Timeline Builder ---

function buildTimeline(entries) {
  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">OPERATIONAL TIMELINE</div>' +
    '<div class="debrief-timeline">';

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var cls = e.type === 'critical' ? ' critical' : e.type === 'failure' ? ' failure' : '';
    html += '<div class="debrief-timeline-entry' + cls + '">' +
      '<div class="debrief-timeline-time">' + e.time + '</div>' +
      '<div class="debrief-timeline-text">' + e.text + '</div>' +
    '</div>';
  }

  html += '</div></div>';
  return html;
}

function buildAssessment(text) {
  return '<div class="debrief-section">' +
    '<div class="debrief-section-title">STRATEGIC ASSESSMENT</div>' +
    '<div class="debrief-assessment">' + text + '</div>' +
  '</div>';
}

// --- Time Helpers ---

function zuluTime(hourOffset) {
  var h = (V.time.hour + hourOffset) % 24;
  if (h < 0) h += 24;
  return String(h).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0') + 'Z';
}

function dayLabel(offset) {
  return 'D' + (offset >= 0 ? '+' : '') + offset;
}

// --- Generators ---

var DEBRIEF_GENERATORS = {};

// --- MILITARY STRIKE ---

DEBRIEF_GENERATORS.MILITARY_STRIKE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' departed ' + v.primaryBase + '. Mission callsign: ' + callsign + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Transit to ' + v.city + ', ' + v.country + '. Conditions: ' + weather + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'ISR assets established overwatch of target area in ' + v.city + '. ' + v.threatLevel + '/5 threat environment confirmed.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' commenced strike on designated targets. Multiple precision munitions delivered on confirmed positions of ' + v.orgName + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Battle damage assessment confirms destruction of primary target. Secondary targets neutralized. ' + v.orgName + ' command infrastructure degraded.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. All assets accounted for.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' initiated strike sequence. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'failure', text: 'Strike on ' + v.city + ' target complex achieved partial effect only. Primary target of ' + v.orgName + ' is assessed to have survived. Collateral damage under assessment.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Assets recovered. Mission commander reports target had relocated prior to strike. Intelligence gap identified.' });
  }

  var assessment = success ?
    'Operation ' + v.codename + ' achieved its primary objective in the ' + v.theater + ' theater. ' + v.orgName + '\'s operational capability in ' + v.city + ' has been significantly degraded. Theater risk assessment adjusted downward. Deployed assets returning to ' + v.primaryBase + '.' :
    'Operation ' + v.codename + ' failed to achieve its primary objective. ' + v.orgName + ' remains operational in ' + v.city + ', ' + v.country + '. Intelligence suggests the target was alerted prior to the strike. A review of operational security protocols is recommended. Theater risk remains elevated.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- SOF RAID ---

DEBRIEF_GENERATORS.SOF_RAID = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var breach = pick(DEBRIEF_BREACH);
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(-8), type: 'normal', text: v.primaryAsset + ' staged at forward operating base. Final intelligence brief received from Vigil. Target: ' + v.orgName + ' compound in ' + v.city + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Team ' + callsign + ' departed ' + v.primaryBase + ' for insertion. ' + weather + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Team reached objective rally point. ' + breach + '.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' breached target compound. ' + randInt(4, 12) + ' hostiles engaged. Target ' + (v.targetAlias || 'HVT') + ' secured.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+20min', type: 'normal', text: 'SSE complete. Recovered: ' + pick(DEBRIEF_EVIDENCE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. Zero friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' initiated breach. Immediate contact — ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+15min', type: 'failure', text: 'Heavy resistance from ' + v.orgName + ' fighters. Target ' + (v.targetAlias || 'HVT') + ' not located at objective. Compound partially cleared.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Emergency extraction initiated. ' + randInt(1, 3) + ' team members WIA. Mission commander called abort.' });
  }

  var assessment = success ?
    'Operation ' + v.codename + ': SOF raid on ' + v.orgName + ' compound in ' + v.city + ' achieved all objectives. Target ' + (v.targetAlias || 'HVT') + ' captured/neutralized. Sensitive materials recovered for exploitation. ' + v.primaryAsset + ' returning to ' + v.primaryBase + '.' :
    'Operation ' + v.codename + ': SOF raid on ' + v.orgName + ' in ' + v.city + ' did not achieve primary objective. Target was not present at the compound. Significant hostile resistance encountered. Casualty report filed. Operational security review initiated.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- SURVEILLANCE ---

DEBRIEF_GENERATORS.SURVEILLANCE = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' tasked for persistent surveillance of ' + v.orgName + ' activities in ' + v.city + ', ' + v.country + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'ISR platform on station. Full-spectrum coverage initiated — SIGINT, IMINT, and pattern-of-life analysis.' });

  if (success) {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Identified ' + randInt(3, 8) + ' previously unknown associates of ' + v.orgName + '. Network map updated.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(4), type: 'critical', text: 'Critical intelligence obtained: ' + pick(DEBRIEF_EVIDENCE) + '. Data transmitted to Vigil for analysis.' });
    entries.push({ time: dayLabel(3) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance window complete. Asset repositioned. ' + randInt(40, 200) + ' hours of collected data processed.' });
  } else {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Limited collection achieved. ' + v.orgName + ' employing counter-surveillance measures in ' + v.city + '.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(4), type: 'failure', text: 'Target organization went dark after suspected detection of ISR platform. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(3) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance terminated. Minimal actionable intelligence collected. Target awareness of Vigil interest confirmed.' });
  }

  var assessment = success ?
    'Surveillance of ' + v.orgName + ' in ' + v.city + ' yielded high-value intelligence. Network analysis has identified new nodes for future targeting. Intel score increased. Recommend sustained collection posture in ' + v.theater + ' theater.' :
    'Surveillance operation against ' + v.orgName + ' in ' + v.city + ' compromised. Counter-surveillance by the target resulted in loss of collection capability. ' + v.orgName + ' is likely to adjust TTPs. Alternative collection methods recommended.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- NAVAL INTERDICTION ---

DEBRIEF_GENERATORS.NAVAL_INTERDICTION = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' departed ' + v.primaryBase + '. Ordered to establish interdiction zone near ' + v.city + ', ' + v.country + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Naval assets on station. Interdiction zone established. All vessels entering the area subject to inspection.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Suspect vessel intercepted. Board-and-search conducted. Cargo confirmed: ' + pick(DEBRIEF_EVIDENCE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'Vessel seized and crew detained. ' + v.orgName + '\'s maritime supply line disrupted. Evidence catalogued for prosecution.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Interdiction zone maintained for 12 additional hours. No further contacts. ' + v.primaryAsset + ' released to return to homeport.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Multiple vessels inspected. No contraband detected.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(6), type: 'failure', text: 'Intelligence indicates ' + v.orgName + '\'s shipment diverted to alternate route before interdiction zone was established. Transit time to ' + v.city + ' exceeded the operational window.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Interdiction terminated. ' + v.primaryAsset + ' returning to ' + v.primaryBase + '. Shipment is assessed to have reached its destination.' });
  }

  var assessment = success ?
    'Naval interdiction near ' + v.city + ' successfully disrupted ' + v.orgName + '\'s maritime logistics. Seized cargo provides actionable intelligence on supply chain. Recommend sustained maritime presence in the area.' :
    'Interdiction failed to intercept target shipment. ' + v.orgName + ' demonstrated awareness of naval patrol patterns. Intelligence timeline was insufficient — assets arrived after the window of opportunity closed.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- CYBER OP ---

DEBRIEF_GENERATORS.CYBER_OP = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: v.primaryAsset + ' initiated cyber operation against ' + v.orgName + '\'s network infrastructure in ' + v.city + ', ' + v.country + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Initial access vector established. Lateral movement in progress through target network.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Full network access achieved. ' + randInt(2, 8) + 'TB of data exfiltrated from ' + v.orgName + '\'s servers. Implants deployed for persistent access.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Operational cleanup complete. Attribution indicators scrubbed. ' + v.orgName + '\'s encryption keys compromised — future communications can be monitored.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'failure', text: 'Intrusion detected by target\'s security operations center. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: v.orgName + ' initiated network isolation protocols. Access lost. Partial data collection — intelligence value limited.' });
  }

  var assessment = success ?
    'Cyber operation against ' + v.orgName + ' in ' + v.country + ' achieved comprehensive network penetration. Persistent access established for ongoing intelligence collection. Data exploitation in progress — initial analysis reveals ' + pick(DEBRIEF_EVIDENCE).toLowerCase() + '.' :
    'Cyber operation detected and contained by ' + v.orgName + '\'s defensive capabilities. Target network has been hardened. Recommend alternative collection approaches for this target in the ' + v.theater + ' theater.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- HOSTAGE RESCUE ---

DEBRIEF_GENERATORS.HOSTAGE_RESCUE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var breach = pick(DEBRIEF_BREACH);
  var hostageCount = randInt(3, 12);
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' deployed from ' + v.primaryBase + '. ' + hostageCount + ' hostages confirmed held by ' + v.orgName + ' in ' + v.city + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-3), type: 'normal', text: 'ISR confirmed hostage location. Team ' + callsign + ' staged at final assault position.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: breach + '. Snipers in overwatch positions.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' executed simultaneous breach. ' + randInt(3, 8) + ' hostage-takers neutralized in under 90 seconds. All ' + hostageCount + ' hostages recovered alive.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+10min', type: 'normal', text: 'Hostages evacuated to casualty collection point. Minor injuries reported. ' + pick(DEBRIEF_EXFIL) + '.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' breached. Immediate heavy contact. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+8min', type: 'failure', text: 'Hostage-takers executed ' + randInt(1, Math.max(1, Math.floor(hostageCount / 3))) + ' hostages before being neutralized. ' + (hostageCount - randInt(1, 3)) + ' hostages recovered alive with injuries.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Emergency medical evacuation. Scene secured. Multiple casualties on all sides.' });
  }

  var assessment = success ?
    'Hostage rescue in ' + v.city + ', ' + v.country + ' was a complete success. All ' + hostageCount + ' hostages recovered unharmed. ' + v.orgName + ' cell eliminated. Operation demonstrates the value of precise, timely SOF deployment.' :
    'Hostage rescue in ' + v.city + ' resulted in partial failure. Hostages were lost during the assault. ' + v.orgName + '\'s defensive preparations exceeded intelligence estimates. Vigil is conducting a review of the intelligence gap that led to underestimation of hostile readiness.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- COUNTER TERROR ---

DEBRIEF_GENERATORS.COUNTER_TERROR = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var entries = [];

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: 'Vigil intelligence identified ' + v.orgName + ' cell preparing an attack in ' + v.city + ', ' + v.country + '. ' + v.primaryAsset + ' tasked for counter-terrorism operation.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance established on ' + randInt(3, 6) + ' known cell members. Pattern-of-life analysis underway.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Team ' + callsign + ' in position. Coordinated takedown authorized for ' + v.city + ' and surrounding areas.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Simultaneous raids across ' + randInt(2, 4) + ' locations. ' + randInt(4, 10) + ' suspects detained. ' + v.orgName + ' cell leadership neutralized.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Attack materiel recovered: ' + pick(DEBRIEF_EVIDENCE) + '. Planned attack disrupted prior to execution.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'All detained subjects transferred to secure facility for interrogation. No civilian casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Raids initiated. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'failure', text: 'Cell leadership fled ' + v.city + ' prior to raids. ' + randInt(1, 3) + ' low-level operatives detained. Core network remains intact.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: v.orgName + ' released a statement claiming credit for evading the operation. Propaganda value assessed as significant.' });
  }

  var assessment = success ?
    'Counter-terrorism operation in ' + v.city + ' successfully dismantled ' + v.orgName + '\'s operational cell. Attack planning disrupted. Detained subjects are providing intelligence under interrogation. Threat to ' + v.theater + ' theater reduced.' :
    'Counter-terrorism operation in ' + v.city + ' failed to neutralize ' + v.orgName + '\'s core leadership. The cell was alerted and dispersed. ' + v.orgName + ' remains capable of conducting attacks in ' + v.country + '. Enhanced surveillance recommended.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- DIPLOMATIC RESPONSE ---

DEBRIEF_GENERATORS.DIPLOMATIC_RESPONSE = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-8), type: 'normal', text: v.primaryAsset + ' dispatched to ' + v.city + ', ' + v.country + ' to manage diplomatic situation involving ' + v.orgName + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Secure communications established with local US embassy and allied diplomatic staff. Vigil providing real-time intelligence support.' });

  if (success) {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Back-channel negotiations opened with ' + v.country + ' counterparts. Key demands identified and acceptable framework established.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(0), type: 'critical', text: 'Agreement reached. ' + v.country + ' has agreed to terms that protect US interests. Public-facing statement coordinated. Crisis de-escalated.' });
  } else {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Negotiations stalled. ' + v.country + ' delegation refusing to engage on key issues. Media coverage intensifying.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(0), type: 'failure', text: 'Diplomatic effort in ' + v.city + ' collapsed. ' + v.country + ' has issued a public condemnation. Allied partners expressing concern. Situation deteriorating.' });
  }

  var assessment = success ?
    'Diplomatic response in ' + v.city + ' achieved de-escalation. US interests in ' + v.theater + ' theater preserved. Relations with ' + v.country + ' stabilized at acceptable levels. Intelligence gathered during negotiations has been forwarded to Vigil.' :
    'Diplomatic response failed. Relations with ' + v.country + ' have deteriorated further. Theater risk in ' + v.theater + ' increased. Recommend alternative approaches including economic leverage and allied coordination.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- INTEL COLLECTION ---

DEBRIEF_GENERATORS.INTEL_COLLECTION = function(op, v, success) {
  var sourceCode = generateSourceCode();
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' initiated intelligence collection operation in ' + v.city + ', ' + v.country + '. Target: ' + v.orgName + ' network.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Case officer met with source ' + sourceCode + ' at pre-arranged location. Source provided initial assessment of ' + v.orgName + ' activities.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Source ' + sourceCode + ' delivered: ' + pick(DEBRIEF_EVIDENCE) + '. Intelligence corroborated by SIGINT intercepts.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Follow-up meeting established. Source recruited for ongoing reporting. Cover story intact. No counter-intelligence indicators detected.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'failure', text: 'Source ' + sourceCode + ' failed to appear at meeting. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Source status: unknown. Counter-intelligence indicators suggest possible compromise. Case officer extracted from ' + v.city + '. Source network in ' + v.country + ' placed on hold.' });
  }

  var assessment = success ?
    'Intelligence collection against ' + v.orgName + ' in ' + v.city + ' was successful. Source ' + sourceCode + ' is producing high-value reporting. Vigil has integrated new intelligence into threat models for ' + v.theater + ' theater.' :
    'Intelligence collection operation in ' + v.city + ' compromised. Source ' + sourceCode + ' is presumed lost. ' + v.orgName + '\'s counter-intelligence capabilities in ' + v.country + ' have been re-evaluated upward. Network requires reconstruction.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// --- DRONE STRIKE ---

DEBRIEF_GENERATORS.DRONE_STRIKE = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' launched from ' + v.primaryBase + '. Target package: ' + v.orgName + ' leadership in ' + v.city + ', ' + v.country + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Platform on station. Target compound under observation. ' + pick(DEBRIEF_WEATHER) + '. Pattern-of-life confirms target ' + (v.targetAlias || 'HVT') + ' present.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Strike authorization confirmed by operator. Weapons release authorized under Vigil Directive 3.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Precision strike delivered. ' + randInt(1, 3) + ' munitions on target. Post-strike imagery confirms destruction of ' + v.orgName + ' compound. Target ' + (v.targetAlias || 'HVT') + ' eliminated.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'BDA complete. No collateral damage beyond target compound. ' + v.primaryAsset + ' returning to ' + v.primaryBase + '.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Strike delivered on target coordinates. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'failure', text: 'BDA inconclusive. Target ' + (v.targetAlias || 'HVT') + ' may have departed compound prior to strike. Collateral damage assessment: ' + pick(['minimal', 'under review', 'civilian structures damaged within 100m radius']) + '.' });
  }

  var assessment = success ?
    'Drone strike on ' + v.orgName + ' in ' + v.city + ', ' + v.country + ' achieved target elimination. ' + (v.targetAlias || 'HVT') + ' confirmed KIA. ' + v.orgName + '\'s leadership structure disrupted. ' + v.primaryAsset + ' available for retasking.' :
    'Drone strike failed to eliminate primary target. ' + v.orgName + '\'s ' + (v.targetAlias || 'HVT') + ' survival unconfirmed. The strike may have revealed the extent of Vigil\'s surveillance capability in ' + v.country + '. Target is expected to relocate and increase security measures.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};
