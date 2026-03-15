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

  // Find all destination bases in the target theater
  var destBases = findAllBasesInTheater(theaterId, isCovert);
  if (destBases.length === 0 && !isCovert) return;

  // DEFCON 2/1 (full): Find ALL available CSGs, sorted by distance
  if (!isCovert) {
    var csgs = [];
    for (var i = 0; i < V.assets.length; i++) {
      var a = V.assets[i];
      if (a.isMobileBase && a.status === 'STATIONED') {
        csgs.push({
          asset: a,
          dist: haversineKm(a.currentLat, a.currentLon, station.lat, station.lon),
        });
      }
    }
    csgs.sort(function(x, y) { return x.dist - y.dist; });

    for (var ci = 0; ci < csgs.length; ci++) {
      var csg = csgs[ci].asset;
      var csgBase = getBase(csg.homeBaseId);
      var csgTheater = getAssetTheaterId(csg);
      candidates.push({
        id: csg.id,
        name: csg.name,
        category: csg.category,
        fromBase: csg.homeBaseId,
        fromBaseName: csgBase ? csgBase.name : '—',
        fromTheater: csgTheater,
        fromTheaterName: THEATERS[csgTheater] ? THEATERS[csgTheater].shortName : '—',
        toStation: station.name,
        destinations: [{ id: '__STATION__', name: station.name, transitMinutes: calcTransitMinutes(csg, station.lat, station.lon) }],
        selectedDestIdx: 0,
        transitMinutes: calcTransitMinutes(csg, station.lat, station.lon),
        selected: ci === 0, // Pre-select nearest CSG
        isCSG: true,
      });
    }
  }

  // Find eligible units from calmer theaters
  // Covert: SOF (COVERT deniability) + INTEL assets
  // Full: SOF + AIR + GROUND + NAVY units (non-mobile)
  var eligibleCategories = isCovert ? ['SOF', 'INTEL'] : ['SOF', 'AIR', 'NAVY', 'ISR'];

  for (var ai = 0; ai < V.assets.length; ai++) {
    var asset = V.assets[ai];
    if (asset.status !== 'STATIONED') continue;
    if (asset.isMobileBase) continue;
    if (eligibleCategories.indexOf(asset.category) < 0) continue;
    if (isCovert && asset.deniability !== 'COVERT') continue;

    // Check if this asset is in a calmer theater
    var assetBaseId = asset.currentBaseId || asset.homeBaseId;
    var assetBase = getBase(assetBaseId);
    if (!assetBase) continue;
    var assetTheater = getAssetTheaterId(asset);
    if (assetTheater === theaterId) continue;
    // Don't pull from theaters that are also escalated
    if (assetTheater && V.theaters[assetTheater] && V.theaters[assetTheater].defcon <= 3) continue;

    // Build destination options for this asset
    var dests = [];
    for (var di = 0; di < destBases.length; di++) {
      var db = destBases[di];
      dests.push({
        id: db.id,
        name: db.name,
        type: db.type,
        transitMinutes: calcTransitMinutes(asset, db.lat, db.lon),
      });
    }
    if (dests.length === 0) continue;

    // Sort destinations: prefer matching base types, then by transit time
    var assetCat = asset.category;
    dests.sort(function(x, y) {
      var xMatch = baseMatchesCategoryForSort(x.type, assetCat) ? 0 : 1;
      var yMatch = baseMatchesCategoryForSort(y.type, assetCat) ? 0 : 1;
      if (xMatch !== yMatch) return xMatch - yMatch;
      return x.transitMinutes - y.transitMinutes;
    });

    var bestDest = dests[0];
    candidates.push({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      deniability: asset.deniability,
      fromBase: assetBaseId,
      fromBaseName: assetBase.name,
      fromTheater: assetTheater,
      fromTheaterName: THEATERS[assetTheater] ? THEATERS[assetTheater].shortName : '—',
      destinations: dests,
      selectedDestIdx: 0,
      toBase: bestDest.id,
      toBaseName: bestDest.name,
      transitMinutes: bestDest.transitMinutes,
      selected: false, // Not pre-selected — operator picks
      isCSG: false,
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

// Find all bases in a theater, optionally filtered for covert suitability
function findAllBasesInTheater(theaterId, covertOnly) {
  var theater = THEATERS[theaterId];
  if (!theater || !BASES) return [];
  var covertTypes = ['CIA_STATION', 'SOF_BASE', 'DIA_FACILITY'];
  var result = [];
  for (var i = 0; i < BASES.length; i++) {
    var b = BASES[i];
    if (theater.countries.indexOf(b.country) < 0 && b.theaterId !== theaterId) continue;
    if (covertOnly && covertTypes.indexOf(b.type) < 0) continue;
    result.push(b);
  }
  return result;
}

// Get the theater ID for an asset based on its current/home base
function getAssetTheaterId(asset) {
  var base = getBase(asset.currentBaseId || asset.homeBaseId);
  if (!base) return null;
  // First check explicit theaterId on base
  if (base.theaterId) return base.theaterId;
  // Fall back to country matching
  for (var tid in THEATERS) {
    if (THEATERS[tid].countries.indexOf(base.country) >= 0) return tid;
  }
  return null;
}

// Check if a base type is a natural fit for an asset category (for sorting)
function baseMatchesCategoryForSort(baseType, assetCategory) {
  if (assetCategory === 'SOF') return baseType === 'MILITARY';
  if (assetCategory === 'NAVY') return baseType === 'NAVAL';
  if (assetCategory === 'AIR') return baseType === 'AIR';
  if (assetCategory === 'ISR') return baseType === 'AIR' || baseType === 'DIA_FACILITY';
  if (assetCategory === 'INTEL') return baseType === 'CIA_STATION' || baseType === 'DIA_FACILITY';
  return false;
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
  var migratedCount = 0;

  for (var i = 0; i < migration.assets.length; i++) {
    var entry = migration.assets[i];
    if (!entry.selected) continue; // Only migrate selected assets

    var asset = getAsset(entry.id);
    if (!asset || asset.status !== 'STATIONED') continue;

    // Resolve destination from selected index
    var dest = entry.destinations[entry.selectedDestIdx];
    if (!dest) continue;

    if (entry.isCSG) {
      // CSG repositioning — use maritime path to station point
      var station = THEATER_STATIONS[theaterId];
      if (station) {
        repositionCSG(asset.id, station.lat, station.lon);
      }
    } else {
      // Conventional asset — relocate homeBase and transit
      var targetBase = getBase(dest.id);
      if (targetBase) {
        asset.homeBaseId = dest.id;
        var transitMin = dest.transitMinutes;
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

    migratedCount++;
    pushFeedItem({
      id: uid('FI'),
      type: 'DEFCON',
      severity: 'ELEVATED',
      header: 'MIGRATION: ' + asset.name,
      body: asset.name + ' reassigned from ' + entry.fromBaseName + ' to ' + dest.name +
        '. ETA: ' + formatTransitTime(dest.transitMinutes) + '.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
    });
  }

  if (migratedCount > 0) {
    addLog('DEFCON: Migration approved for ' + (THEATERS[theaterId] ? THEATERS[theaterId].name : theaterId) + '. ' + migratedCount + ' asset(s) relocating.', 'log-info');
  }
  theater.pendingMigration = null;
}

// Toggle an asset's selection in the migration proposal
function toggleMigrationAsset(theaterId, assetId) {
  var theater = V.theaters[theaterId];
  if (!theater || !theater.pendingMigration) return;
  for (var i = 0; i < theater.pendingMigration.assets.length; i++) {
    if (theater.pendingMigration.assets[i].id === assetId) {
      theater.pendingMigration.assets[i].selected = !theater.pendingMigration.assets[i].selected;
      break;
    }
  }
}

// Cycle the destination for an asset in the migration proposal
function cycleMigrationDest(theaterId, assetId, direction) {
  var theater = V.theaters[theaterId];
  if (!theater || !theater.pendingMigration) return;
  for (var i = 0; i < theater.pendingMigration.assets.length; i++) {
    var entry = theater.pendingMigration.assets[i];
    if (entry.id === assetId && entry.destinations.length > 1) {
      entry.selectedDestIdx = (entry.selectedDestIdx + direction + entry.destinations.length) % entry.destinations.length;
      var dest = entry.destinations[entry.selectedDestIdx];
      entry.toBase = dest.id;
      entry.toBaseName = dest.name;
      entry.transitMinutes = dest.transitMinutes;
      break;
    }
  }
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

window.setTheaterDefcon = setDefcon;
window.approveMigration = approveMigration;
window.toggleMigrationAsset = toggleMigrationAsset;
window.cycleMigrationDest = cycleMigrationDest;
window.removeMigrationAsset = removeMigrationAsset;
window.dismissMigration = dismissMigration;
window.getAssetTheaterId = getAssetTheaterId;
