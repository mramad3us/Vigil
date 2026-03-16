/* ============================================================
   VIGIL — systems/illegals-content.js
   Procedural content for the illegals & counter-espionage system.
   Cover identities, intel value pools, feed descriptions,
   agency intel value generation.
   ============================================================ */

// ===================================================================
//  COVER IDENTITY POOLS
// ===================================================================
// Cover names by region — culturally appropriate aliases.

var ILLEGAL_COVER_NAMES = {
  RUSSIAN: [
    'Andrei Volkov', 'Sergei Petrov', 'Dmitri Kozlov', 'Nikolai Ivanov', 'Viktor Orlov',
    'Alexei Fedorov', 'Pavel Morozov', 'Ivan Sokolov', 'Oleg Kuznetsov', 'Yuri Popov',
    'Tatiana Novikova', 'Ekaterina Smirnova', 'Anna Lebedeva', 'Marina Zakharova', 'Irina Pavlova',
  ],
  CHINESE: [
    'Li Wei', 'Zhang Yong', 'Wang Jun', 'Chen Ming', 'Liu Yang',
    'Zhao Peng', 'Sun Hao', 'Wu Lei', 'Zhou Jian', 'Xu Lin',
    'Li Mei', 'Zhang Hua', 'Wang Xiu', 'Chen Lan', 'Liu Fang',
  ],
  MIDDLE_EASTERN: [
    'Khalid al-Rashid', 'Omar Haddad', 'Yusuf al-Bakri', 'Hassan Nazari', 'Tariq al-Mansur',
    'Samir Hosseini', 'Reza Karimi', 'Farhad Amiri', 'Nasser al-Fayed', 'Jamal Khoury',
    'Fatima al-Hassan', 'Layla Nazari', 'Aisha Karimi', 'Noor al-Rashid', 'Zahra Hosseini',
  ],
  EUROPEAN: [
    'Jean-Pierre Moreau', 'Hans Becker', 'Marco Rossi', 'Pierre Dubois', 'Karl Fischer',
    'Stefan Müller', 'Luca Conti', 'François Leroy', 'Jan Kowalski', 'Tomás García',
    'Sophie Laurent', 'Maria Schneider', 'Anna Kowalska', 'Elena Vasquez', 'Claire Bernard',
  ],
  LATIN_AMERICAN: [
    'Carlos Mendoza', 'Diego Herrera', 'Miguel Torres', 'Fernando Castillo', 'Alejandro Ríos',
    'Ricardo Fuentes', 'Pablo Guzmán', 'Luis Vargas', 'Andrés Delgado', 'Javier Morales',
    'Isabella Vargas', 'Valentina Cruz', 'Camila Reyes', 'Sofía Herrera', 'Lucia Delgado',
  ],
  SOUTH_ASIAN: [
    'Rajesh Kumar', 'Amir Khan', 'Vikram Singh', 'Arjun Patel', 'Mohammed Aziz',
    'Farhan Ahmed', 'Ravi Sharma', 'Imran Hussain', 'Sanjay Gupta', 'Naveed Malik',
    'Priya Sharma', 'Ayesha Khan', 'Sunita Devi', 'Fatima Begum', 'Meera Patel',
  ],
  EAST_ASIAN: [
    'Takeshi Yamamoto', 'Hiroshi Tanaka', 'Park Joon-ho', 'Kim Sung-min', 'Kenji Watanabe',
    'Lee Dong-wook', 'Sato Haruki', 'Choi Min-jun', 'Tanaka Ryota', 'Kim Tae-hyun',
    'Yuki Nakamura', 'Hana Kim', 'Sakura Yoshida', 'Soo-jin Park', 'Mei Suzuki',
  ],
  AFRICAN: [
    'Ibrahim Diallo', 'Moussa Keita', 'Abdoulaye Traoré', 'Omar Sylla', 'Kwame Asante',
    'Chukwu Okafor', 'Aminu Bello', 'Samuel Osei', 'Jelani Mwangi', 'Tendai Moyo',
    'Amina Diallo', 'Fatou Keita', 'Blessing Okafor', 'Wanjiku Mwangi', 'Adia Traoré',
  ],
  GENERIC: [
    'Daniel Fischer', 'Michael Ross', 'Alexander Novak', 'David Lin', 'Thomas Martin',
    'Robert Chen', 'James Wilson', 'Peter Novak', 'Andrew Blake', 'Mark Sullivan',
    'Sarah Mitchell', 'Elizabeth Harper', 'Catherine Reid', 'Jennifer Walsh', 'Amanda Stone',
  ],
};

// Map countries to name regions
var COUNTRY_TO_NAME_REGION = {
  'Russia': 'RUSSIAN', 'Belarus': 'RUSSIAN', 'Kazakhstan': 'RUSSIAN',
  'China': 'CHINESE', 'Taiwan': 'CHINESE',
  'Iran': 'MIDDLE_EASTERN', 'Iraq': 'MIDDLE_EASTERN', 'Syria': 'MIDDLE_EASTERN',
  'Saudi Arabia': 'MIDDLE_EASTERN', 'Yemen': 'MIDDLE_EASTERN', 'Lebanon': 'MIDDLE_EASTERN',
  'Turkey': 'MIDDLE_EASTERN', 'Egypt': 'MIDDLE_EASTERN', 'Libya': 'MIDDLE_EASTERN',
  'Afghanistan': 'MIDDLE_EASTERN',
  'France': 'EUROPEAN', 'Germany': 'EUROPEAN', 'Italy': 'EUROPEAN', 'Spain': 'EUROPEAN',
  'United Kingdom': 'EUROPEAN', 'Poland': 'EUROPEAN', 'Georgia': 'EUROPEAN', 'Ukraine': 'EUROPEAN',
  'Cuba': 'LATIN_AMERICAN', 'Venezuela': 'LATIN_AMERICAN', 'Brazil': 'LATIN_AMERICAN',
  'Colombia': 'LATIN_AMERICAN', 'Argentina': 'LATIN_AMERICAN', 'Mexico': 'LATIN_AMERICAN',
  'Pakistan': 'SOUTH_ASIAN', 'India': 'SOUTH_ASIAN', 'Bangladesh': 'SOUTH_ASIAN',
  'Japan': 'EAST_ASIAN', 'South Korea': 'EAST_ASIAN', 'North Korea': 'EAST_ASIAN',
  'Nigeria': 'AFRICAN', 'Somalia': 'AFRICAN', 'Kenya': 'AFRICAN', 'Ethiopia': 'AFRICAN',
  'Mali': 'AFRICAN', 'South Africa': 'AFRICAN',
};

function getCoverNameRegion(country) {
  return COUNTRY_TO_NAME_REGION[country] || 'GENERIC';
}

// ===================================================================
//  COVER OCCUPATION POOLS
// ===================================================================

var COVER_OCCUPATIONS = {
  DEEP_COVER: [
    'university professor (international relations)', 'import/export business owner',
    'technology consultant', 'freelance journalist', 'cultural attaché',
    'art dealer and gallery owner', 'real estate developer', 'NGO program director',
    'think tank senior fellow', 'private wealth manager',
    'medical researcher', 'software engineer (defense contractor)',
    'trade representative', 'diplomatic interpreter', 'energy sector consultant',
  ],
  MISSION_SPECIFIC: [
    'visiting researcher', 'business development representative', 'graduate student',
    'logistics coordinator', 'IT contractor', 'sales representative',
    'conference organizer', 'technical translator', 'import agent',
    'hospitality manager', 'tour operator', 'procurement specialist',
  ],
  RECRUITED_AGENT: [
    'janitor at federal building', 'administrative assistant', 'hotel concierge',
    'taxi driver', 'restaurant owner', 'IT helpdesk technician',
    'building maintenance worker', 'delivery driver', 'parking garage attendant',
    'apartment building superintendent', 'dry cleaner operator', 'office temp worker',
  ],
};

// ===================================================================
//  INTEL VALUE POOLS — ILLEGAL AGENT FIELDS
// ===================================================================

var ILLEGAL_INTEL_VALUE_POOLS = {

  AGENT_TIER: {
    DEEP_COVER: [
      'DEEP_COVER|Assessment: subject operates under deep, long-term cover with fully backstopped legend. Tradecraft consistent with a Line S directorate illegal. Has been embedded for an estimated 5-15 years. Extraction protocols in place — this agent will vanish if compromised.',
      'DEEP_COVER|Classification: DEEP COVER ILLEGAL. Subject maintains a fully integrated civilian identity with documented employment, credit history, and social connections spanning multiple years. Cover is operationally mature and professionally maintained.',
      'DEEP_COVER|Vigil analysis: illegals program asset. Subject\'s cover identity has been maintained for an extended period with no observable gaps. Financial footprint, social media presence, and employment history are all consistent and verifiable. Highest-priority target.',
    ],
    MISSION_SPECIFIC: [
      'MISSION_SPECIFIC|Assessment: subject is a mission-specific operative dispatched for a defined collection or action task. Cover identity is functional but not deeply backstopped. Expected operational window: weeks to months.',
      'MISSION_SPECIFIC|Classification: MISSION-SPECIFIC AGENT. Subject entered the area of operations within the past 90 days under a documented but shallow cover identity. Tradecraft is professional but operational security has observable gaps.',
      'MISSION_SPECIFIC|Vigil analysis: tasked operative. Subject was deployed for a specific intelligence objective. Cover is serviceable but would not withstand sustained counterintelligence scrutiny. Moderate extraction risk.',
    ],
    RECRUITED_AGENT: [
      'RECRUITED_AGENT|Assessment: subject is a locally recruited agent — a citizen or resident approached and turned by a foreign intelligence service. Limited tradecraft training. Motivated by ideology, coercion, or financial compensation.',
      'RECRUITED_AGENT|Classification: RECRUITED LOCAL AGENT. Subject is not a professional intelligence officer but a local asset recruited in-place. May have access to sensitive positions or locations. Tradecraft is rudimentary.',
      'RECRUITED_AGENT|Vigil analysis: walk-in or recruited source. Subject was cultivated and recruited by a foreign service operating in the area. Cover identity is the subject\'s own — no legend required. Vulnerability: low operational discipline.',
    ],
  },

  SPONSORING_SERVICE: [
    'SIGINT intercept analysis attributes this operative to {agency} ({agencyCountry}). Communication patterns match known {agencyShort} tradecraft signatures. Confidence: HIGH.',
    'Intelligence community assessment: operative is sponsored by {agency}. Attribution based on encrypted communication protocols consistent with {agencyShort} operational standards.',
    'Vigil pattern analysis indicates {agencyShort} sponsorship. Subject\'s operational tempo, communication schedule, and tradecraft methodology are consistent with known {agency} procedures.',
    'Counterintelligence assessment: this agent is directed by {agency} out of {agencyCountry}. SIGINT correlation with known {agencyShort} communication infrastructure confirms attribution.',
    'Multi-source intelligence fusion points to {agency} as the sponsoring service. Financial flows, travel patterns, and communication intercepts all converge on {agencyShort} operational control.',
  ],

  COVER_IDENTITY: [], // dynamically generated — see generateIllegalIntelValue()

  OPERATIONAL_METHOD: [
    'Subject utilizes dead drop locations for material exchange. Vigil has identified {smallNum} potential dead drop sites within a 10-mile radius. Signal arrangements include chalk marks on specified infrastructure.',
    'Operative conducts brush passes in crowded public spaces — transit hubs, markets, and cultural events. Timing synchronized with handler\'s known patterns. Anti-surveillance routes observed before each exchange.',
    'Subject communicates via encrypted messaging applications with rotating identifiers. Messages are embedded in commercial traffic to evade detection. Burst transmission window: 23:00-02:00 local.',
    'Agent employs covert car meetings along pre-arranged routes. Vehicle counter-surveillance techniques observed: route variation, speed changes, deliberate stops to flush tails. Meeting duration: under 4 minutes.',
    'Subject uses steganographic techniques — intelligence is embedded in digital photographs uploaded to public image-sharing platforms. Extraction requires proprietary software held by the sponsoring service.',
    'Operative maintains a series of safe deposit boxes across {smallNum} financial institutions. Materials are exchanged through a cutout who accesses the boxes on an alternating schedule.',
    'Subject utilizes one-time pad encryption for sensitive communications. Physical pads are concealed in modified personal items. Dead drop replenishment cycle: every 14 days.',
  ],

  HANDLER_CONTACT: [
    'Handler identified by alias "{handlerAlias}." Contact protocol: signal via specific social media post, meeting at pre-arranged site within 48 hours. Emergency contact: pay phone at designated location, 3 rings then hang up.',
    'Handler contact established through a commercial email account. Messages are saved as drafts in a shared account — never sent. Account rotates monthly. Current alias: "{handlerAlias}."',
    'Agent\'s handler operates out of the {agencyCountry} diplomatic mission. Contact arranged through a cultural event invitation system. Handler alias: "{handlerAlias}." Meeting frequency: bi-weekly.',
    'Handler is a declared diplomat with intelligence portfolio, alias "{handlerAlias}." Uses diplomatic pouch for material exchange. Contact is initiated through a phone signal: two calls to a specific number, 30 seconds apart.',
    'Contact protocol utilizes a numbered radio station broadcasting from {agencyCountry}. Agent receives tasking via coded number sequences on a fixed schedule. Handler alias "{handlerAlias}" used in emergency dead drop communications.',
    'Handler operates under commercial cover as a trade representative. Alias: "{handlerAlias}." Contact protocol involves specific seating arrangements at a chain restaurant. Signals embedded in food order.',
  ],

  COMMUNICATION_PROTOCOL: [
    'Primary: encrypted burst transmissions via modified satellite phone. Backup: shortwave radio reception of numbers station "{stationId}." Emergency: pre-positioned dead drop at a public monument.',
    'Communications conducted via a custom-modified encrypted messaging application disguised as a fitness tracker. Messages are routed through servers in {smallNum} jurisdictions to prevent interception.',
    'Agent uses steganographic encoding in images uploaded to public forums. Secondary channel: satellite burst communication with {smallNum}-second transmission windows. Frequency changes follow a pre-arranged schedule.',
    'Dual-channel protocol: routine intelligence via dead drops using concealed USB devices; urgent communications via encrypted satellite burst to a relay station. All traffic is routed through a VPN chain spanning {smallNum} countries.',
    'Communication infrastructure: numbers station broadcast (shortwave, 0300 UTC), encrypted email drops (rotating providers), and physical dead drops for material. Protocols suggest established, mature operation.',
    'Subject employs a layered communication system — covert internet relay for routine traffic, satellite phone for urgent messages, and postal dead drops using invisible ink for material too sensitive for electronic transmission.',
  ],

  TARGET_ASSESSMENT: {
    DEEP_COVER: [
      'Strategic collection mission targeting {targetSector}. Subject has cultivated access to senior officials and policy-level information. Intelligence objectives appear long-term: mapping decision-making processes and identifying potential recruitment targets.',
      'Agent is tasked with long-term penetration of {targetSector}. Has established professional relationships with {smallNum} individuals holding security clearances. Collection priorities include policy documents, personnel information, and technology specifications.',
      'Deep cover mission focused on {targetSector} intelligence collection. Subject has embedded within relevant professional networks and maintains regular contact with cleared personnel. Assessed value to sponsoring service: VERY HIGH.',
    ],
    MISSION_SPECIFIC: [
      'Operative tasked with specific collection objective targeting {targetSector}. Mission parameters suggest a defined timeline and extraction plan. Intelligence sought: technical specifications and personnel identities.',
      'Mission-specific deployment targeting {targetSector}. Subject has approached {smallNum} potential sources within the target organization. Collection focus: near-term operational intelligence and access credentials.',
      'Agent dispatched to acquire specific information related to {targetSector}. Operational window is limited — subject is expected to exfiltrate within 60-90 days of mission completion.',
    ],
    RECRUITED_AGENT: [
      'Recruited agent provides access-based intelligence from their position within {targetSector}. Collection is opportunistic rather than directed — subject photographs documents and reports observations.',
      'Local agent provides low-level but persistent access to {targetSector} facilities. Intelligence value derives from physical proximity rather than tradecraft sophistication.',
      'Recruited source has direct employment access to {targetSector}. Provides facility layouts, personnel schedules, and overheard conversations. Limited ability to collect classified material directly.',
    ],
  },

  NETWORK_MAPPING: [
    'Vigil has identified {smallNum} associated operatives in the subject\'s network. Safe houses located at {smallNum} residential addresses in the metropolitan area. Logistics support provided by a commercial front company.',
    'Network analysis reveals a cell structure with {smallNum} confirmed members. Subject acts as a principal agent with {smallNum} sub-agents providing support. One safe house identified; likely others remain undetected.',
    'Mapping indicates the subject is part of a broader network including a logistics officer, a communications specialist, and {smallNum} access agents. Safe house identified in a residential neighborhood — used for meetings and material storage.',
    'Subject maintains contact with {smallNum} other operatives, at least 2 of whom hold positions in sensitive sectors. Network communications flow through a central node — likely the handler. Support infrastructure includes {smallNum} safe houses and 2 vehicle caches.',
    'Partial network mapping: subject is connected to a handler, a courier, and {smallNum} support assets. One safe house confirmed via surveillance. Financial analysis suggests at least one additional undiscovered support node.',
  ],

  REAL_IDENTITY: [], // dynamically generated — see generateIllegalIntelValue()
};

// ===================================================================
//  TARGET SECTOR POOLS
// ===================================================================

var ILLEGAL_TARGET_SECTORS = [
  'U.S. defense technology programs',
  'the Department of Energy nuclear complex',
  'the intelligence community hiring pipeline',
  'congressional foreign affairs committees',
  'Silicon Valley semiconductor firms',
  'the aerospace and space launch industry',
  'the Federal Reserve and financial policy apparatus',
  'cybersecurity infrastructure and CISA programs',
  'military logistics and force deployment planning',
  'diplomatic cable traffic and State Department communications',
  'the pharmaceutical and biotech research sector',
  'critical infrastructure control systems (SCADA/ICS)',
  'the national laboratory network',
  'military AI and autonomous systems development',
  'undersea cable and telecommunications infrastructure',
];

// ===================================================================
//  HANDLER ALIAS POOLS
// ===================================================================

var HANDLER_ALIASES = [
  'SATURN', 'GRANITE', 'COBBLER', 'LANTERN', 'GARDENER', 'BISHOP',
  'MERCURY', 'IRONWOOD', 'COMPASS', 'FLETCHER', 'TAILOR', 'WARDEN',
  'RAVEN', 'LOCKSMITH', 'PILGRIM', 'ANVIL', 'MASON', 'CEDAR',
  'FALCON', 'SENTINEL', 'MOTH', 'KEYSTONE', 'HARBOR', 'NEEDLE',
  'CROWBAR', 'GLACIER', 'TIMBER', 'OBELISK', 'FOXGLOVE', 'CHAPEL',
];

// ===================================================================
//  NUMBERS STATION IDS
// ===================================================================

var NUMBERS_STATION_IDS = [
  'UVB-76', 'E11a', 'S06s', 'V02a', 'M12a', 'G06',
  'XPB', 'HM01', 'V07', 'E06', 'S11a', 'M23a',
  'E25', 'V13', 'XSL', 'S28', 'M08a', 'G07',
];

// ===================================================================
//  GENERATE ILLEGAL INTEL VALUE
// ===================================================================
// Called by buildIllegalIntelFields() in illegals.js.
// Signature must match the call: (fieldKey, location, orgName, service, tier)

function generateIllegalIntelValue(fieldKey, location, orgName, service, tier, ctx) {
  if (!ctx) ctx = {};
  var agencyCountry = service.country || (service.countries ? service.countries[0] : 'unknown');
  var agencyShort = service.shortLabel || service.id;
  var agencyLabel = service.label || service.id;
  var tierId = tier.id || 'RECRUITED_AGENT';

  // --- AGENT_TIER: tagged value ---
  if (fieldKey === 'AGENT_TIER') {
    var tierPool = ILLEGAL_INTEL_VALUE_POOLS.AGENT_TIER[tierId];
    if (tierPool && tierPool.length > 0) return pick(tierPool);
    return tierId + '|Agent classification pending analysis.';
  }

  // --- SPONSORING_SERVICE ---
  if (fieldKey === 'SPONSORING_SERVICE') {
    var val = pick(ILLEGAL_INTEL_VALUE_POOLS.SPONSORING_SERVICE);
    val = val.replace(/\{agency\}/g, agencyLabel);
    val = val.replace(/\{agencyShort\}/g, agencyShort);
    val = val.replace(/\{agencyCountry\}/g, agencyCountry);
    return val;
  }

  // --- COVER_IDENTITY: dynamically generated ---
  if (fieldKey === 'COVER_IDENTITY') {
    var nameRegion = getCoverNameRegion(agencyCountry);
    var namePool = ILLEGAL_COVER_NAMES[nameRegion] || ILLEGAL_COVER_NAMES.GENERIC;
    var coverName = pick(namePool);
    ctx.coverName = coverName;
    var occPool = COVER_OCCUPATIONS[tierId] || COVER_OCCUPATIONS.RECRUITED_AGENT;
    var occupation = pick(occPool);
    var city = location ? location.city : 'unknown city';
    return coverName + ' — ' + occupation + ' based in ' + city + '. ' +
      'Cover legend assessed as ' + (tierId === 'DEEP_COVER' ? 'fully backstopped and operationally mature' :
      tierId === 'MISSION_SPECIFIC' ? 'functional but shallow — limited backstopping' :
      'minimal — subject\'s own identity with no significant legend') + '.';
  }

  // --- OPERATIONAL_METHOD ---
  if (fieldKey === 'OPERATIONAL_METHOD') {
    var mVal = pick(ILLEGAL_INTEL_VALUE_POOLS.OPERATIONAL_METHOD);
    mVal = mVal.replace(/\{smallNum\}/g, function() { return 2 + Math.floor(Math.random() * 5); });
    return mVal;
  }

  // --- HANDLER_CONTACT ---
  if (fieldKey === 'HANDLER_CONTACT') {
    var hVal = pick(ILLEGAL_INTEL_VALUE_POOLS.HANDLER_CONTACT);
    hVal = hVal.replace(/\{handlerAlias\}/g, pick(HANDLER_ALIASES));
    hVal = hVal.replace(/\{agencyCountry\}/g, agencyCountry);
    return hVal;
  }

  // --- COMMUNICATION_PROTOCOL ---
  if (fieldKey === 'COMMUNICATION_PROTOCOL') {
    var cVal = pick(ILLEGAL_INTEL_VALUE_POOLS.COMMUNICATION_PROTOCOL);
    cVal = cVal.replace(/\{stationId\}/g, pick(NUMBERS_STATION_IDS));
    cVal = cVal.replace(/\{smallNum\}/g, function() { return 2 + Math.floor(Math.random() * 5); });
    return cVal;
  }

  // --- TARGET_ASSESSMENT: tiered ---
  if (fieldKey === 'TARGET_ASSESSMENT') {
    var tPool = ILLEGAL_INTEL_VALUE_POOLS.TARGET_ASSESSMENT[tierId];
    if (!tPool || tPool.length === 0) tPool = ILLEGAL_INTEL_VALUE_POOLS.TARGET_ASSESSMENT.RECRUITED_AGENT;
    var tVal = pick(tPool);
    tVal = tVal.replace(/\{targetSector\}/g, pick(ILLEGAL_TARGET_SECTORS));
    tVal = tVal.replace(/\{smallNum\}/g, function() { return 2 + Math.floor(Math.random() * 5); });
    return tVal;
  }

  // --- NETWORK_MAPPING ---
  if (fieldKey === 'NETWORK_MAPPING') {
    var nVal = pick(ILLEGAL_INTEL_VALUE_POOLS.NETWORK_MAPPING);
    nVal = nVal.replace(/\{smallNum\}/g, function() { return 2 + Math.floor(Math.random() * 5); });
    return nVal;
  }

  // --- REAL_IDENTITY: dynamically generated ---
  if (fieldKey === 'REAL_IDENTITY') {
    var realNameRegion = getCoverNameRegion(agencyCountry);
    var realNamePool = ILLEGAL_COVER_NAMES[realNameRegion] || ILLEGAL_COVER_NAMES.GENERIC;
    var rankPool = [
      'Captain', 'Major', 'Lieutenant Colonel', 'Colonel',
      'Senior Officer', 'First Secretary', 'Operations Officer',
    ];

    if (tierId === 'RECRUITED_AGENT') {
      // Recruited agents use their own identity — real name IS the cover name
      var recruitedName = ctx.coverName || pick(realNamePool);
      return 'True identity confirmed: ' + recruitedName + ' — a ' + agencyCountry + ' national recruited by ' + agencyShort + '. ' +
        'Subject is operating under their own identity with no alias. Limited biographical data available. Cooperating at a minimal level.';
    }

    // DEEP_COVER and MISSION_SPECIFIC: real name differs from cover
    var realName = pick(realNamePool);
    // Avoid collision with cover name
    if (ctx.coverName && realName === ctx.coverName && realNamePool.length > 1) {
      for (var ri = 0; ri < realNamePool.length; ri++) {
        if (realNamePool[ri] !== ctx.coverName) { realName = realNamePool[ri]; break; }
      }
    }
    var rank = pick(rankPool);
    return 'True identity: ' + rank + ' ' + realName + ', ' + agencyLabel + '. ' +
      'Biographical intelligence file being compiled. Fingerprint and biometric data collected upon detention. ' +
      'Cross-referencing with allied counterintelligence databases in progress.';
  }

  return 'Intelligence analysis in progress — data insufficient for assessment.';
}

// ===================================================================
//  AGENCY INTEL VALUE GENERATION
// ===================================================================
// Called when an agency intel field is revealed (massive tick pools).

function generateAgencyIntelValue(fieldKey, agency) {
  var agencyLabel = agency.label || agency.id;
  var agencyShort = agency.shortLabel || agency.id;
  var agencyCountry = agency.country || (agency.countries ? agency.countries[0] : 'unknown');

  // --- STATION_LOCATIONS ---
  if (fieldKey === 'STATION_LOCATIONS') {
    var stationCities = [];
    var allCities = ['Washington D.C.', 'New York', 'London', 'Paris', 'Berlin', 'Vienna', 'Geneva',
      'Istanbul', 'Cairo', 'Dubai', 'Tokyo', 'Singapore', 'Bangkok', 'Nairobi', 'Johannesburg',
      'São Paulo', 'Mexico City', 'Buenos Aires', 'Ottawa', 'Canberra', 'New Delhi', 'Islamabad',
      'Beijing', 'Moscow', 'Ankara', 'Rome', 'Madrid', 'Kyiv', 'Warsaw', 'Seoul', 'Taipei'];

    var count = 3 + Math.floor(Math.random() * 5);
    for (var i = 0; i < count && allCities.length > 0; i++) {
      var idx = Math.floor(Math.random() * allCities.length);
      stationCities.push(allCities.splice(idx, 1)[0]);
    }
    var suspectedCount = 2 + Math.floor(Math.random() * 4);
    return agencyShort + ' maintains confirmed intelligence stations in: ' + stationCities.join(', ') + '. ' +
      'An additional ' + suspectedCount + ' undeclared presences are suspected but unconfirmed. ' +
      'Station complement estimated at 3-12 officers per location depending on operational priority.';
  }

  // --- COMM_PROTOCOLS ---
  if (fieldKey === 'COMM_PROTOCOLS') {
    var protocols = [
      agencyShort + ' employs a layered communication architecture: encrypted satellite burst for priority traffic, ' +
        'diplomatic pouch for physical material, and commercial internet channels with custom steganography for routine reporting. ' +
        'Numbers station ' + pick(NUMBERS_STATION_IDS) + ' is attributed to this service.',
      agencyShort + ' communication infrastructure utilizes military-grade encryption with rotating keys on a 72-hour cycle. ' +
        'Field agents receive tasking via covert internet channels disguised as commercial traffic. ' +
        'Emergency contact protocols include pre-positioned dead drops and shortwave radio fallback.',
      'Assessment: ' + agencyShort + ' communications are among the most sophisticated encountered. Multi-hop VPN chains, ' +
        'encrypted burst transmissions, and physical dead drops with one-time pad overlays. ' +
        'NSA has achieved partial penetration of the routine traffic layer but priority channels remain opaque.',
    ];
    return pick(protocols);
  }

  // --- ACTIVE_OPS (dynamic) ---
  if (fieldKey === 'ACTIVE_OPS') {
    var opTypes = [
      'intelligence collection operation', 'agent recruitment campaign',
      'technical surveillance deployment', 'covert influence operation',
      'technology acquisition program', 'penetration operation against allied intelligence',
      'counterintelligence probe of US assets', 'clandestine logistics network expansion',
    ];
    var regions = ['North America', 'Western Europe', 'the Middle East', 'East Asia', 'South Asia', 'Africa', 'Latin America'];
    var opType = pick(opTypes);
    var region = pick(regions);
    var agentCount = 1 + Math.floor(Math.random() * 4);
    return 'Vigil has detected indicators of an active ' + agencyShort + ' ' + opType + ' in ' + region + '. ' +
      'An estimated ' + agentCount + ' operative(s) involved. Operational posture suggests the mission is in its ' +
      pick(['planning', 'initial deployment', 'active collection', 'exploitation']) + ' phase. ' +
      'Recommend pursuing this lead before the operational window closes.';
  }

  // --- RECRUITMENT_METHODS ---
  if (fieldKey === 'RECRUITMENT_METHODS') {
    var methods = [
      agencyShort + ' employs the classic MICE framework with emphasis on ideology and ego. Talent spotters operate under ' +
        'academic and commercial cover at international conferences. Cultivation period averages 6-18 months before pitch. ' +
        'Rejected approaches rarely reported by targets, giving the service high operational confidence.',
      agencyShort + ' recruitment tradecraft emphasizes financial motivation and coercion. Initial contact frequently made through ' +
        'social media platforms and professional networking sites. Handlers assess targets through a structured vulnerability matrix. ' +
        'Known to exploit personal debt, ideological disillusionment, and compromising personal situations.',
      'Assessment: ' + agencyShort + ' maintains a systematic recruitment pipeline. Talent spotters identify potential sources ' +
        'through open-source intelligence and social engineering. Development officers cultivate relationships through academic exchanges, ' +
        'business partnerships, and cultural programs. Pitch success rate estimated at 15-25% of developed targets.',
    ];
    return pick(methods);
  }

  // --- ACTIVE_AGENTS ---
  if (fieldKey === 'ACTIVE_AGENTS') {
    var baseLow = 5 + Math.floor(Math.random() * 15);
    var baseHigh = baseLow + 5 + Math.floor(Math.random() * 20);
    // Scale by agency size
    if (agency.type === 'NON_STATE') {
      baseLow = Math.max(2, Math.floor(baseLow * 0.3));
      baseHigh = Math.max(baseLow + 3, Math.floor(baseHigh * 0.3));
    }
    return 'Vigil intelligence community estimate: ' + agencyShort + ' maintains approximately ' + baseLow + '-' + baseHigh +
      ' active operatives worldwide, of which an estimated ' + Math.max(1, Math.floor(baseLow * 0.3)) + '-' +
      Math.floor(baseHigh * 0.4) + ' are believed to be operating within or targeting US interests. ' +
      'This estimate carries MODERATE confidence and is derived from defector debriefs, SIGINT analysis, and allied intelligence sharing. ' +
      'Actual numbers may be significantly higher for services with robust illegals programs.';
  }

  // --- STRATEGIC_PRIORITIES ---
  if (fieldKey === 'STRATEGIC_PRIORITIES') {
    var priorities = [
      [
        agencyShort + ' strategic collection priorities (assessed):',
        '1. US military capability development and force posture',
        '2. Advanced technology — AI, quantum computing, semiconductor fabrication',
        '3. Political leadership intentions and policy formation processes',
        '4. Allied intelligence service operations and capabilities',
        '5. Critical infrastructure vulnerabilities and access points',
        '',
        'Priority weighting shifts based on geopolitical developments. Current assessment indicates ' +
          'elevated focus on technology acquisition and political intelligence following recent bilateral tensions.',
      ].join('\n'),
      [
        agencyShort + ' intelligence collection priorities (assessed):',
        '1. Defense technology and military R&D programs',
        '2. Diplomatic communications and negotiating positions',
        '3. Economic policy and sanctions architecture',
        '4. Counterintelligence posture of Western services',
        '5. Energy infrastructure and resource security',
        '',
        'Assessment derived from pattern analysis of known operations, agent tasking recovered from detained operatives, ' +
          'and defector intelligence. Confidence: HIGH for top 3 priorities, MODERATE for priorities 4-5.',
      ].join('\n'),
    ];
    return pick(priorities);
  }

  return 'Agency intelligence analysis in progress.';
}

// ===================================================================
//  FEED DESCRIPTIONS — ILLEGAL AGENT THREATS
// ===================================================================

var ILLEGAL_DOMESTIC_DESCRIPTIONS = [
  'Vigil counterintelligence monitoring has identified a suspected {agency} operative in {city}. Subject is operating under commercial cover within the metropolitan area. Passive surveillance initiated — automated behavioral and communications analysis underway.',
  'ALERT: Vigil domestic surveillance network has flagged a foreign intelligence operative in {city}. Attribution assessment points to {agency}. Subject\'s activities are consistent with espionage tradecraft. Counterintelligence investigation authorized.',
  'Vigil pattern recognition systems have identified anomalous activity in {city} consistent with foreign intelligence operations. Subject designated {orgName}. SIGINT intercepts and behavioral analysis indicate active espionage on US soil.',
  'Counterintelligence tripwire activated: a {agency} operative has been detected in {city} through communications metadata analysis. Subject is engaged in intelligence collection activities targeting sensitive government and commercial sectors.',
  'DOMESTIC CI ALERT: Vigil automated monitoring has flagged an individual in {city} exhibiting espionage indicators. Assessment: foreign intelligence operative linked to {agency}. Continuous monitoring assets deployed. Investigation priority: HIGH.',
];

var ILLEGAL_FOREIGN_DESCRIPTIONS = [
  'Vigil overseas collection has identified a suspected {agency} operative in {city}, {country}. Subject is operating in a third country under documented cover. Counterintelligence implications for allied partnerships in the region.',
  'Intelligence sharing from allied services confirms a {agency} operative is active in {city}, {country}. Subject\'s mission profile suggests intelligence collection targeting US interests in the region.',
  'Vigil SIGINT analysis has detected {agency} operational communications routed through {city}, {country}. A foreign illegal agent is assessed to be operating under cover in the area. Recommend intelligence development for capture or neutralization.',
  'FOREIGN CI ALERT: a {agency} intelligence officer has been identified in {city}, {country}. Operating outside their home country under non-official cover. Activities consistent with espionage targeting US and allied interests in the theater.',
  'Multi-source intelligence indicates a {agency} operative is conducting intelligence operations from {city}, {country}. Subject\'s operational security is professional but not impenetrable. Third-country capture operation may be viable.',
];
