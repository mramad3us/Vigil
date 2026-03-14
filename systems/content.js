/* ============================================================
   VIGIL — systems/content.js
   Procedural content generation: codenames, org names,
   personnel, locations.
   ============================================================ */

function generateCodename() {
  for (var i = 0; i < 200; i++) {
    var c = pick(CODENAME_ADJ) + ' ' + pick(CODENAME_NOUN);
    if (!V.usedCodenames.has(c)) {
      V.usedCodenames.add(c);
      return c;
    }
  }
  return 'OP-' + V.opIdCounter;
}

function generateOrgName() {
  var _usedOrgNames = new Set();
  for (var i = 0; i < V.threats.length; i++) {
    if (V.threats[i].orgName) _usedOrgNames.add(V.threats[i].orgName);
  }

  for (var j = 0; j < 80; j++) {
    var name = 'The ' + pick(ORG_NAME_ADJ) + ' ' + pick(ORG_NAME_NOUN);
    if (!_usedOrgNames.has(name)) return name;
  }
  return 'The ' + pick(ORG_NAME_ADJ) + ' ' + pick(ORG_NAME_NOUN) + ' ' + randInt(2, 9);
}

function generatePersonnelAlias() {
  return pick(PERSONNEL_ALIASES);
}

function generateSourceCode() {
  var prefixes = ['SRC', 'AST', 'CNT', 'AGT'];
  return pick(prefixes) + '-' + pick(PERSONNEL_ALIASES) + '-' + randInt(100, 999);
}

function generateCaseFileId() {
  var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return letters[randInt(0, letters.length - 1)] +
    letters[randInt(0, letters.length - 1)] + '-' +
    randInt(1000, 9999);
}

function generateRandomLocation() {
  var theater = getRandomTheater();
  var city = pick(theater.cities);
  return {
    theater: theater,
    theaterId: theater.id,
    city: city.city,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
}

function generateLocationInTheater(theaterId) {
  var theater = getTheater(theaterId);
  if (!theater) return generateRandomLocation();
  var city = pick(theater.cities);
  return {
    theater: theater,
    theaterId: theater.id,
    city: city.city,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
}

// --- Progressive Intel Field Value Generation ---
// Generates realistic values for each intel field key based on op context.

var INTEL_VALUE_POOLS = {
  // Military Strike
  TARGET_IDENTIFICATION: [
    'Confirmed: mobile SAM battery (SA-21 Growler)',
    'Probable: hardened command bunker, sublevel architecture detected',
    'Confirmed: weapons storage facility — ammunition staging observed',
    'Possible: radar installation with active emissions',
    'Confirmed: logistics hub with heavy vehicle traffic pattern',
  ],
  TARGET_HARDENING: [
    'Reinforced concrete, estimated 3m walls. Underground component likely.',
    'Minimal hardening — prefabricated structures, no blast protection.',
    'Moderate — bermed revetments, some dispersal. Vulnerable to PGM.',
    'Heavy — deep underground facility. May require MOP-class munitions.',
  ],
  AIR_DEFENSE_POSTURE: [
    'IADS active: SA-20/SA-21 coverage, radar emissions detected on 3 bands.',
    'SHORAD only: man-portable systems likely. No radar-guided SAM detected.',
    'Degraded: SEAD operations in adjacent sector have suppressed long-range SAMs.',
    'Unknown: emissions profile inconsistent with known systems. Possible new variant.',
  ],
  CIVILIAN_PROXIMITY: [
    'HIGH — residential area within 200m. Recommend precision munitions only.',
    'MODERATE — agricultural land. Nearest village 1.2km.',
    'LOW — isolated military zone. Nearest civilian structure 5km+.',
    'CRITICAL — target embedded in urban center. Extreme CDE restrictions.',
  ],
  SECONDARY_TARGETS: [
    'Ammunition resupply convoy identified 8km NW. TOT overlap possible.',
    'Communications relay tower servicing target network — additional strike recommended.',
    'No secondary targets identified within strike radius.',
    'Vehicle staging area 2km east shows 12+ military vehicles.',
  ],
  BDA_POTENTIAL: [
    'Satellite pass scheduled 4h post-strike. Full BDA expected within 6h.',
    'ISR orbit will maintain coverage for real-time BDA.',
    'Cloud cover forecast 80% — BDA may require secondary pass.',
  ],

  // SOF Raid
  TARGET_COMPOUND: [
    'Walled compound, 4 structures. Main building: 2 stories, 8 rooms estimated.',
    '3-building complex with outer wall. Guard posts at NE and SW corners.',
    'Single structure, converted warehouse. Multiple entry points identified.',
    'Residential compound, high walls. Interior courtyard visible from overhead.',
  ],
  GUARD_FORCE: [
    '8-12 armed personnel observed during daylight rotations.',
    '4-6 guards, light weapons. No heavy arms observed.',
    '15-20 personnel, rotating shifts. At least 2 crew-served weapons.',
    'Guard force indeterminate — compound shows limited external security.',
  ],
  INGRESS_ROUTES: [
    'Primary: helo insertion LZ 2km south, approach through wadi. Alternate: vehicle via Route 7.',
    'Urban approach — multiple vehicle routes. Foot approach viable from commercial district.',
    'Maritime insertion to beach head, 4km overland movement to target.',
    'Airborne: HALO insertion 15km out, link-up at rally point BRAVO.',
  ],
  HVT_PATTERN_OF_LIFE: [
    'Target arrives compound 1800-1900 local, departs 0600. Most vulnerable: pre-dawn.',
    'Target varies schedule — no predictable pattern. Present 60% of observed days.',
    'Target confirmed at location via SIGINT. Multiple vehicles in compound.',
    'Source reports target present every Thursday for meeting. Confidence: HIGH.',
  ],
  QRF_PROXIMITY: [
    'Military garrison 12km north, estimated response time: 35-45 minutes.',
    'Police checkpoint 3km east. Armed response possible within 15 minutes.',
    'No organized QRF identified within 30km. Local militia disorganized.',
    'Regiment-sized element 8km south. Motorized, response time: 20-30 minutes.',
  ],
  EXFIL_CONDITIONS: [
    'Primary EXFIL: rotary wing, LZ secured. Alternate: vehicle convoy to FOB.',
    'High threat EXFIL corridor — recommend suppression assets on station.',
    'Conditions favorable. Multiple EXFIL routes available. Weather: clear.',
    'EXFIL compromised if QRF responds. Recommend pre-positioned blocking force.',
  ],

  // Surveillance
  AREA_OF_INTEREST: [
    'Grid square covers 15km² industrial zone. 3 facilities of interest flagged.',
    'Urban area centered on diplomatic quarter. 8 known addresses of interest.',
    'Maritime zone: 200nm² in shipping lane. Track all vessels matching profile.',
    'Remote compound cluster — 4 locations within 50km radius.',
  ],
  COMMS_PATTERN: [
    'Encrypted burst transmissions detected daily at 0200Z and 1400Z.',
    'Increased VOIP traffic from target selectors — 300% above baseline.',
    'Pattern consistent with operational planning: frequency, duration, timing match.',
    'Communications dark for 72h. May indicate OPSEC awareness or relocation.',
  ],
  ACTIVITY_BASELINE: [
    '30-day imagery comparison shows new construction at Site A, vehicle increase at Site B.',
    'Baseline established. Normal activity: 5-8 vehicles, 20-30 personnel during work hours.',
    'Activity patterns unchanged from last assessment. No indicators of change.',
    'Significant deviation from baseline — nighttime activity has tripled.',
  ],
  NETWORK_MAPPING: [
    'SIGINT reveals 14-node network spanning 3 countries. Hub node identified.',
    'Partial network map: 8 known nodes, estimated 4-6 unknown. Financier node key.',
    'Social network analysis identifies 3 key facilitators. Recommend targeting.',
    'Network mapping incomplete — encrypted channels preventing full exploitation.',
  ],
  ANOMALY_DETECTION: [
    'Thermal anomaly detected at Site B — possible underground activity.',
    'Vehicle pattern deviation: 3 unknown vehicles visited in 24h window.',
    'No anomalies detected. Recommend extending collection period.',
    'RF emissions detected inconsistent with known infrastructure.',
  ],

  // Naval Interdiction
  VESSEL_IDENTIFICATION: [
    'MV Horizon Star, Panamanian flag. 12,000 DWT cargo vessel. Built 2041.',
    'Fishing vessel cluster — 4 trawlers operating outside normal fishing grounds.',
    'Container ship MSC Valencia, Liberian flag. History of sanctions evasion.',
    'Dhow-type vessel, no AIS transponder. Operating at night only.',
  ],
  CARGO_MANIFEST: [
    'Declared: agricultural equipment. HUMINT indicates weapons components concealed.',
    'Manifest lists commercial goods. Intelligence suggests dual-use chemical precursors.',
    'No manifest available. Vessel loaded at port with known illicit trafficking history.',
    'Manifest inconsistent with observed loading. Containers do not match documentation.',
  ],
  ROUTE_PREDICTION: [
    'Projected route: Strait of Hormuz to Aden, ETA 72h. Intercept window: 36-48h.',
    'Pattern analysis suggests diversion to waypoint off coast — possible at-sea transfer.',
    'Direct route to destination port. Best intercept point: international waters, 200nm out.',
    'Vessel zigzagging — evasive routing. Projected to enter choke point in 18h.',
  ],
  ESCORT_PRESENCE: [
    'No escort vessels detected. Target operating independently.',
    'Patrol craft shadowing at 5nm — possible state-sponsored protection.',
    'Military corvette operating in vicinity — unclear if escort or coincidental.',
    'Fast boats operating ahead of vessel — possible advance security.',
  ],
  BOARDING_CONDITIONS: [
    'Sea state 2, winds 10kt. Conditions favorable for VBSS operation.',
    'Sea state 4, swells 2m. Challenging but feasible. Helo insertion preferred.',
    'Night boarding recommended — reduced crew alertness, better tactical advantage.',
    'Vessel heavily laden, low freeboard. Boarding ladder approach viable.',
  ],

  // Cyber Op
  NETWORK_TOPOLOGY: [
    'Air-gapped primary network. Internet-facing systems on separate VLAN. Jump server identified.',
    'Cloud-hosted infrastructure: AWS region eu-west-1. 47 active instances mapped.',
    'Distributed network spanning 3 data centers. Redundant path architecture.',
    'Legacy network with minimal segmentation. Domain controller exposed.',
  ],
  VULNERABILITY_SCAN: [
    'Critical: unpatched CVE-2051-34201 in perimeter firewall. Exploit available.',
    'Moderate: default credentials on 3 IoT devices within target network.',
    'Multiple vulnerabilities identified. Best approach: supply chain vector.',
    'Hardened target. Zero-day required for initial access.',
  ],
  ACCESS_VECTORS: [
    'Primary: spear-phishing campaign targeting IT administrators.',
    'Primary: compromised supply chain update mechanism.',
    'Primary: exploited VPN appliance. Persistent access established.',
    'Primary: insider access via recruited agent with network credentials.',
  ],
  ATTRIBUTION_CONF: [
    'HIGH — TTPs match known APT group. Tool signatures confirmed.',
    'MODERATE — infrastructure overlaps with previous campaign but tooling has evolved.',
    'LOW — false flag indicators present. Multiple attribution hypotheses.',
    'CONFIRMED — SIGINT intercept corroborates technical attribution.',
  ],
  COUNTER_INTRUSION: [
    'Target has active SOC — 24/7 monitoring. Stealth critical.',
    'Minimal detection capability. Automated alerting only.',
    'Advanced threat detection deployed. Recommend low-and-slow approach.',
    'Incident response team on retainer — expect 4-6h response if detected.',
  ],

  // Hostage Rescue
  HOSTAGE_COUNT: [
    '3 confirmed hostages — 2 US nationals, 1 allied nation.',
    '1 US diplomat. High-profile — media coverage imminent.',
    '8 hostages, mixed nationals. US citizens: 4.',
    '2 confirmed, possibly 3-4. Third hostage unconfirmed.',
  ],
  HOSTAGE_CONDITION: [
    'Proof of life received 12h ago. Hostages appear unharmed.',
    'Source reports hostages under duress. Medical attention needed for one.',
    'No proof of life for 72h. Condition unknown — urgency CRITICAL.',
    'Video released shows hostages alive. Conditions deteriorating.',
  ],
  CAPTOR_FORCE: [
    '6-8 armed captors. AK-pattern rifles, at least 1 RPG observed.',
    '3-4 captors, lightly armed. Appear poorly organized.',
    '12-15 fighters, well-armed. Possible military training.',
    'Force size unknown. Building security prevents ISR observation.',
  ],
  HOLDING_LOCATION: [
    '2nd floor, northeast room of main building. Confirmed by thermal signature.',
    'Basement level. Single access point. Booby-trap indicators present.',
    'Moving between rooms. Last confirmed: ground floor, west wing.',
    'Specific room unknown. Building has 12 rooms across 2 floors.',
  ],
  NEGOTIATION_STATUS: [
    'Demands received. State Department evaluating. No deadline set.',
    'Negotiations stalled. Captors issued 48h ultimatum.',
    'No negotiations — captors refusing all contact.',
    'Back-channel communication established. Captors appear willing to negotiate.',
  ],
  RESCUE_WINDOW: [
    'Optimal window: 0200-0400 local. Guard rotation at 0300.',
    'Window closing — captor reinforcements expected within 24h.',
    'Weather window: 6h of darkness, low moon. Favorable.',
    'No clear window — continuous guard presence. Forced entry required.',
  ],

  // Counter-Terror
  CELL_STRUCTURE: [
    'Flat hierarchy — 4-5 members, single leader. Self-radicalized.',
    'Layered cell — operational arm (3), logistics (4), leadership (2). External handler.',
    'Lone actor with remote facilitation from overseas network.',
    'Multi-cell structure — at least 3 cells in theater, coordinated by single handler.',
  ],
  ATTACK_PLANNING: [
    'SIGINT indicates target selection phase. Surveillance of 3 soft targets detected.',
    'Advanced planning — materials acquisition in progress. Timeline: 2-4 weeks.',
    'Imminent — operational communications suggest attack window of 48-72 hours.',
    'Early planning phase. Aspirational rather than operational capability assessed.',
  ],
  WEAPONS_CACHE: [
    'Source reports safe house in industrial district. Weapons stored in basement.',
    'Vehicle-borne IED components located at secondary location.',
    'Cache location unknown. Materials being sourced from commercial suppliers.',
    'Confirmed arms cache at grid coordinates. Includes small arms, explosives, detonators.',
  ],
  LEADERSHIP_ID: [
    'Cell leader identified: alias GRANITE. Real identity pending. Photo on file.',
    'Leadership structure unclear. Multiple potential leaders identified.',
    'Leader positively identified via biometric match. Known to intelligence community.',
    'External handler identified via SIGINT. Located in neighboring country.',
  ],
  SUPPORT_NETWORK: [
    'Financial support traced to 3 front organizations. Hawala network active.',
    'Logistics support from diaspora community. Couriers identified.',
    'Minimal support network. Cell appears self-sufficient.',
    'Extensive support: safe houses, vehicles, documents, all provided by network.',
  ],

  // Diplomatic Response
  POLITICAL_CONTEXT: [
    'Elections in 60 days. Incumbent government under domestic pressure.',
    'Post-coup transition government. Military retains significant influence.',
    'Coalition government — fragile consensus. Opposition gaining traction.',
    'Stable government but facing economic crisis. US leverage: HIGH.',
  ],
  KEY_ACTORS: [
    'Foreign Minister: pragmatist, receptive to back-channel diplomacy.',
    'Military chief: hardliner. Will resist any perceived loss of sovereignty.',
    'President\'s inner circle divided: 2 pro-engagement, 1 hardliner.',
    'Key actor is intelligence chief — controls information flow to leadership.',
  ],
  LEVERAGE_POINTS: [
    'Military aid package ($2.1B) pending congressional approval. Significant leverage.',
    'Trade agreement renewal in 90 days. Economic dependency: HIGH.',
    'Limited leverage. Country has diversified partnerships. Sanctions ineffective.',
    'UN Security Council vote upcoming. Country needs US support on resolution.',
  ],
  ALLIANCE_IMPACT: [
    'Allied nations support US position. Coordinated response feasible.',
    'NATO allies divided. UK/France supportive, Germany cautious.',
    'Regional allies concerned about escalation. Restraint advised.',
    'Unilateral action will strain relations with 2 key regional partners.',
  ],

  // Intel Collection
  COLLECTION_REQ: [
    'Priority Intelligence Requirement: confirm weapons program status.',
    'Standing requirement: map leadership hierarchy and decision-making process.',
    'Urgent requirement: verify force disposition and readiness posture.',
    'Emerging requirement: assess proliferation risk to non-state actors.',
  ],
  SOURCE_ACCESS: [
    'Source has direct access to target organization leadership.',
    'Source has indirect access via intermediary. Information reliability: B.',
    'Technical collection — no human source required. SIGINT suffices.',
    'Source access is peripheral. Can observe movements but not decisions.',
  ],
  COUNTERINTEL_RISK: [
    'HIGH — target organization has active CI capability. Source at risk.',
    'MODERATE — routine security but no dedicated CI apparatus.',
    'LOW — target unaware of intelligence interest.',
    'CRITICAL — penetration of our network suspected. Operational pause recommended.',
  ],
  PRODUCT_CLASSIFICATION: [
    'Product will be classified TS/SCI with VIGIL compartment restriction.',
    'Product releasable to FVEY partners pending review.',
    'Product contains HUMINT sourcing — restricted distribution.',
    'Product will feed national-level assessment. POTUS briefing likely.',
  ],
  CORROBORATION: [
    'Single-source reporting. Corroboration from second discipline required.',
    'Multi-source: HUMINT and SIGINT align. Confidence: HIGH.',
    'SIGINT corroborates HUMINT timeline but not specifics. Partially corroborated.',
    'No corroboration available. Source reliability history: GOOD.',
  ],

  // Drone Strike
  TARGET_PID: [
    'PID confirmed via multiple sources: facial recognition, SIGINT geolocation, HUMINT.',
    'Visual PID only. SIGINT supports but not conclusive. Confidence: MODERATE.',
    'PID confirmed: target matches biometric profile. Cross-referenced with database.',
    'PID pending — target in vehicle. Awaiting dismount for visual confirmation.',
  ],
  COLLATERAL_ESTIMATE: [
    'CDE Level 1: no civilian structures within blast radius. Clean strike possible.',
    'CDE Level 3: residential building 50m east. Precision weapon required.',
    'CDE Level 2: open area but civilian traffic on nearby road. TOT timing critical.',
    'CDE Level 4: urban environment. High collateral risk. Recommend alternative approach.',
  ],
  WEATHER_WINDOW: [
    'Clear skies for next 12h. Optimal conditions for ISR and strike.',
    'Scattered clouds at FL150. Acceptable for laser-guided munitions.',
    'Sandstorm approaching in 6h. Strike must execute before weather window closes.',
    'Overcast but clearing. Recommend GPS-guided munitions as backup.',
  ],
  LEGAL_AUTHORITY: [
    'Authorized under standing AUMF. Legal review complete.',
    'Requires separate authorization — target not on approved list. Requesting.',
    'Authorized under Title 50. Covert action finding in place.',
    'Legal authority confirmed. ROE allows strike on positive identification.',
  ],
  STRIKE_ASSESSMENT: [
    'Awaiting post-strike ISR pass. BDA in progress.',
    'Initial assessment: target destroyed. Secondary explosions observed.',
    'Strike successful. Target confirmed eliminated via follow-up ISR.',
    'Results inconclusive — dust/debris obscuring. Second pass required.',
  ],
};

// --- Threat-specific Intel Value Pools ---
// These supplement the op-type pools above for threat-level intel fields.

INTEL_VALUE_POOLS.CELL_LOCATION = [
  'Confirmed safehouse in {city} industrial district. Second location suspected 12km northwest.',
  'Primary cell operating from residential area in eastern {city}. SIGINT confirms activity at coordinates.',
  'Cell location triangulated to commercial building in {city}, {country}. Multiple electronic signatures detected.',
  'Known address in suburban {city}. Source reports cell members rotate between 3 locations within the city.',
  'Vigil geolocation places primary cell activity in {city} port district. Foot surveillance confirms.',
  'Two addresses identified in {city}: primary safehouse and a logistics staging area near the central market.',
];

INTEL_VALUE_POOLS.MEMBER_COUNT = [
  'Estimated 6-8 active members based on SIGINT pattern analysis. Possible 3-4 additional support personnel.',
  '12-15 individuals linked to cell. 4-5 assessed as operational, remainder logistics and support.',
  'Minimum 4 confirmed members via biometric identification. True cell size may be 8-10.',
  '3 confirmed operatives, with SIGINT suggesting 2-3 additional handlers operating remotely.',
  'Cell appears compact: 5-7 members total. Self-contained unit with internal logistics capability.',
  'Biometric hits on 9 individuals. Cell structure suggests compartmented teams of 3. Expect 9-12 total.',
];

INTEL_VALUE_POOLS.INTERNAL_COMMS = [
  'Cell using encrypted messaging application with rotating keys. Pattern analysis reveals daily check-in at 0200 local.',
  'Communications via dead drops and courier network. Electronic footprint minimal. One encrypted VHF channel identified.',
  'Multiple channels: encrypted VOIP for planning, SMS via burner phones for coordination, courier for sensitive materials.',
  'Dark web forum for strategic direction. Tactical comms via encrypted app with ephemeral messaging. Key rotation every 72h.',
  'Fragmented communication pattern: leadership communicates through intermediaries only. No direct electronic link to operational arm.',
  'Satellite phone intercepts indicate overseas handler. Local comms use rotating prepaid SIMs purchased in bulk.',
];

INTEL_VALUE_POOLS.TARGET_INTENT = [
  'Assessment: high-profile attack on critical infrastructure in {city}. Specific target selection phase underway.',
  'Intent assessed as mass-casualty event targeting civilian population center. Timeline: within operational window.',
  'Strategic objective unclear — possible demonstration attack to establish credibility with external sponsors.',
  'Vigil analysis indicates kidnapping operation targeting foreign nationals in {country}. Financial motivation primary.',
  'Intent points toward assassination of senior government official in {country}. Surveillance of potential targets detected.',
  'Attack planning targets transportation hub in {city}. VBIED components being assembled. Intended to maximize media impact.',
  'Assessment: planned attack against government installations in Germany. Coordination with local cells confirmed via SIGINT.',
  'Intelligence indicates target is critical infrastructure in Japan. Maritime approach being planned from regional staging area.',
  'Intent assessed as coordinated strike against allied military bases in South Korea. Timeline aligns with upcoming military exercises.',
  'Vigil analysis points to imminent cyber operation targeting financial systems in United Kingdom. Attack vectors mapped.',
];

INTEL_VALUE_POOLS.ACTOR_ID = [
  'State actor confirmed: {country} military intelligence directorate. Operating through proxy networks to maintain deniability.',
  'Attribution HIGH: {country} Ministry of State Security cyber unit. Infrastructure overlaps with 3 previous campaigns.',
  'Probable state actor: {country} special operations command. Uniformed advisors observed alongside proxy militia.',
  'State-affiliated threat actor operating from {city}. Government direction confirmed via intercepted communications with defense ministry.',
  'Hybrid actor: state-owned enterprise fronting for intelligence operations. Personnel are active-duty military with civilian cover.',
];

INTEL_VALUE_POOLS.FORCE_DISPOSITION = [
  'Brigade-sized element positioned along border. 2 mechanized battalions, 1 artillery battalion. Logistics buildup ongoing.',
  'Naval task group: 3 surface combatants, 1 submarine, operating within 200nm of contested waters. Combat-loaded.',
  'Air wing reinforced with 12 additional fighter aircraft at forward operating base. Increased sortie rate observed.',
  'Light infantry division in garrison, elevated readiness. Road movement consistent with pre-deployment preparations.',
  'Two armored battalions deployed to forward positions. Engineer units conducting barrier emplacement consistent with offensive preparations.',
  'Mixed air defense regiment relocated to coastal positions. SA-20 and SA-21 systems operational. Radar emissions on 4 bands.',
];

INTEL_VALUE_POOLS.MOVEMENT_PATTERNS = [
  'Tracked daily convoy movements between military installations. Peak activity 0400-0600 local. Night operations increasing.',
  'Naval patrol patterns shifted — expanding area of operations by 30%. Aggressive posture in disputed waters.',
  'Aerial reconnaissance flights increased 200% over baseline. Corridor suggests interest in specific border region.',
  'Ground force movements consistent with rehearsal for offensive operations. Same unit rotated through assembly area 3 times.',
  'Armored columns observed moving toward staging areas under cover of darkness. Satellite imagery confirms 40+ vehicles.',
];

INTEL_VALUE_POOLS.COMMAND_STRUCTURE = [
  'Theater commander: Lt. Gen. identified via SIGINT. Reports directly to Defense Minister. Aggressive reputation. Known risk-taker.',
  'Dual command: military commander for operations, intelligence director for strategic targeting. Friction between the two detected.',
  'Centralized command under senior colonel. All tactical decisions require headquarters approval — potential exploitable delay.',
  'Program authority rests with civilian director, technical leadership with chief scientist. Military provides security and logistics.',
  'Decentralized structure: regional commanders operate autonomously with strategic guidance. Makes targeting complex but response slower.',
];

INTEL_VALUE_POOLS.STRATEGIC_INTENT = [
  'Intent assessed: territorial expansion into disputed zone. Timing aligned with domestic political calendar.',
  'Posture is coercive, not offensive. Likely seeking concessions through threat of force. Escalation possible if deterrence fails.',
  'Strategic aim: establish fait accompli before international community can respond. 48-72h window for decisive action.',
  'Dual objectives: demonstrate military capability to domestic audience and deter neighboring states from alliance with US.',
  'Intelligence indicates preparation for limited punitive strike. Targets are symbolic rather than militarily significant.',
];

INTEL_VALUE_POOLS.ESCALATION_POSTURE = [
  'Nuclear forces at baseline readiness. No indicators of strategic escalation. Conventional conflict assessment: MODERATE.',
  'Escalation risk HIGH — strategic rocket forces placed on elevated alert. Dual-capable delivery systems being fueled.',
  'No WMD indicators. Escalation likely limited to conventional domain. Information operations intensifying.',
  'Chemical weapons units observed in forward area. Defensive posture assessed, but dual-use equipment present.',
  'Strategic signals suggest willingness to escalate to tactical nuclear level if conventional defense fails. Posture is deterrent.',
  'Escalation ladder unclear. Decision-making authority concentrated in single individual with unpredictable risk calculus.',
];

INTEL_VALUE_POOLS.ORG_LOCATION = [
  'Organization headquarters confirmed in {city}, {country}. Secondary operations in 3 neighboring countries.',
  'Leadership based in {city} commercial district. Front companies used for logistics and communications.',
  'Network spans {city} and surrounding provinces. Primary coordination hub identified via SIGINT.',
  'Organization operates from gated compound in {city} outskirts. Regular meetings observed via ISR.',
  'Distributed across {country} — no single headquarters. Key facilitators rotate between cities monthly.',
];

INTEL_VALUE_POOLS.FINANCIAL_FLOWS = [
  'Hawala network moving $2-5M monthly through intermediaries in 4 countries. Primary funnel through {city} exchange houses.',
  'Cryptocurrency transactions traced to organization wallets. Estimated $8M in digital assets. Mixing services employed.',
  'Front companies in {country} generating legitimate revenue to fund operations. Shell corporation network spans 6 jurisdictions.',
  'State sponsor providing $15M annually through diplomatic channels. Supplemented by extortion rackets in controlled territory.',
  'Narcotics trafficking primary revenue source. Estimated $20-40M annually. Money laundered through real estate in {city}.',
  'Funding traced to diaspora donations, hawala transfers, and a sophisticated invoice fraud scheme targeting European companies.',
];

INTEL_VALUE_POOLS.FACILITY_ID = [
  'Primary facility identified: underground complex near {city}. Overhead imagery shows ventilation systems, security perimeter, heavy vehicle access.',
  'Three facilities of interest in {country}: research lab (confirmed), enrichment facility (probable), and testing site (possible).',
  'Facility located 40km north of {city}. Constructed 2048-2050. Assessed as production facility based on thermal and electromagnetic signatures.',
  'Dual-use pharmaceutical plant in {city} industrial zone. SIGINT intercepts suggest clandestine production wing. IAEA denied access twice.',
  'Hardened bunker complex under mountain terrain. Tunnel entrances visible on imagery. Power consumption inconsistent with declared purpose.',
];

// --- Generate a single intel field value ---
// Called per field when building threat intel. Picks from appropriate pool
// and parametrizes with location/org data.

function generateIntelValue(fieldKey, location, orgName) {
  var pool = INTEL_VALUE_POOLS[fieldKey];
  if (!pool || pool.length === 0) return 'Collection in progress — data insufficient.';

  var val = pick(pool);
  if (location) {
    val = val.replace(/\{city\}/g, location.city || '?');
    val = val.replace(/\{country\}/g, location.country || '?');
    if (location.theater) {
      val = val.replace(/\{theater\}/g, location.theater.name || '?');
    }
  }
  val = val.replace(/\{orgName\}/g, orgName || 'unknown organization');
  return val;
}

var KNOWN_FOREIGN_COUNTRIES = [
  'Germany', 'France', 'Poland', 'Italy', 'Spain', 'Turkey',
  'United Kingdom', 'Japan', 'South Korea', 'China', 'North Korea',
  'Taiwan', 'Pakistan', 'India', 'Afghanistan', 'Bangladesh',
  'Iran', 'Iraq', 'Syria', 'Saudi Arabia', 'Israel', 'Yemen',
  'Lebanon', 'Russia', 'Belarus', 'Kazakhstan', 'Georgia',
  'Nigeria', 'Somalia', 'Libya', 'Mali', 'Kenya', 'Ethiopia',
  'Egypt', 'South Africa', 'Brazil', 'Colombia', 'Venezuela',
  'Argentina', 'Cuba', 'Mexico', 'Canada', 'Ukraine'
];

function parseTargetIntent(value) {
  if (!value) return { targetCountry: 'United States', isUS: true };
  for (var i = 0; i < KNOWN_FOREIGN_COUNTRIES.length; i++) {
    if (value.indexOf(KNOWN_FOREIGN_COUNTRIES[i]) !== -1) {
      return { targetCountry: KNOWN_FOREIGN_COUNTRIES[i], isUS: false };
    }
  }
  return { targetCountry: 'United States', isUS: true };
}
