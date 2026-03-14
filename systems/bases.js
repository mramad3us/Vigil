/* ============================================================
   VIGIL — systems/bases.js
   US military/intel bases worldwide. Real locations, real names.
   Assets are stationed at these bases and deploy from them.
   ============================================================ */

var BASES = [
  // --- CONUS ---
  { id: 'FORT_LIBERTY', name: 'Fort Liberty', type: 'MILITARY', city: 'Fayetteville', country: 'United States', lat: 35.14, lon: -79.00, theaterId: 'NORTH_AMERICA' },
  { id: 'DAM_NECK', name: 'Dam Neck Annex', type: 'MILITARY', city: 'Virginia Beach', country: 'United States', lat: 36.80, lon: -75.96, theaterId: 'NORTH_AMERICA' },
  { id: 'NORFOLK', name: 'Naval Station Norfolk', type: 'NAVAL', city: 'Norfolk', country: 'United States', lat: 36.95, lon: -76.33, theaterId: 'NORTH_AMERICA' },
  { id: 'LANGLEY', name: 'CIA Headquarters', type: 'CIA_STATION', city: 'Langley', country: 'United States', lat: 38.95, lon: -77.14, theaterId: 'NORTH_AMERICA' },
  { id: 'PEARL_HARBOR', name: 'Joint Base Pearl Harbor-Hickam', type: 'NAVAL', city: 'Honolulu', country: 'United States', lat: 21.35, lon: -157.95, theaterId: 'NORTH_AMERICA' },
  { id: 'CREECH', name: 'Creech Air Force Base', type: 'AIR', city: 'Indian Springs', country: 'United States', lat: 36.58, lon: -115.67, theaterId: 'NORTH_AMERICA' },
  { id: 'FORT_MEADE', name: 'NSA Headquarters', type: 'DIA_FACILITY', city: 'Fort Meade', country: 'United States', lat: 39.11, lon: -76.77, theaterId: 'NORTH_AMERICA' },
  { id: 'FORT_CAMPBELL', name: 'Fort Campbell', type: 'MILITARY', city: 'Clarksville', country: 'United States', lat: 36.66, lon: -87.47, theaterId: 'NORTH_AMERICA' },
  { id: 'CAMP_LEJEUNE', name: 'Camp Lejeune', type: 'MILITARY', city: 'Jacksonville', country: 'United States', lat: 34.62, lon: -77.36, theaterId: 'NORTH_AMERICA' },
  { id: 'CAMP_PENDLETON', name: 'Camp Pendleton', type: 'MILITARY', city: 'Oceanside', country: 'United States', lat: 33.30, lon: -117.35, theaterId: 'NORTH_AMERICA' },
  { id: 'CORONADO', name: 'Naval Base Coronado', type: 'NAVAL', city: 'San Diego', country: 'United States', lat: 32.68, lon: -117.17, theaterId: 'NORTH_AMERICA' },
  { id: 'SAN_DIEGO', name: 'Naval Base San Diego', type: 'NAVAL', city: 'San Diego', country: 'United States', lat: 32.70, lon: -117.20, theaterId: 'NORTH_AMERICA' },
  { id: 'KINGS_BAY', name: 'Naval Submarine Base Kings Bay', type: 'NAVAL', city: 'Kings Bay', country: 'United States', lat: 30.80, lon: -81.51, theaterId: 'NORTH_AMERICA' },
  { id: 'ELMENDORF', name: 'Joint Base Elmendorf-Richardson', type: 'AIR', city: 'Anchorage', country: 'United States', lat: 61.25, lon: -149.80, theaterId: 'NORTH_AMERICA' },
  { id: 'ELLSWORTH', name: 'Ellsworth Air Force Base', type: 'AIR', city: 'Rapid City', country: 'United States', lat: 44.14, lon: -103.10, theaterId: 'NORTH_AMERICA' },
  { id: 'TRAVIS', name: 'Travis Air Force Base', type: 'AIR', city: 'Fairfield', country: 'United States', lat: 38.26, lon: -121.93, theaterId: 'NORTH_AMERICA' },
  { id: 'CHARLESTON', name: 'Joint Base Charleston', type: 'AIR', city: 'Charleston', country: 'United States', lat: 32.90, lon: -80.04, theaterId: 'NORTH_AMERICA' },
  { id: 'EGLIN', name: 'Eglin Air Force Base', type: 'AIR', city: 'Valparaiso', country: 'United States', lat: 30.47, lon: -86.53, theaterId: 'NORTH_AMERICA' },
  { id: 'MACDILL', name: 'MacDill Air Force Base', type: 'MILITARY', city: 'Tampa', country: 'United States', lat: 27.85, lon: -82.52, theaterId: 'NORTH_AMERICA' },

  // --- EUROPE ---
  { id: 'RAMSTEIN', name: 'Ramstein Air Base', type: 'AIR', city: 'Ramstein', country: 'Germany', lat: 49.44, lon: 7.60, theaterId: 'EUROPE' },
  { id: 'ROTA', name: 'Naval Station Rota', type: 'NAVAL', city: 'Rota', country: 'Spain', lat: 36.64, lon: -6.35, theaterId: 'EUROPE' },
  { id: 'MENWITH_HILL', name: 'RAF Menwith Hill', type: 'DIA_FACILITY', city: 'Harrogate', country: 'United Kingdom', lat: 54.00, lon: -1.69, theaterId: 'EUROPE' },
  { id: 'CIA_LONDON', name: 'CIA London Station', type: 'CIA_STATION', city: 'London', country: 'United Kingdom', lat: 51.50, lon: -0.14, theaterId: 'EUROPE' },
  { id: 'CIA_BERLIN', name: 'CIA Berlin Station', type: 'CIA_STATION', city: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.38, theaterId: 'EUROPE' },
  { id: 'CIA_PARIS', name: 'CIA Paris Station', type: 'CIA_STATION', city: 'Paris', country: 'France', lat: 48.86, lon: 2.35, theaterId: 'EUROPE' },
  { id: 'CIA_ROME', name: 'CIA Rome Station', type: 'CIA_STATION', city: 'Rome', country: 'Italy', lat: 41.90, lon: 12.50, theaterId: 'EUROPE' },
  { id: 'CIA_KYIV', name: 'CIA Kyiv Station', type: 'CIA_STATION', city: 'Kyiv', country: 'Ukraine', lat: 50.45, lon: 30.52, theaterId: 'EUROPE' },
  { id: 'CIA_WARSAW', name: 'CIA Warsaw Station', type: 'CIA_STATION', city: 'Warsaw', country: 'Poland', lat: 52.23, lon: 21.01, theaterId: 'EUROPE' },
  { id: 'CIA_ANKARA', name: 'CIA Ankara Station', type: 'CIA_STATION', city: 'Ankara', country: 'Turkey', lat: 39.93, lon: 32.85, theaterId: 'EUROPE' },
  { id: 'LAKENHEATH', name: 'RAF Lakenheath', type: 'AIR', city: 'Brandon', country: 'United Kingdom', lat: 52.41, lon: 0.56, theaterId: 'EUROPE' },
  { id: 'SIGONELLA', name: 'NAS Sigonella', type: 'NAVAL', city: 'Catania', country: 'Italy', lat: 37.40, lon: 14.92, theaterId: 'EUROPE' },
  { id: 'NAPLES', name: 'Naval Support Activity Naples', type: 'NAVAL', city: 'Naples', country: 'Italy', lat: 40.82, lon: 14.28, theaterId: 'EUROPE' },
  { id: 'GRAFENWOEHR', name: 'Grafenwöhr Training Area', type: 'MILITARY', city: 'Grafenwöhr', country: 'Germany', lat: 49.69, lon: 11.94, theaterId: 'EUROPE' },

  // --- MIDDLE EAST ---
  { id: 'AL_UDEID', name: 'Al Udeid Air Base', type: 'AIR', city: 'Doha', country: 'Qatar', lat: 25.12, lon: 51.31, theaterId: 'MIDDLE_EAST' },
  { id: 'BAHRAIN', name: 'NSA Bahrain', type: 'NAVAL', city: 'Manama', country: 'Bahrain', lat: 26.21, lon: 50.61, theaterId: 'MIDDLE_EAST' },
  { id: 'INCIRLIK', name: 'Incirlik Air Base', type: 'AIR', city: 'Adana', country: 'Turkey', lat: 37.00, lon: 35.43, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_CAIRO', name: 'CIA Cairo Station', type: 'CIA_STATION', city: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.24, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_RIYADH', name: 'CIA Riyadh Station', type: 'CIA_STATION', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lon: 46.68, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_BAGHDAD', name: 'CIA Baghdad Station', type: 'CIA_STATION', city: 'Baghdad', country: 'Iraq', lat: 33.31, lon: 44.37, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_AMMAN', name: 'CIA Amman Station', type: 'CIA_STATION', city: 'Amman', country: 'Jordan', lat: 31.95, lon: 35.93, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_TEL_AVIV', name: 'CIA Tel Aviv Station', type: 'CIA_STATION', city: 'Tel Aviv', country: 'Israel', lat: 32.08, lon: 34.78, theaterId: 'MIDDLE_EAST' },
  { id: 'CIA_BEIRUT', name: 'CIA Beirut Station', type: 'CIA_STATION', city: 'Beirut', country: 'Lebanon', lat: 33.89, lon: 35.50, theaterId: 'MIDDLE_EAST' },
  { id: 'AL_DHAFRA', name: 'Al Dhafra Air Base', type: 'AIR', city: 'Abu Dhabi', country: 'UAE', lat: 24.25, lon: 54.55, theaterId: 'MIDDLE_EAST' },
  { id: 'CAMP_ARIFJAN', name: 'Camp Arifjan', type: 'MILITARY', city: 'Kuwait City', country: 'Kuwait', lat: 29.12, lon: 48.10, theaterId: 'MIDDLE_EAST' },

  // --- EAST ASIA ---
  { id: 'KADENA', name: 'Kadena Air Base', type: 'AIR', city: 'Okinawa', country: 'Japan', lat: 26.35, lon: 127.77, theaterId: 'EAST_ASIA' },
  { id: 'YOKOSUKA', name: 'Fleet Activities Yokosuka', type: 'NAVAL', city: 'Yokosuka', country: 'Japan', lat: 35.29, lon: 139.67, theaterId: 'EAST_ASIA' },
  { id: 'CAMP_HUMPHREYS', name: 'Camp Humphreys', type: 'MILITARY', city: 'Pyeongtaek', country: 'South Korea', lat: 36.96, lon: 127.03, theaterId: 'EAST_ASIA' },
  { id: 'CIA_TOKYO', name: 'CIA Tokyo Station', type: 'CIA_STATION', city: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.75, theaterId: 'EAST_ASIA' },
  { id: 'CIA_SEOUL', name: 'CIA Seoul Station', type: 'CIA_STATION', city: 'Seoul', country: 'South Korea', lat: 37.57, lon: 126.98, theaterId: 'EAST_ASIA' },
  { id: 'CIA_BEIJING', name: 'CIA Beijing Station', type: 'CIA_STATION', city: 'Beijing', country: 'China', lat: 39.90, lon: 116.40, theaterId: 'EAST_ASIA' },
  { id: 'CIA_MANILA', name: 'CIA Manila Station', type: 'CIA_STATION', city: 'Manila', country: 'Philippines', lat: 14.60, lon: 120.98, theaterId: 'EAST_ASIA' },
  { id: 'CIA_TAIPEI', name: 'CIA Taipei Station', type: 'CIA_STATION', city: 'Taipei', country: 'Taiwan', lat: 25.03, lon: 121.57, theaterId: 'EAST_ASIA' },

  // --- SOUTH ASIA ---
  { id: 'CIA_ISLAMABAD', name: 'CIA Islamabad Station', type: 'CIA_STATION', city: 'Islamabad', country: 'Pakistan', lat: 33.69, lon: 73.04, theaterId: 'SOUTH_ASIA' },
  { id: 'CIA_NEW_DELHI', name: 'CIA New Delhi Station', type: 'CIA_STATION', city: 'New Delhi', country: 'India', lat: 28.61, lon: 77.21, theaterId: 'SOUTH_ASIA' },
  { id: 'CIA_KABUL', name: 'CIA Kabul Station', type: 'CIA_STATION', city: 'Kabul', country: 'Afghanistan', lat: 34.53, lon: 69.17, theaterId: 'SOUTH_ASIA' },
  { id: 'DIEGO_GARCIA', name: 'Naval Support Facility Diego Garcia', type: 'NAVAL', city: 'Diego Garcia', country: 'BIOT', lat: -7.32, lon: 72.42, theaterId: 'SOUTH_ASIA' },

  // --- AFRICA ---
  { id: 'CAMP_LEMONNIER', name: 'Camp Lemonnier', type: 'MILITARY', city: 'Djibouti', country: 'Djibouti', lat: 11.55, lon: 43.15, theaterId: 'AFRICA' },
  { id: 'CIA_NAIROBI', name: 'CIA Nairobi Station', type: 'CIA_STATION', city: 'Nairobi', country: 'Kenya', lat: -1.29, lon: 36.82, theaterId: 'AFRICA' },
  { id: 'CIA_LAGOS', name: 'CIA Lagos Station', type: 'CIA_STATION', city: 'Lagos', country: 'Nigeria', lat: 6.52, lon: 3.38, theaterId: 'AFRICA' },
  { id: 'CIA_ADDIS_ABABA', name: 'CIA Addis Ababa Station', type: 'CIA_STATION', city: 'Addis Ababa', country: 'Ethiopia', lat: 9.02, lon: 38.75, theaterId: 'AFRICA' },

  // --- RUSSIA/CIS (nearby forward bases) ---
  // Covered by European bases — no US bases in theater

  // --- LATIN AMERICA ---
  { id: 'GUANTANAMO', name: 'Naval Station Guantanamo Bay', type: 'NAVAL', city: 'Guantanamo Bay', country: 'Cuba', lat: 19.90, lon: -75.10, theaterId: 'LATIN_AMERICA' },
  { id: 'SOTO_CANO', name: 'Soto Cano Air Base', type: 'AIR', city: 'Comayagua', country: 'Honduras', lat: 14.38, lon: -87.62, theaterId: 'LATIN_AMERICA' },
  { id: 'CIA_BOGOTA', name: 'CIA Bogotá Station', type: 'CIA_STATION', city: 'Bogotá', country: 'Colombia', lat: 4.71, lon: -74.07, theaterId: 'LATIN_AMERICA' },
  { id: 'CIA_MEXICO_CITY', name: 'CIA Mexico City Station', type: 'CIA_STATION', city: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13, theaterId: 'LATIN_AMERICA' },

  // --- SIGNALS INTELLIGENCE ---
  { id: 'PINE_GAP', name: 'Pine Gap', type: 'DIA_FACILITY', city: 'Alice Springs', country: 'Australia', lat: -23.80, lon: 133.74, theaterId: 'EAST_ASIA' },
];

// --- Base Type Colors ---

var BASE_TYPES = {
  MILITARY:     { label: 'Military Installation', color: '#4a8fd4', icon: '▣' },
  NAVAL:        { label: 'Naval Facility',        color: '#3d7acc', icon: '◈' },
  AIR:          { label: 'Air Base',              color: '#5a9fe4', icon: '△' },
  CIA_STATION:  { label: 'CIA Station',           color: '#e0a030', icon: '◇' },
  DIA_FACILITY: { label: 'DIA/NSA Facility',      color: '#9060cc', icon: '◆' },
};

// --- Helpers ---

function getBase(id) {
  for (var i = 0; i < BASES.length; i++) {
    if (BASES[i].id === id) return BASES[i];
  }
  return null;
}

function getBasesInTheater(theaterId) {
  var result = [];
  for (var i = 0; i < BASES.length; i++) {
    if (BASES[i].theaterId === theaterId) result.push(BASES[i]);
  }
  return result;
}

function getNearestBase(lat, lon, filterCategory) {
  var best = null;
  var bestDist = Infinity;
  for (var i = 0; i < BASES.length; i++) {
    var b = BASES[i];
    if (filterCategory && !baseMatchesCategory(b, filterCategory)) continue;
    var d = haversineKm(lat, lon, b.lat, b.lon);
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  }
  return best;
}

function getBasesWithCapability(capability) {
  var typeMap = {
    STRIKE: ['AIR', 'MILITARY'],
    SOF: ['MILITARY'],
    NAVAL: ['NAVAL'],
    ISR: ['AIR', 'DIA_FACILITY'],
    INTEL: ['CIA_STATION', 'DIA_FACILITY'],
    CYBER: ['DIA_FACILITY'],
  };
  var types = typeMap[capability] || [];
  var result = [];
  for (var i = 0; i < BASES.length; i++) {
    if (types.indexOf(BASES[i].type) >= 0) result.push(BASES[i]);
  }
  return result;
}

function baseMatchesCategory(base, category) {
  var map = {
    ARMY: ['MILITARY'],
    NAVY: ['NAVAL'],
    AIR: ['AIR'],
    SOF: ['MILITARY'],
    ISR: ['AIR', 'DIA_FACILITY'],
    INTEL: ['CIA_STATION', 'DIA_FACILITY'],
    DIPLOMATIC: ['CIA_STATION'],
    DOMESTIC: ['DOMESTIC_HQ'],
  };
  var types = map[category] || [];
  return types.indexOf(base.type) >= 0;
}

// --- Haversine Distance (km) ---

function haversineKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Great-circle interpolation ---

function interpolateGreatCircle(lat1, lon1, lat2, lon2, fraction) {
  var f = clamp(fraction, 0, 1);
  var toRad = Math.PI / 180;
  var toDeg = 180 / Math.PI;
  var phi1 = lat1 * toRad, lam1 = lon1 * toRad;
  var phi2 = lat2 * toRad, lam2 = lon2 * toRad;
  var d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((phi2 - phi1) / 2), 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin((lam2 - lam1) / 2), 2)
  ));
  if (d < 1e-10) return { lat: lat1, lon: lon1 };
  var A = Math.sin((1 - f) * d) / Math.sin(d);
  var B = Math.sin(f * d) / Math.sin(d);
  var x = A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
  var y = A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
  var z = A * Math.sin(phi1) + B * Math.sin(phi2);
  return {
    lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * toDeg,
    lon: Math.atan2(y, x) * toDeg,
  };
}
