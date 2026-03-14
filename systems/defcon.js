/* ============================================================
   VIGIL — systems/defcon.js
   DEFCON theater system. 5 levels, gameplay effects,
   force migration proposals for DEFCON 2/1.
   ============================================================ */

var DEFCON_LEVELS = {
  5: { label: 'FADE OUT',      color: 'var(--green)',         desc: 'Peacetime readiness.' },
  4: { label: 'DOUBLE TAKE',   color: 'var(--accent)',        desc: 'Enhanced intelligence watch.' },
  3: { label: 'ROUND HOUSE',   color: 'var(--amber)',         desc: 'Covert ops authorized. SOF and intel assets relocate to theater.' },
  2: { label: 'FAST PACE',     color: 'var(--severity-high)', desc: 'Conventional forces routing to theater.' },
  1: { label: 'COCKED PISTOL', color: 'var(--red)',           desc: 'Maximum combat readiness.' },
};

var DEFCON_SPAWN_MOD = { 5: 1.0, 4: 1.0, 3: 1.5, 2: 2.0, 1: 2.5 };

// Theater station points for CSG auto-positioning
var THEATER_STATIONS = {
  MIDDLE_EAST:    { lat: 25.0, lon: 56.0,   name: 'Arabian Sea' },
  EAST_ASIA:      { lat: 30.0, lon: 130.0,  name: 'East China Sea' },
  EUROPE:         { lat: 40.0, lon: 15.0,   name: 'Mediterranean' },
  SOUTH_ASIA:     { lat: 5.0,  lon: 73.0,   name: 'Indian Ocean' },
  AFRICA:         { lat: 0.0,  lon: 45.0,   name: 'Gulf of Aden' },
  LATIN_AMERICA:  { lat: 15.0, lon: -75.0,  name: 'Caribbean Sea' },
  RUSSIA_CIS:     { lat: 60.0, lon: 10.0,   name: 'Norwegian Sea' },
  NORTH_AMERICA:  { lat: 32.0, lon: -65.0,  name: 'Atlantic Seaboard' },
};

// --- Set DEFCON ---

function setDefcon(theaterId, level) {
  if (!V.theaters[theaterId]) return;
  level = clamp(level, 1, 5);

  var prev = V.theaters[theaterId].defcon;
  if (prev === level) return;

  V.theaters[theaterId].defcon = level;
  V.theaters[theaterId].defconHistory.push({
    from: prev,
    to: level,
    day: V.time.day,
    hour: V.time.hour,
  });

  var levelInfo = DEFCON_LEVELS[level];
  var theaterName = THEATERS[theaterId] ? THEATERS[theaterId].name : theaterId;

  addLog('DEFCON: ' + theaterName + ' set to DEFCON ' + level + ' (' + levelInfo.label + ').', 'log-info');

  pushFeedItem({
    id: uid('FI'),
    type: 'DEFCON',
    severity: level <= 2 ? 'CRITICAL' : level <= 3 ? 'HIGH' : 'ELEVATED',
    header: 'DEFCON ' + level + ' — ' + theaterName.toUpperCase(),
    body: 'Theater DEFCON level changed from ' + prev + ' to ' + level + ' (' + levelInfo.label + '). ' + levelInfo.desc,
    timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
    read: false,
  });

  fire('defcon:changed', { theaterId: theaterId, from: prev, to: level });

  // Generate migration proposal
  if (level <= 2) {
    // DEFCON 2/1: full force migration (CSGs + SOF + conventional)
    generateMigrationProposal(theaterId, 'full');
  } else if (level === 3) {
    // DEFCON 3: covert asset relocation (SOF + INTEL only)
    generateMigrationProposal(theaterId, 'covert');
  } else {
    // DEFCON 4/5: clear pending migration
    V.theaters[theaterId].pendingMigration = null;
  }
}

function getDefcon(theaterId) {
  if (!V.theaters[theaterId]) return 5;
  return V.theaters[theaterId].defcon;
}

function getDefconInfo(level) {
  return DEFCON_LEVELS[level] || DEFCON_LEVELS[5];
}

// --- Migration Proposals ---
// scope: 'covert' (DEFCON 3 — SOF + INTEL only) or 'full' (DEFCON 2/1 — CSGs + SOF + conventional)

function generateMigrationProposal(theaterId, scope) {
  var station = THEATER_STATIONS[theaterId];
  if (!station) return;

  var candidates = [];
  var theaterDefcon = V.theaters[theaterId].defcon;
  var isCovert = (scope === 'covert');
  var maxCandidates = isCovert ? 3 : 5;

  // DEFCON 2/1 (full): Find nearest available CSG
  if (!isCovert) {
    var bestCSG = null;
    var bestCSGDist = Infinity;
    for (var i = 0; i < V.assets.length; i++) {
      var a = V.assets[i];
      if (a.isMobileBase && a.status === 'STATIONED') {
        var d = haversineKm(a.currentLat, a.currentLon, station.lat, station.lon);
        if (d < bestCSGDist) {
          bestCSGDist = d;
          bestCSG = a;
        }
      }
    }
    if (bestCSG) {
      var transitMin = calcTransitMinutes(bestCSG, station.lat, station.lon);
      candidates.push({
        id: bestCSG.id,
        name: bestCSG.name,
        category: bestCSG.category,
        fromBase: bestCSG.homeBaseId,
        toStation: station.name,
        transitMinutes: transitMin,
      });
    }
  }

  // Find eligible units from calmer theaters
  // Covert: SOF (COVERT deniability) + INTEL assets
  // Full: SOF units (any deniability)
  var eligibleCategories = isCovert ? ['SOF', 'INTEL'] : ['SOF'];

  for (var ai = 0; ai < V.assets.length; ai++) {
    var asset = V.assets[ai];
    if (asset.status !== 'STATIONED') continue;
    if (asset.isMobileBase) continue;
    if (eligibleCategories.indexOf(asset.category) < 0) continue;
    if (isCovert && asset.deniability !== 'COVERT') continue; // DEFCON 3: covert assets only
    if (candidates.length >= maxCandidates) break;

    // Check if this asset is in a calmer theater
    var assetBase = getBase(asset.currentBaseId || asset.homeBaseId);
    if (!assetBase) continue;
    var assetTheater = null;
    for (var tid in THEATERS) {
      if (THEATERS[tid].countries.indexOf(assetBase.country) >= 0) {
        assetTheater = tid;
        break;
      }
    }
    if (assetTheater === theaterId) continue;
    // Don't pull from theaters that are also escalated
    if (assetTheater && V.theaters[assetTheater] && V.theaters[assetTheater].defcon <= 3) continue;

    // Find a base in the target theater (prefer CIA stations for covert)
    var targetBase = isCovert
      ? findCovertBaseInTheater(theaterId, station.lat, station.lon)
      : findNearestBaseInTheater(theaterId, station.lat, station.lon);
    if (!targetBase) {
      targetBase = findNearestBaseInTheater(theaterId, station.lat, station.lon);
    }
    if (!targetBase) continue;

    var tMin = calcTransitMinutes(asset, targetBase.lat, targetBase.lon);
    candidates.push({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      fromBase: asset.currentBaseId || asset.homeBaseId,
      toBase: targetBase.id,
      toBaseName: targetBase.name,
      transitMinutes: tMin,
    });
  }

  if (candidates.length === 0) return;

  V.theaters[theaterId].pendingMigration = {
    theaterId: theaterId,
    defconLevel: theaterDefcon,
    scope: scope,
    assets: candidates,
    createdAt: V.time.totalMinutes,
  };
}

// Find a CIA station or covert-suitable base in the theater
function findCovertBaseInTheater(theaterId, lat, lon) {
  var theater = THEATERS[theaterId];
  if (!theater || !BASES) return null;

  // Prefer CIA_STATION or SOF base types
  var covertTypes = ['CIA_STATION', 'SOF_BASE', 'DIA_FACILITY'];
  var best = null;
  var bestDist = Infinity;

  for (var i = 0; i < BASES.length; i++) {
    var b = BASES[i];
    if (theater.countries.indexOf(b.country) < 0 && b.theater !== theaterId) continue;
    if (covertTypes.indexOf(b.type) < 0) continue;
    var d = haversineKm(lat, lon, b.lat, b.lon);
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  }
  return best;
}

function findNearestBaseInTheater(theaterId, lat, lon) {
  var theater = THEATERS[theaterId];
  if (!theater || !BASES) return null;

  var best = null;
  var bestDist = Infinity;
  for (var i = 0; i < BASES.length; i++) {
    var b = BASES[i];
    if (theater.countries.indexOf(b.country) >= 0 || b.theater === theaterId) {
      var d = haversineKm(lat, lon, b.lat, b.lon);
      if (d < bestDist) {
        bestDist = d;
        best = b;
      }
    }
  }
  // Fallback: find closest base globally for this theater
  if (!best) {
    var stationPt = THEATER_STATIONS[theaterId];
    if (stationPt) {
      for (var j = 0; j < BASES.length; j++) {
        var bj = BASES[j];
        var dj = haversineKm(stationPt.lat, stationPt.lon, bj.lat, bj.lon);
        if (dj < bestDist) {
          bestDist = dj;
          best = bj;
        }
      }
    }
  }
  return best;
}

// --- Approve / Dismiss Migration ---

function approveMigration(theaterId) {
  var theater = V.theaters[theaterId];
  if (!theater || !theater.pendingMigration) return;

  var migration = theater.pendingMigration;
  var now = V.time.totalMinutes;

  for (var i = 0; i < migration.assets.length; i++) {
    var entry = migration.assets[i];
    var asset = getAsset(entry.id);
    if (!asset || asset.status !== 'STATIONED') continue;

    if (asset.isMobileBase) {
      // CSG repositioning — use maritime path to station point
      var station = THEATER_STATIONS[theaterId];
      if (station) {
        repositionCSG(asset.id, station.lat, station.lon);
      }
    } else if (entry.toBase) {
      // Conventional asset — relocate homeBase and transit
      var targetBase = getBase(entry.toBase);
      if (targetBase) {
        asset.homeBaseId = entry.toBase;
        var transitMin = calcTransitMinutes(asset, targetBase.lat, targetBase.lon);
        asset.status = 'IN_TRANSIT';
        asset.assignedOpId = null;
        asset.currentBaseId = null;
        asset.originLat = asset.currentLat;
        asset.originLon = asset.currentLon;
        asset.destinationLat = targetBase.lat;
        asset.destinationLon = targetBase.lon;
        asset.transitStartTotalMinutes = now;
        asset.transitDurationMinutes = transitMin;
      }
    }

    pushFeedItem({
      id: uid('FI'),
      type: 'DEFCON',
      severity: 'ELEVATED',
      header: 'MIGRATION: ' + asset.name,
      body: asset.name + ' reassigned to ' + (entry.toStation || entry.toBaseName || 'theater station') +
        '. ETA: ' + formatTransitTime(entry.transitMinutes) + '.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
    });
  }

  addLog('DEFCON: Migration approved for ' + (THEATERS[theaterId] ? THEATERS[theaterId].name : theaterId) + '. ' + migration.assets.length + ' asset(s) relocating.', 'log-info');
  theater.pendingMigration = null;
}

function removeMigrationAsset(theaterId, assetId) {
  var theater = V.theaters[theaterId];
  if (!theater || !theater.pendingMigration) return;

  theater.pendingMigration.assets = theater.pendingMigration.assets.filter(function(a) {
    return a.id !== assetId;
  });

  if (theater.pendingMigration.assets.length === 0) {
    theater.pendingMigration = null;
  }
}

function dismissMigration(theaterId) {
  if (V.theaters[theaterId]) {
    V.theaters[theaterId].pendingMigration = null;
  }
}

// --- Global window functions for UI ---

window.setTheaterDefcon = function(theaterId, level) {
  setDefcon(theaterId, level);
};

window.approveMigration = function(theaterId) {
  approveMigration(theaterId);
};

window.removeMigrationAsset = function(theaterId, assetId) {
  removeMigrationAsset(theaterId, assetId);
};

window.dismissMigration = function(theaterId) {
  dismissMigration(theaterId);
};
