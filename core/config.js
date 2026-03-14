/* ============================================================
   VIGIL — core/config.js
   Game constants: theaters, departments, content pools.
   Year 2052 setting.
   ============================================================ */

// --- Departments ---

var DEPT_CONFIG = [
  {
    id: 'ANALYSIS', name: 'Analysis Division', short: 'ANLYS',
    desc: 'Intelligence analysis and pattern recognition.',
    baseCapacity: 6, maxCapacity: 12,
  },
  {
    id: 'HUMINT', name: 'Human Intelligence', short: 'HUMINT',
    desc: 'Clandestine human source operations.',
    baseCapacity: 4, maxCapacity: 10,
  },
  {
    id: 'SIGINT', name: 'Signals Intelligence', short: 'SIGINT',
    desc: 'Communications interception and cryptanalysis.',
    baseCapacity: 5, maxCapacity: 10,
  },
  {
    id: 'FIELD_OPS', name: 'Field Operations', short: 'FIELD',
    desc: 'Tactical field teams for direct action.',
    baseCapacity: 4, maxCapacity: 8,
  },
  {
    id: 'SPECIAL_OPS', name: 'Special Operations', short: 'SPECOPS',
    desc: 'Elite units for high-risk missions.',
    baseCapacity: 2, maxCapacity: 6,
  },
  {
    id: 'CYBER', name: 'Cyber Operations', short: 'CYBER',
    desc: 'Offensive and defensive cyber warfare.',
    baseCapacity: 4, maxCapacity: 10,
  },
  {
    id: 'SPACE', name: 'Space & Satellite Ops', short: 'SPACE',
    desc: 'Orbital surveillance and space-based assets.',
    baseCapacity: 3, maxCapacity: 8,
  },
];

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

// --- Department Helper ---

function getDeptConfig(id) {
  for (var i = 0; i < DEPT_CONFIG.length; i++) {
    if (DEPT_CONFIG[i].id === id) return DEPT_CONFIG[i];
  }
  return null;
}
