/* ============================================================
   VIGIL — systems/pathing.js
   Ocean waypoints for maritime pathing (Dijkstra), warzone
   airspace penalty, country bounding boxes.
   ============================================================ */

// --- Ocean Waypoints ---

var OCEAN_WAYPOINTS = {
  // Atlantic
  NORFOLK_APP:      { id: 'NORFOLK_APP',      lat: 36.5,  lon: -74.0,  connections: ['BERMUDA', 'CARIBBEAN_HUB', 'GUANTANAMO_APP'] },
  BERMUDA:          { id: 'BERMUDA',          lat: 32.3,  lon: -64.8,  connections: ['NORFOLK_APP', 'AZORES', 'CARIBBEAN_HUB'] },
  AZORES:           { id: 'AZORES',           lat: 38.7,  lon: -27.2,  connections: ['BERMUDA', 'GIBRALTAR', 'CAPE_VERDE', 'NORWEGIAN_SEA'] },
  CAPE_VERDE:       { id: 'CAPE_VERDE',       lat: 16.0,  lon: -23.0,  connections: ['AZORES', 'FREETOWN', 'CARIBBEAN_HUB'] },
  FREETOWN:         { id: 'FREETOWN',         lat: 8.0,   lon: -13.0,  connections: ['CAPE_VERDE', 'CAPE_TOWN'] },
  CAPE_TOWN:        { id: 'CAPE_TOWN',        lat: -34.0, lon: 18.5,   connections: ['FREETOWN', 'DIEGO_GARCIA_APP', 'AUSTRALIA_SOUTH'] },

  // Mediterranean
  GIBRALTAR:        { id: 'GIBRALTAR',        lat: 36.0,  lon: -5.5,   connections: ['AZORES', 'SICILY_STRAIT'] },
  SICILY_STRAIT:    { id: 'SICILY_STRAIT',    lat: 37.0,  lon: 12.0,   connections: ['GIBRALTAR', 'CRETE'] },
  CRETE:            { id: 'CRETE',            lat: 35.0,  lon: 25.0,   connections: ['SICILY_STRAIT', 'SUEZ_NORTH'] },
  SUEZ_NORTH:       { id: 'SUEZ_NORTH',       lat: 31.3,  lon: 32.3,   connections: ['CRETE', 'SUEZ_SOUTH'] },

  // Red Sea / Indian Ocean
  SUEZ_SOUTH:       { id: 'SUEZ_SOUTH',       lat: 29.9,  lon: 32.6,   connections: ['SUEZ_NORTH', 'BAB_EL_MANDEB'] },
  BAB_EL_MANDEB:    { id: 'BAB_EL_MANDEB',    lat: 12.5,  lon: 43.5,   connections: ['SUEZ_SOUTH', 'GULF_OF_ADEN'] },
  GULF_OF_ADEN:     { id: 'GULF_OF_ADEN',     lat: 12.0,  lon: 48.0,   connections: ['BAB_EL_MANDEB', 'HORMUZ', 'DIEGO_GARCIA_APP', 'MUMBAI_APP'] },
  DIEGO_GARCIA_APP: { id: 'DIEGO_GARCIA_APP', lat: -7.3,  lon: 72.4,   connections: ['GULF_OF_ADEN', 'MUMBAI_APP', 'MALACCA', 'CAPE_TOWN', 'AUSTRALIA_SOUTH'] },
  MUMBAI_APP:       { id: 'MUMBAI_APP',       lat: 18.0,  lon: 70.0,   connections: ['GULF_OF_ADEN', 'DIEGO_GARCIA_APP', 'MALACCA'] },

  // Persian Gulf
  HORMUZ:           { id: 'HORMUZ',           lat: 26.5,  lon: 56.5,   connections: ['GULF_OF_ADEN', 'BAHRAIN_APP'] },
  BAHRAIN_APP:      { id: 'BAHRAIN_APP',      lat: 26.0,  lon: 50.5,   connections: ['HORMUZ'] },

  // Pacific
  PEARL_APP:        { id: 'PEARL_APP',        lat: 21.0,  lon: -157.0, connections: ['GUAM', 'PANAMA_PAC'] },
  GUAM:             { id: 'GUAM',             lat: 13.5,  lon: 144.8,  connections: ['PEARL_APP', 'YOKOSUKA_APP', 'SOUTH_CHINA_SEA', 'SINGAPORE'] },
  YOKOSUKA_APP:     { id: 'YOKOSUKA_APP',     lat: 35.3,  lon: 139.7,  connections: ['GUAM', 'SEA_OF_JAPAN', 'EAST_CHINA_SEA'] },
  TAIWAN_STRAIT:    { id: 'TAIWAN_STRAIT',    lat: 24.0,  lon: 119.0,  connections: ['EAST_CHINA_SEA', 'SOUTH_CHINA_SEA'] },
  MALACCA:          { id: 'MALACCA',          lat: 2.5,   lon: 101.0,  connections: ['SINGAPORE', 'MUMBAI_APP', 'DIEGO_GARCIA_APP'] },
  SINGAPORE:        { id: 'SINGAPORE',        lat: 1.3,   lon: 104.0,  connections: ['MALACCA', 'SOUTH_CHINA_SEA', 'GUAM', 'AUSTRALIA_SOUTH'] },

  // Americas
  PANAMA_ATL:       { id: 'PANAMA_ATL',       lat: 9.4,   lon: -79.9,  connections: ['CARIBBEAN_HUB', 'PANAMA_PAC'] },
  PANAMA_PAC:       { id: 'PANAMA_PAC',       lat: 8.9,   lon: -79.5,  connections: ['PANAMA_ATL', 'PEARL_APP', 'CAPE_HORN'] },
  CARIBBEAN_HUB:    { id: 'CARIBBEAN_HUB',    lat: 18.0,  lon: -68.0,  connections: ['NORFOLK_APP', 'BERMUDA', 'CAPE_VERDE', 'GUANTANAMO_APP', 'PANAMA_ATL'] },
  GUANTANAMO_APP:   { id: 'GUANTANAMO_APP',   lat: 20.0,  lon: -75.2,  connections: ['NORFOLK_APP', 'CARIBBEAN_HUB'] },

  // Southern
  CAPE_HORN:        { id: 'CAPE_HORN',        lat: -56.0, lon: -67.0,  connections: ['PANAMA_PAC', 'CAPE_TOWN'] },
  AUSTRALIA_SOUTH:  { id: 'AUSTRALIA_SOUTH',  lat: -35.0, lon: 135.0,  connections: ['CAPE_TOWN', 'DIEGO_GARCIA_APP', 'SINGAPORE'] },

  // Arctic / Northern
  NORWEGIAN_SEA:    { id: 'NORWEGIAN_SEA',    lat: 65.0,  lon: 3.0,    connections: ['AZORES', 'BARENTS_APP'] },
  BARENTS_APP:      { id: 'BARENTS_APP',      lat: 72.0,  lon: 33.0,   connections: ['NORWEGIAN_SEA'] },

  // East Asia
  SOUTH_CHINA_SEA:  { id: 'SOUTH_CHINA_SEA',  lat: 12.0,  lon: 114.0,  connections: ['GUAM', 'SINGAPORE', 'TAIWAN_STRAIT'] },
  EAST_CHINA_SEA:   { id: 'EAST_CHINA_SEA',   lat: 30.0,  lon: 126.0,  connections: ['YOKOSUKA_APP', 'TAIWAN_STRAIT', 'SEA_OF_JAPAN'] },
  SEA_OF_JAPAN:     { id: 'SEA_OF_JAPAN',     lat: 40.0,  lon: 134.0,  connections: ['YOKOSUKA_APP', 'EAST_CHINA_SEA'] },
};

// --- Dijkstra Maritime Pathing ---

function findNearestWaypoint(lat, lon) {
  var best = null;
  var bestDist = Infinity;
  for (var wid in OCEAN_WAYPOINTS) {
    var wp = OCEAN_WAYPOINTS[wid];
    var d = haversineKm(lat, lon, wp.lat, wp.lon);
    if (d < bestDist) {
      bestDist = d;
      best = wp;
    }
  }
  return best;
}

function findMaritimePath(fromLat, fromLon, toLat, toLon) {
  var startWP = findNearestWaypoint(fromLat, fromLon);
  var endWP = findNearestWaypoint(toLat, toLon);

  if (!startWP || !endWP) {
    return [{ lat: fromLat, lon: fromLon }, { lat: toLat, lon: toLon }];
  }

  if (startWP.id === endWP.id) {
    return [{ lat: fromLat, lon: fromLon }, { lat: startWP.lat, lon: startWP.lon }, { lat: toLat, lon: toLon }];
  }

  // Dijkstra
  var dist = {};
  var prev = {};
  var visited = {};
  var queue = [];

  for (var wid in OCEAN_WAYPOINTS) {
    dist[wid] = Infinity;
  }
  dist[startWP.id] = 0;
  queue.push(startWP.id);

  while (queue.length > 0) {
    // Find min-distance node
    var minIdx = 0;
    for (var qi = 1; qi < queue.length; qi++) {
      if (dist[queue[qi]] < dist[queue[minIdx]]) minIdx = qi;
    }
    var current = queue.splice(minIdx, 1)[0];

    if (visited[current]) continue;
    visited[current] = true;

    if (current === endWP.id) break;

    var wp = OCEAN_WAYPOINTS[current];
    for (var ci = 0; ci < wp.connections.length; ci++) {
      var neighbor = wp.connections[ci];
      if (visited[neighbor]) continue;

      var nWP = OCEAN_WAYPOINTS[neighbor];
      if (!nWP) continue;

      var edgeDist = haversineKm(wp.lat, wp.lon, nWP.lat, nWP.lon);
      var newDist = dist[current] + edgeDist;

      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = current;
        queue.push(neighbor);
      }
    }
  }

  // Reconstruct path
  var pathIds = [];
  var node = endWP.id;
  while (node) {
    pathIds.unshift(node);
    node = prev[node];
  }

  // Build coordinate chain: origin → waypoints → destination
  var path = [{ lat: fromLat, lon: fromLon }];
  for (var pi = 0; pi < pathIds.length; pi++) {
    var pwp = OCEAN_WAYPOINTS[pathIds[pi]];
    path.push({ lat: pwp.lat, lon: pwp.lon });
  }
  path.push({ lat: toLat, lon: toLon });

  return path;
}

function calcPathDistance(path) {
  var total = 0;
  for (var i = 1; i < path.length; i++) {
    total += haversineKm(path[i - 1].lat, path[i - 1].lon, path[i].lat, path[i].lon);
  }
  return total;
}

function interpolateAlongPath(path, fraction) {
  if (!path || path.length < 2) return { lat: 0, lon: 0 };
  if (fraction <= 0) return { lat: path[0].lat, lon: path[0].lon };
  if (fraction >= 1) return { lat: path[path.length - 1].lat, lon: path[path.length - 1].lon };

  // Calculate total distance and target distance
  var totalDist = calcPathDistance(path);
  var targetDist = totalDist * fraction;

  // Walk segments
  var accumulated = 0;
  for (var i = 1; i < path.length; i++) {
    var segDist = haversineKm(path[i - 1].lat, path[i - 1].lon, path[i].lat, path[i].lon);
    if (accumulated + segDist >= targetDist) {
      // Interpolate within this segment
      var segFraction = (targetDist - accumulated) / segDist;
      return interpolateGreatCircle(
        path[i - 1].lat, path[i - 1].lon,
        path[i].lat, path[i].lon,
        segFraction
      );
    }
    accumulated += segDist;
  }

  return { lat: path[path.length - 1].lat, lon: path[path.length - 1].lon };
}


// --- Country Bounding Boxes (for warzone airspace penalty) ---

var COUNTRY_BOUNDS = {
  // AT_WAR / HOSTILE potential countries
  'North Korea':   { latMin: 37.5, latMax: 43.0, lonMin: 124.0, lonMax: 131.0 },
  'Iran':          { latMin: 25.0, latMax: 40.0, lonMin: 44.0,  lonMax: 63.0 },
  'Russia':        { latMin: 41.0, latMax: 75.0, lonMin: 27.0,  lonMax: 180.0 },
  // TENSE countries
  'Syria':         { latMin: 32.0, latMax: 37.5, lonMin: 35.5,  lonMax: 42.5 },
  'Yemen':         { latMin: 12.0, latMax: 19.0, lonMin: 42.0,  lonMax: 54.0 },
  'Venezuela':     { latMin: 0.5,  latMax: 12.5, lonMin: -73.5, lonMax: -59.5 },
  'Cuba':          { latMin: 19.5, latMax: 23.5, lonMin: -85.0, lonMax: -74.0 },
  'Somalia':       { latMin: -1.5, latMax: 12.0, lonMin: 41.0,  lonMax: 51.5 },
  'Afghanistan':   { latMin: 29.0, latMax: 38.5, lonMin: 60.5,  lonMax: 75.0 },
  'Belarus':       { latMin: 51.0, latMax: 56.5, lonMin: 23.0,  lonMax: 32.5 },
  'China':         { latMin: 18.0, latMax: 53.5, lonMin: 73.5,  lonMax: 135.0 },
  // NEUTRAL
  'Pakistan':      { latMin: 23.5, latMax: 37.0, lonMin: 61.0,  lonMax: 77.5 },
  'Lebanon':       { latMin: 33.0, latMax: 34.7, lonMin: 35.0,  lonMax: 36.7 },
  'Mali':          { latMin: 10.0, latMax: 25.0, lonMin: -12.5, lonMax: 4.5 },
  'Libya':         { latMin: 19.5, latMax: 33.5, lonMin: 9.5,   lonMax: 25.5 },
  // FRIENDLY
  'Iraq':          { latMin: 29.0, latMax: 37.5, lonMin: 38.5,  lonMax: 48.5 },
  'Ukraine':       { latMin: 44.0, latMax: 52.5, lonMin: 22.0,  lonMax: 40.5 },
  // ALLIED
  'Turkey':        { latMin: 36.0, latMax: 42.0, lonMin: 26.0,  lonMax: 44.5 },
  'Saudi Arabia':  { latMin: 16.0, latMax: 32.5, lonMin: 34.5,  lonMax: 55.5 },
  'India':         { latMin: 6.5,  latMax: 35.5, lonMin: 68.0,  lonMax: 97.5 },
  'Egypt':         { latMin: 22.0, latMax: 31.5, lonMin: 25.0,  lonMax: 36.0 },
  'Nigeria':       { latMin: 4.0,  latMax: 14.0, lonMin: 2.5,   lonMax: 14.5 },
  'Brazil':        { latMin: -33.5,latMax: 5.5,  lonMin: -74.0, lonMax: -35.0 },
  'Colombia':      { latMin: -4.5, latMax: 13.5, lonMin: -79.0, lonMax: -67.0 },
  'Mexico':        { latMin: 14.5, latMax: 32.5, lonMin: -117.5,lonMax: -86.5 },
  'Kenya':         { latMin: -4.7, latMax: 5.0,  lonMin: 34.0,  lonMax: 42.0 },
  'Ethiopia':      { latMin: 3.5,  latMax: 14.9, lonMin: 33.0,  lonMax: 48.0 },
  'South Africa':  { latMin: -35.0,latMax: -22.0,lonMin: 16.5,  lonMax: 33.0 },
  'Japan':         { latMin: 24.0, latMax: 45.5, lonMin: 123.0, lonMax: 146.0 },
  'South Korea':   { latMin: 33.0, latMax: 38.5, lonMin: 125.0, lonMax: 130.0 },
  'Taiwan':        { latMin: 21.5, latMax: 25.5, lonMin: 120.0, lonMax: 122.0 },
  'Georgia':       { latMin: 41.0, latMax: 43.5, lonMin: 40.0,  lonMax: 46.5 },
  'Kazakhstan':    { latMin: 40.5, latMax: 55.5, lonMin: 46.5,  lonMax: 87.5 },
  'Bangladesh':    { latMin: 20.5, latMax: 26.5, lonMin: 88.0,  lonMax: 92.5 },
  'Argentina':     { latMin: -55.0,latMax: -21.5,lonMin: -73.5, lonMax: -53.5 },
  'United Kingdom':{ latMin: 49.5, latMax: 61.0, lonMin: -8.5,  lonMax: 2.0 },
  'France':        { latMin: 42.0, latMax: 51.5, lonMin: -5.0,  lonMax: 8.5 },
  'Germany':       { latMin: 47.0, latMax: 55.0, lonMin: 5.5,   lonMax: 15.5 },
  'Poland':        { latMin: 49.0, latMax: 55.0, lonMin: 14.0,  lonMax: 24.5 },
  'Italy':         { latMin: 36.5, latMax: 47.0, lonMin: 6.5,   lonMax: 18.5 },
  'Spain':         { latMin: 36.0, latMax: 43.5, lonMin: -9.5,  lonMax: 4.5 },
  'Israel':        { latMin: 29.5, latMax: 33.5, lonMin: 34.0,  lonMax: 35.9 },
};

// --- Naval Station Point Finder ---
// Finds the best ocean waypoint from which a naval unit can project force
// to a land target within its effective range.

function findNavalStationPoint(fromLat, fromLon, targetLat, targetLon, effectiveRangeKm) {
  // 1. Collect all waypoints within effectiveRangeKm of the target
  var candidates = [];
  for (var wid in OCEAN_WAYPOINTS) {
    var wp = OCEAN_WAYPOINTS[wid];
    var distToTarget = haversineKm(wp.lat, wp.lon, targetLat, targetLon);
    if (distToTarget <= effectiveRangeKm) {
      candidates.push({ wp: wp, distToTarget: distToTarget });
    }
  }

  if (candidates.length === 0) return null; // Target unreachable for this naval unit

  // 2. Find the candidate with the shortest maritime path from the asset
  var best = null;
  var bestPathDist = Infinity;

  for (var i = 0; i < candidates.length; i++) {
    var cand = candidates[i];
    var path = findMaritimePath(fromLat, fromLon, cand.wp.lat, cand.wp.lon);
    var pathDist = calcPathDistance(path);
    if (pathDist < bestPathDist) {
      bestPathDist = pathDist;
      best = {
        lat: cand.wp.lat,
        lon: cand.wp.lon,
        waypointId: cand.wp.id,
        pathDistance: pathDist,
        distToTarget: cand.distToTarget,
        path: path,
      };
    }
  }

  return best;
}

function getCountriesOnRoute(fromLat, fromLon, toLat, toLon) {
  var countries = {};
  var samples = 20;
  for (var i = 0; i <= samples; i++) {
    var frac = i / samples;
    var pt = interpolateGreatCircle(fromLat, fromLon, toLat, toLon, frac);
    for (var country in COUNTRY_BOUNDS) {
      if (countries[country]) continue;
      var b = COUNTRY_BOUNDS[country];
      if (pt.lat >= b.latMin && pt.lat <= b.latMax && pt.lon >= b.lonMin && pt.lon <= b.lonMax) {
        countries[country] = true;
      }
    }
  }
  return Object.keys(countries);
}

function getAtWarCountriesOnRoute(fromLat, fromLon, toLat, toLon) {
  var crossed = getCountriesOnRoute(fromLat, fromLon, toLat, toLon);
  var atWar = [];
  for (var i = 0; i < crossed.length; i++) {
    var cd = V.diplomacy[crossed[i]];
    if (cd && cd.atWar) {
      atWar.push(crossed[i]);
    }
  }
  return atWar;
}
