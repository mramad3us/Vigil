/* ============================================================
   VIGIL — core/config.js
   Game constants: theaters, departments, content pools.
   Year 2052 setting.
   ============================================================ */

// --- Operation Types ---
// Maps event/threat categories to the type of operation Vigil will plan.
// requiredCapabilities: assets MUST have at least one of these.
// preferredCapabilities: assets with these score higher in recommendations.

var OPERATION_TYPES = {
  MILITARY_STRIKE: {
    id: 'MILITARY_STRIKE', label: 'Military Strike', shortLabel: 'MIL STRIKE',
    requiredCapabilities: ['STRIKE'],
    preferredCapabilities: ['STRIKE', 'ISR'],
    execHoursRange: [4, 12],
    baseSuccessRate: 70,
  },
  SOF_RAID: {
    id: 'SOF_RAID', label: 'Special Operations Raid', shortLabel: 'SOF RAID',
    requiredCapabilities: ['SOF'],
    preferredCapabilities: ['SOF', 'ISR', 'INTEL'],
    execHoursRange: [2, 8],
    baseSuccessRate: 65,
  },
  SURVEILLANCE: {
    id: 'SURVEILLANCE', label: 'Surveillance Operation', shortLabel: 'SURV',
    requiredCapabilities: ['ISR'],
    preferredCapabilities: ['ISR', 'SIGINT', 'INTEL'],
    execHoursRange: [6, 24],
    baseSuccessRate: 80,
  },
  NAVAL_INTERDICTION: {
    id: 'NAVAL_INTERDICTION', label: 'Naval Interdiction', shortLabel: 'NAVAL INT',
    requiredCapabilities: ['NAVAL'],
    preferredCapabilities: ['NAVAL', 'ISR', 'STRIKE'],
    execHoursRange: [8, 24],
    baseSuccessRate: 75,
  },
  CYBER_OP: {
    id: 'CYBER_OP', label: 'Cyber Operation', shortLabel: 'CYBER',
    requiredCapabilities: ['CYBER'],
    preferredCapabilities: ['CYBER', 'SIGINT'],
    execHoursRange: [2, 12],
    baseSuccessRate: 70,
  },
  HOSTAGE_RESCUE: {
    id: 'HOSTAGE_RESCUE', label: 'Hostage Rescue', shortLabel: 'HRT',
    requiredCapabilities: ['HOSTAGE_RESCUE'],
    preferredCapabilities: ['HOSTAGE_RESCUE', 'SOF', 'ISR'],
    execHoursRange: [1, 6],
    baseSuccessRate: 55,
  },
  COUNTER_TERROR: {
    id: 'COUNTER_TERROR', label: 'Counter-Terrorism', shortLabel: 'CT',
    requiredCapabilities: ['COUNTER_TERROR'],
    preferredCapabilities: ['COUNTER_TERROR', 'SOF', 'INTEL', 'ISR'],
    execHoursRange: [3, 12],
    baseSuccessRate: 65,
  },
  DIPLOMATIC_RESPONSE: {
    id: 'DIPLOMATIC_RESPONSE', label: 'Diplomatic Response', shortLabel: 'DIPLO',
    requiredCapabilities: ['INTEL'],
    preferredCapabilities: ['INTEL', 'HUMINT'],
    execHoursRange: [4, 16],
    baseSuccessRate: 75,
  },
  INTEL_COLLECTION: {
    id: 'INTEL_COLLECTION', label: 'Intelligence Collection', shortLabel: 'INT COL',
    requiredCapabilities: ['INTEL'],
    preferredCapabilities: ['INTEL', 'HUMINT', 'SIGINT', 'ISR'],
    execHoursRange: [6, 24],
    baseSuccessRate: 80,
  },
  DRONE_STRIKE: {
    id: 'DRONE_STRIKE', label: 'Drone Strike', shortLabel: 'UAS STRIKE',
    requiredCapabilities: ['ISR', 'STRIKE'],
    preferredCapabilities: ['ISR', 'STRIKE'],
    execHoursRange: [1, 4],
    baseSuccessRate: 85,
  },
};

// --- Intel Difficulty Tiers ---
// ticksRange: game-minutes of passive collection needed to reveal.
// preRevealChance: probability the field starts already revealed at threat spawn.

var INTEL_DIFFICULTY = {
  EASY:      { ticksRange: [10, 40],   label: 'EASY',      preRevealChance: 0.6 },
  MEDIUM:    { ticksRange: [60, 180],  label: 'MEDIUM',    preRevealChance: 0.15 },
  HARD:      { ticksRange: [240, 480], label: 'HARD',      preRevealChance: 0.02 },
  VERY_HARD: { ticksRange: [480, 960], label: 'VERY HARD', preRevealChance: 0.0 },
};

// --- Threat Intel Fields ---
// Per threat type: what intel Vigil tries to collect. Each field has a difficulty
// that determines how many game-minutes of collection are needed to reveal it.

var THREAT_INTEL_FIELDS = {
  TERROR_CELL: [
    { key: 'CELL_LOCATION',     label: 'Cell Location',                 difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'CELL_STRUCTURE',    label: 'Cell Structure',                difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MEMBER_COUNT',      label: 'Member Count',                  difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'ATTACK_PLANNING',   label: 'Attack Planning Intel',         difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'WEAPONS_CACHE',     label: 'Weapons Cache Location',        difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'SUPPORT_NETWORK',   label: 'Support & Financing Network',   difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',    label: 'Internal Communications',       difficulty: 'VERY_HARD', source: 'SIGINT' },
    { key: 'TARGET_INTENT',     label: 'Target & Intent Assessment',    difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  STATE_ACTOR: [
    { key: 'ACTOR_ID',          label: 'State Actor Identification',    difficulty: 'EASY',      source: 'OSINT' },
    { key: 'FORCE_DISPOSITION', label: 'Force Disposition',             difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'COMMS_PATTERN',     label: 'Communications Pattern',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'AIR_DEFENSE_POSTURE', label: 'Air Defense Posture',         difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'MOVEMENT_PATTERNS', label: 'Military Movement Patterns',    difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'COMMAND_STRUCTURE', label: 'Command Authority Structure',   difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'STRATEGIC_INTENT',  label: 'Strategic Intent',              difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'ESCALATION_POSTURE', label: 'Escalation Posture',          difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CYBER_GROUP: [
    { key: 'NETWORK_TOPOLOGY',  label: 'Network Topology',             difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'ATTRIBUTION_CONF',  label: 'Attribution Confidence',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'VULNERABILITY_SCAN', label: 'Vulnerability Assessment',     difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'ACCESS_VECTORS',    label: 'Access Vectors',                difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'COUNTER_INTRUSION', label: 'Counter-Intrusion Risk',        difficulty: 'HARD',      source: 'CYBER' },
    { key: 'TARGET_INTENT',     label: 'Target & Intent',               difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',    label: 'Operator Communications',       difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CRIMINAL_ORG: [
    { key: 'ORG_LOCATION',      label: 'Organization Location',         difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'VESSEL_IDENTIFICATION', label: 'Transport Identification',  difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'CARGO_MANIFEST',    label: 'Cargo/Shipment Intel',          difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'ROUTE_PREDICTION',  label: 'Route Prediction',              difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'NETWORK_MAPPING',   label: 'Criminal Network Map',          difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'FINANCIAL_FLOWS',   label: 'Financial Flow Analysis',       difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  INSURGENCY: [
    { key: 'AREA_OF_INTEREST',  label: 'Area of Operations',            difficulty: 'EASY',      source: 'ISR' },
    { key: 'GUARD_FORCE',       label: 'Force Estimate',                difficulty: 'EASY',      source: 'ISR' },
    { key: 'ACTIVITY_BASELINE', label: 'Activity Baseline',             difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'WEAPONS_CACHE',     label: 'Weapons Cache Location',        difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'INGRESS_ROUTES',    label: 'Supply Routes',                 difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'QRF_PROXIMITY',     label: 'QRF / Reinforcement Proximity', difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'TARGET_INTENT',     label: 'Strategic Intent',              difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  PROLIFERATOR: [
    { key: 'FACILITY_ID',       label: 'Facility Identification',       difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'TARGET_HARDENING',  label: 'Facility Hardening',            difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'ACTIVITY_BASELINE', label: 'Activity Baseline',             difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'CARGO_MANIFEST',    label: 'Materials Shipment Intel',      difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'CIVILIAN_PROXIMITY', label: 'Civilian Proximity',           difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'NETWORK_MAPPING',   label: 'Procurement Network',           difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'COMMAND_STRUCTURE', label: 'Program Authority',             difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'ESCALATION_POSTURE', label: 'Weaponization Timeline',      difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
};

// --- Threat Expiration Ranges (game-minutes) ---
// Higher threat level = shorter window before the threat manifests.

var THREAT_EXPIRATION = {
  1: [525600, 1051200],  // 1-2 years (365-730 days)
  2: [129600, 525600],   // 3 months - 1 year
  3: [43200, 172800],    // 1-4 months
  4: [10080, 43200],     // 1 week - 1 month
  5: [4320, 14400],      // 3-10 days
};

// --- Collection Source Types ---
// Intel fields have a 'source' property (HUMINT, SIGINT, IMAGERY, ISR, CYBER, OSINT).
// Each asset has a collectionProfile mapping source types → effectiveness multiplier.
// If an asset has no rating for a source type, it contributes NOTHING to that field
// beyond passive collection. This means deploying a Reaper for a HUMINT field is
// flagged as ineffective — it won't advance that field any faster.
//
// Effectiveness scale: 0 = no capability, 1 = marginal, 2-3 = decent, 4-5 = excellent.
// Profiles are defined on each asset template in assets.js.

// --- Theaters ---

var THEATERS = {
  NORTH_AMERICA: {
    id: 'NORTH_AMERICA', name: 'North America', shortName: 'N.AMERICA',
    baseRisk: 1, volatility: 0.15,
    color: '#4a90d9',
    countries: ['United States', 'Canada', 'Mexico'],
    cities: [
      { city: 'Washington D.C.', country: 'United States', lat: 38.89, lon: -77.03 },
      { city: 'New York', country: 'United States', lat: 40.71, lon: -74.00 },
      { city: 'Los Angeles', country: 'United States', lat: 34.05, lon: -118.24 },
      { city: 'Chicago', country: 'United States', lat: 41.87, lon: -87.62 },
      { city: 'Houston', country: 'United States', lat: 29.76, lon: -95.37 },
      { city: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
      { city: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13 },
    ],
  },
  EUROPE: {
    id: 'EUROPE', name: 'Europe', shortName: 'EUROPE',
    baseRisk: 2, volatility: 0.3,
    color: '#6a8fd4',
    countries: ['United Kingdom', 'France', 'Germany', 'Poland', 'Italy', 'Spain', 'Ukraine'],
    cities: [
      { city: 'London', country: 'United Kingdom', lat: 51.50, lon: -0.12 },
      { city: 'Paris', country: 'France', lat: 48.85, lon: 2.35 },
      { city: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.40 },
      { city: 'Warsaw', country: 'Poland', lat: 52.22, lon: 21.01 },
      { city: 'Rome', country: 'Italy', lat: 41.90, lon: 12.49 },
      { city: 'Kyiv', country: 'Ukraine', lat: 50.45, lon: 30.52 },
      { city: 'Madrid', country: 'Spain', lat: 40.41, lon: -3.70 },
    ],
  },
  MIDDLE_EAST: {
    id: 'MIDDLE_EAST', name: 'Middle East', shortName: 'MIDEAST',
    baseRisk: 4, volatility: 0.55,
    color: '#e0a030',
    countries: ['Iran', 'Iraq', 'Syria', 'Saudi Arabia', 'Israel', 'Turkey', 'Yemen', 'Lebanon'],
    cities: [
      { city: 'Tehran', country: 'Iran', lat: 35.69, lon: 51.38 },
      { city: 'Baghdad', country: 'Iraq', lat: 33.31, lon: 44.36 },
      { city: 'Damascus', country: 'Syria', lat: 33.51, lon: 36.29 },
      { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lon: 46.67 },
      { city: 'Tel Aviv', country: 'Israel', lat: 32.08, lon: 34.78 },
      { city: 'Ankara', country: 'Turkey', lat: 39.93, lon: 32.85 },
      { city: 'Sana\'a', country: 'Yemen', lat: 15.35, lon: 44.20 },
      { city: 'Beirut', country: 'Lebanon', lat: 33.89, lon: 35.50 },
    ],
  },
  EAST_ASIA: {
    id: 'EAST_ASIA', name: 'East Asia', shortName: 'E.ASIA',
    baseRisk: 3, volatility: 0.4,
    color: '#e07030',
    countries: ['China', 'North Korea', 'South Korea', 'Japan', 'Taiwan'],
    cities: [
      { city: 'Beijing', country: 'China', lat: 39.90, lon: 116.40 },
      { city: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47 },
      { city: 'Pyongyang', country: 'North Korea', lat: 39.03, lon: 125.75 },
      { city: 'Seoul', country: 'South Korea', lat: 37.56, lon: 126.97 },
      { city: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69 },
      { city: 'Taipei', country: 'Taiwan', lat: 25.03, lon: 121.56 },
    ],
  },
  SOUTH_ASIA: {
    id: 'SOUTH_ASIA', name: 'South Asia', shortName: 'S.ASIA',
    baseRisk: 3, volatility: 0.45,
    color: '#cc6040',
    countries: ['Pakistan', 'India', 'Afghanistan', 'Bangladesh'],
    cities: [
      { city: 'Islamabad', country: 'Pakistan', lat: 33.69, lon: 73.03 },
      { city: 'Kabul', country: 'Afghanistan', lat: 34.52, lon: 69.17 },
      { city: 'New Delhi', country: 'India', lat: 28.61, lon: 77.20 },
      { city: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87 },
      { city: 'Dhaka', country: 'Bangladesh', lat: 23.81, lon: 90.41 },
    ],
  },
  AFRICA: {
    id: 'AFRICA', name: 'Africa', shortName: 'AFRICA',
    baseRisk: 3, volatility: 0.5,
    color: '#9060cc',
    countries: ['Nigeria', 'Somalia', 'Libya', 'Mali', 'Kenya', 'Ethiopia', 'South Africa', 'Egypt'],
    cities: [
      { city: 'Lagos', country: 'Nigeria', lat: 6.52, lon: 3.37 },
      { city: 'Mogadishu', country: 'Somalia', lat: 2.04, lon: 45.34 },
      { city: 'Tripoli', country: 'Libya', lat: 32.89, lon: 13.18 },
      { city: 'Bamako', country: 'Mali', lat: 12.63, lon: -8.00 },
      { city: 'Nairobi', country: 'Kenya', lat: -1.28, lon: 36.81 },
      { city: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.23 },
    ],
  },
  RUSSIA_CIS: {
    id: 'RUSSIA_CIS', name: 'Russia & CIS', shortName: 'RUSSIA',
    baseRisk: 3, volatility: 0.35,
    color: '#cc4040',
    countries: ['Russia', 'Belarus', 'Kazakhstan', 'Georgia'],
    cities: [
      { city: 'Moscow', country: 'Russia', lat: 55.75, lon: 37.61 },
      { city: 'St. Petersburg', country: 'Russia', lat: 59.93, lon: 30.31 },
      { city: 'Minsk', country: 'Belarus', lat: 53.90, lon: 27.55 },
      { city: 'Tbilisi', country: 'Georgia', lat: 41.71, lon: 44.78 },
      { city: 'Astana', country: 'Kazakhstan', lat: 51.16, lon: 71.42 },
    ],
  },
  LATIN_AMERICA: {
    id: 'LATIN_AMERICA', name: 'Latin America', shortName: 'LATAM',
    baseRisk: 2, volatility: 0.3,
    color: '#40a060',
    countries: ['Brazil', 'Colombia', 'Venezuela', 'Argentina', 'Cuba'],
    cities: [
      { city: 'Bogotá', country: 'Colombia', lat: 4.71, lon: -74.07 },
      { city: 'Caracas', country: 'Venezuela', lat: 10.48, lon: -66.90 },
      { city: 'São Paulo', country: 'Brazil', lat: -23.55, lon: -46.63 },
      { city: 'Buenos Aires', country: 'Argentina', lat: -34.60, lon: -58.38 },
      { city: 'Havana', country: 'Cuba', lat: 23.11, lon: -82.36 },
    ],
  },
};

// --- Codename Pools ---

var CODENAME_ADJ = [
  'IRON', 'SHADOW', 'CRIMSON', 'SILENT', 'BROKEN', 'FROZEN', 'DARK', 'STEEL',
  'FALLEN', 'BURNING', 'GOLDEN', 'SILVER', 'HOLLOW', 'BLIND', 'SAVAGE', 'GHOST',
  'AMBER', 'COBALT', 'IVORY', 'ONYX', 'SCARLET', 'OBSIDIAN', 'GRANITE', 'MERCURY',
  'VELVET', 'ARCTIC', 'SOLAR', 'LUNAR', 'STORM', 'EMBER', 'ASHEN', 'RAVEN',
  'JADE', 'COPPER', 'SAPPHIRE', 'CHROME', 'PHANTOM', 'RAPID', 'DEEP', 'FINAL',
  'SHARP', 'BLACK', 'WHITE', 'STARK', 'COLD', 'DIRE', 'GRIM', 'BLEAK',
  'NIGHT', 'DAWN', 'DUSK', 'PALE', 'RED', 'BLUE', 'GREY', 'RUST',
  'ACID', 'NEON', 'ZERO', 'PRIME', 'DUAL', 'FIRST', 'LAST', 'CORE',
  'OUTER', 'INNER', 'UPPER', 'LOWER', 'NORTH', 'SOUTH', 'EAST', 'WEST',
  'HIDDEN', 'OPEN', 'SEALED', 'LOST', 'WILD', 'THORN', 'STONE', 'GLASS',
  'TITAN', 'OMEGA', 'DELTA', 'SIGMA', 'GAMMA', 'ALPHA', 'BETA', 'APEX',
  'HYPER', 'ULTRA', 'NOVA', 'VOID', 'PULSE', 'FLUX', 'DRIFT', 'SURGE',
];

var CODENAME_NOUN = [
  'SPEAR', 'SHIELD', 'HAMMER', 'LANCE', 'ARROW', 'BLADE', 'DAGGER', 'SWORD',
  'EAGLE', 'HAWK', 'FALCON', 'WOLF', 'BEAR', 'LION', 'TIGER', 'VIPER',
  'THUNDER', 'LIGHTNING', 'TEMPEST', 'MONSOON', 'TYPHOON', 'BLIZZARD', 'CYCLONE', 'TORNADO',
  'SENTINEL', 'GUARDIAN', 'WARDEN', 'BASTION', 'FORTRESS', 'CITADEL', 'TOWER', 'RAMPART',
  'HORIZON', 'MERIDIAN', 'ZENITH', 'APEX', 'SUMMIT', 'RIDGE', 'VALLEY', 'CANYON',
  'ORACLE', 'SPHINX', 'PHOENIX', 'HYDRA', 'CHIMERA', 'GRYPHON', 'TITAN', 'ATLAS',
  'TRIDENT', 'HARPOON', 'JAVELIN', 'SABRE', 'RAPIER', 'CLAYMORE', 'PIKE', 'MACE',
  'CONDOR', 'OSPREY', 'RAVEN', 'COBRA', 'PYTHON', 'SCORPION', 'MANTIS', 'HORNET',
  'GLACIER', 'VOLCANO', 'TUNDRA', 'DESERT', 'REEF', 'CASCADE', 'DELTA', 'FJORD',
  'PRISM', 'NEXUS', 'HELIX', 'VERTEX', 'MATRIX', 'CIPHER', 'VECTOR', 'SPECTRUM',
];

var ORG_NAME_ADJ = [
  'Iron', 'Shadow', 'Crimson', 'Silent', 'Sacred', 'Golden', 'Black',
  'Burning', 'Fallen', 'Hidden', 'Eternal', 'True', 'Pure', 'Holy',
  'Red', 'White', 'Dark', 'Free', 'New', 'Last', 'First',
  'Divine', 'Righteous', 'Sovereign', 'United', 'People\'s', 'National',
  'Revolutionary', 'Liberation', 'Patriotic', 'Glorious', 'Awakened',
];

var ORG_NAME_NOUN = [
  'Dawn', 'Path', 'Sword', 'Shield', 'Hand', 'Eye', 'Voice',
  'Brigade', 'Front', 'Legion', 'Army', 'Guard', 'Militia', 'Force',
  'Brotherhood', 'Covenant', 'Order', 'Pact', 'Alliance', 'Council',
  'Resistance', 'Movement', 'Vanguard', 'Mandate', 'Directive',
  'Flame', 'Storm', 'Thunder', 'Hammer', 'Crescent', 'Cross', 'Star',
];

var PERSONNEL_ALIASES = [
  'CARDINAL', 'TOPAZ', 'GRANITE', 'ONYX', 'MERCURY', 'OBSIDIAN', 'OPAL',
  'JASPER', 'COBALT', 'AMBER', 'GARNET', 'IVORY', 'BASALT', 'QUARTZ',
  'FLINT', 'SLATE', 'MARBLE', 'CORAL', 'PEARL', 'RUBY', 'IRON',
  'COPPER', 'BRONZE', 'SILVER', 'PLATINUM', 'TITANIUM', 'TUNGSTEN',
  'CEDAR', 'OAK', 'BIRCH', 'PINE', 'MAPLE', 'ASH', 'WILLOW', 'ELM',
  'HAWK', 'FALCON', 'EAGLE', 'OSPREY', 'CONDOR', 'RAVEN', 'SPARROW',
  'WOLF', 'BEAR', 'FOX', 'LYNX', 'PANTHER', 'COBRA', 'VIPER', 'MANTIS',
];

// --- Theater Helper ---

function getTheater(id) {
  return THEATERS[id] || null;
}

function getRandomTheater() {
  var keys = Object.keys(THEATERS);
  return THEATERS[pick(keys)];
}

function getTheaterCity(theaterId) {
  var t = THEATERS[theaterId];
  if (!t || !t.cities.length) return null;
  return pick(t.cities);
}

function getAllCities() {
  var all = [];
  for (var tid in THEATERS) {
    all = all.concat(THEATERS[tid].cities);
  }
  return all;
}

// --- Operation Type Helper ---

function getOperationType(id) {
  return OPERATION_TYPES[id] || null;
}

// --- Event Category → Operation Type Mapping ---

var EVENT_TO_OP_TYPE = {
  SECURITY: 'COUNTER_TERROR',
  CYBER: 'CYBER_OP',
  MILITARY: 'MILITARY_STRIKE',
  INTELLIGENCE: 'INTEL_COLLECTION',
  DIPLOMATIC: 'DIPLOMATIC_RESPONSE',
  WMD: 'SURVEILLANCE',
  CRIME: 'NAVAL_INTERDICTION',
  SPACE: 'SURVEILLANCE',
  HUMANITARIAN: 'DIPLOMATIC_RESPONSE',
  DOMESTIC: 'SURVEILLANCE',
};
