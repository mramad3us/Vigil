/* ============================================================
   VIGIL — systems/assets.js
   Deployable military/intel assets. Each tied to a home base.
   Transit calculations, position updates, return-to-base.
   ============================================================ */

// --- Asset Templates ---
// These define the "types" of assets. Instances are created at game start.

var ASSET_TEMPLATES = [
  // SOF
  { type: 'SEAL_TEAM_6', name: 'SEAL Team 6 (DEVGRU)', category: 'SOF', homeBaseId: 'DAM_NECK', speed: 800, capabilities: ['SOF', 'STRIKE', 'HOSTAGE_RESCUE', 'COUNTER_TERROR'] },
  { type: 'DELTA_FORCE', name: '1st SFOD-Delta', category: 'SOF', homeBaseId: 'FORT_LIBERTY', speed: 800, capabilities: ['SOF', 'STRIKE', 'HOSTAGE_RESCUE', 'COUNTER_TERROR'] },
  { type: 'JSOC_TASK_FORCE', name: 'JSOC Task Force', category: 'SOF', homeBaseId: 'FORT_LIBERTY', speed: 750, capabilities: ['SOF', 'STRIKE', 'COUNTER_TERROR'] },
  { type: '75TH_RANGERS', name: '75th Ranger Regiment', category: 'SOF', homeBaseId: 'FORT_LIBERTY', speed: 700, capabilities: ['SOF', 'STRIKE', 'MILITARY'] },

  // NAVY
  { type: 'CSG_7', name: 'Carrier Strike Group 7', category: 'NAVY', homeBaseId: 'YOKOSUKA', speed: 55, capabilities: ['NAVAL', 'STRIKE', 'ISR'] },
  { type: 'CSG_2', name: 'Carrier Strike Group 2', category: 'NAVY', homeBaseId: 'NORFOLK', speed: 55, capabilities: ['NAVAL', 'STRIKE', 'ISR'] },
  { type: 'CSG_3', name: 'Carrier Strike Group 3', category: 'NAVY', homeBaseId: 'PEARL_HARBOR', speed: 55, capabilities: ['NAVAL', 'STRIKE', 'ISR'] },
  { type: 'DDG_SQUADRON', name: 'Destroyer Squadron 15', category: 'NAVY', homeBaseId: 'YOKOSUKA', speed: 60, capabilities: ['NAVAL', 'STRIKE'] },
  { type: 'SSN_SQUADRON', name: 'Submarine Squadron 8', category: 'NAVY', homeBaseId: 'NORFOLK', speed: 50, capabilities: ['NAVAL', 'INTEL', 'STRIKE'] },

  // AIR
  { type: 'F35_SQN_EU', name: 'F-35A Squadron (EU)', category: 'AIR', homeBaseId: 'RAMSTEIN', speed: 1700, capabilities: ['STRIKE', 'ISR'] },
  { type: 'F35_SQN_PAC', name: 'F-35A Squadron (PAC)', category: 'AIR', homeBaseId: 'KADENA', speed: 1700, capabilities: ['STRIKE', 'ISR'] },
  { type: 'B2_WING', name: 'B-2 Spirit Wing', category: 'AIR', homeBaseId: 'CREECH', speed: 900, capabilities: ['STRIKE'] },
  { type: 'AC130_FLIGHT', name: 'AC-130J Ghostrider Flight', category: 'AIR', homeBaseId: 'SOTO_CANO', speed: 480, capabilities: ['STRIKE', 'SOF'] },

  // ISR
  { type: 'MQ9_FLIGHT_ME', name: 'MQ-9 Reaper Flight (ME)', category: 'ISR', homeBaseId: 'AL_UDEID', speed: 370, capabilities: ['ISR', 'STRIKE'] },
  { type: 'MQ9_FLIGHT_AF', name: 'MQ-9 Reaper Flight (AF)', category: 'ISR', homeBaseId: 'CAMP_LEMONNIER', speed: 370, capabilities: ['ISR', 'STRIKE'] },
  { type: 'RQ4_FLIGHT', name: 'RQ-4 Global Hawk Flight', category: 'ISR', homeBaseId: 'CREECH', speed: 575, capabilities: ['ISR', 'SIGINT'] },
  { type: 'EP3_ARIES', name: 'EP-3E Aries II', category: 'ISR', homeBaseId: 'BAHRAIN', speed: 610, capabilities: ['ISR', 'SIGINT'] },
  { type: 'RC135_RIVET', name: 'RC-135 Rivet Joint', category: 'ISR', homeBaseId: 'MENWITH_HILL', speed: 800, capabilities: ['ISR', 'SIGINT', 'CYBER'] },

  // INTEL
  { type: 'CIA_SAD_EU', name: 'CIA SAD/SOG (Europe)', category: 'INTEL', homeBaseId: 'CIA_LONDON', speed: 600, capabilities: ['INTEL', 'SOF', 'COUNTER_TERROR'] },
  { type: 'CIA_SAD_ME', name: 'CIA SAD/SOG (Middle East)', category: 'INTEL', homeBaseId: 'CIA_CAIRO', speed: 600, capabilities: ['INTEL', 'SOF', 'COUNTER_TERROR'] },
  { type: 'CIA_CASE_TEAM_1', name: 'CIA Case Officer Team Alpha', category: 'INTEL', homeBaseId: 'CIA_BERLIN', speed: 500, capabilities: ['INTEL', 'HUMINT'] },
  { type: 'CIA_CASE_TEAM_2', name: 'CIA Case Officer Team Bravo', category: 'INTEL', homeBaseId: 'CIA_ISLAMABAD', speed: 500, capabilities: ['INTEL', 'HUMINT'] },
  { type: 'CIA_CASE_TEAM_3', name: 'CIA Case Officer Team Charlie', category: 'INTEL', homeBaseId: 'CIA_TOKYO', speed: 500, capabilities: ['INTEL', 'HUMINT'] },
  { type: 'DIA_SIGINT_TEAM', name: 'DIA SIGINT Collection Team', category: 'INTEL', homeBaseId: 'FORT_MEADE', speed: 500, capabilities: ['INTEL', 'SIGINT', 'CYBER'] },
  { type: 'NSA_TAO', name: 'NSA TAO Unit', category: 'INTEL', homeBaseId: 'FORT_MEADE', speed: 0, capabilities: ['CYBER', 'SIGINT'] },
];

// --- Asset Category Display ---

var ASSET_CATEGORIES = {
  SOF:   { label: 'Special Operations', color: '#e04040', shortLabel: 'SOF' },
  NAVY:  { label: 'Naval Forces',       color: '#4a8fd4', shortLabel: 'NAVY' },
  AIR:   { label: 'Air Power',          color: '#5a9fe4', shortLabel: 'AIR' },
  ISR:   { label: 'ISR Platform',       color: '#9060cc', shortLabel: 'ISR' },
  INTEL: { label: 'Intelligence',       color: '#e0a030', shortLabel: 'INTEL' },
};

// --- Initialize Assets at Game Start ---

(function() {

  hook('game:start', function() {
    V.assets = [];
    for (var i = 0; i < ASSET_TEMPLATES.length; i++) {
      var tpl = ASSET_TEMPLATES[i];
      var base = getBase(tpl.homeBaseId);
      if (!base) continue;

      V.assets.push({
        id: uid('AST'),
        type: tpl.type,
        name: tpl.name,
        category: tpl.category,
        homeBaseId: tpl.homeBaseId,
        currentBaseId: tpl.homeBaseId,
        status: 'STATIONED',
        speed: tpl.speed,
        capabilities: tpl.capabilities.slice(),
        assignedOpId: null,
        currentLat: base.lat,
        currentLon: base.lon,
        originLat: null,
        originLon: null,
        destinationLat: null,
        destinationLon: null,
        transitStartTotalMinutes: 0,
        transitDurationMinutes: 0,
      });
    }
  }, 2); // Priority 2: after state init, before ops spawn

  // --- Transit Tick ---

  hook('tick', function(data) {
    if (!V.assets) return;
    var now = V.time.totalMinutes;

    for (var i = 0; i < V.assets.length; i++) {
      var asset = V.assets[i];

      if (asset.status === 'IN_TRANSIT' || asset.status === 'RETURNING') {
        if (asset.transitDurationMinutes <= 0) {
          arriveAsset(asset);
          continue;
        }

        var elapsed = now - asset.transitStartTotalMinutes;
        var fraction = elapsed / asset.transitDurationMinutes;

        if (fraction >= 1) {
          arriveAsset(asset);
        } else {
          // Interpolate position
          var pos = interpolateGreatCircle(
            asset.originLat, asset.originLon,
            asset.destinationLat, asset.destinationLon,
            fraction
          );
          asset.currentLat = pos.lat;
          asset.currentLon = pos.lon;
        }
      }
    }
  }, 5); // Run early in tick cycle

})();

// --- Asset Helpers ---

function getAsset(id) {
  if (!V.assets) return null;
  for (var i = 0; i < V.assets.length; i++) {
    if (V.assets[i].id === id) return V.assets[i];
  }
  return null;
}

function getAssetsByIds(ids) {
  var result = [];
  for (var i = 0; i < ids.length; i++) {
    var a = getAsset(ids[i]);
    if (a) result.push(a);
  }
  return result;
}

function getAvailableAssets() {
  if (!V.assets) return [];
  return V.assets.filter(function(a) { return a.status === 'STATIONED'; });
}

function getAvailableAssetsWithCapability(capability) {
  return getAvailableAssets().filter(function(a) {
    return a.capabilities.indexOf(capability) >= 0;
  });
}

function getAssetsAtBase(baseId) {
  if (!V.assets) return [];
  return V.assets.filter(function(a) {
    return a.currentBaseId === baseId && a.status === 'STATIONED';
  });
}

// --- Transit Calculations ---

function calcTransitMinutes(asset, destLat, destLon) {
  if (asset.speed <= 0) return 0; // Cyber/remote — instant
  var dist = haversineKm(asset.currentLat, asset.currentLon, destLat, destLon);
  var hours = dist / asset.speed;
  return Math.max(30, Math.round(hours * 60)); // Minimum 30 game-minutes
}

function calcGroupTransitMinutes(assetIds, destLat, destLon) {
  var maxMinutes = 0;
  for (var i = 0; i < assetIds.length; i++) {
    var a = getAsset(assetIds[i]);
    if (!a) continue;
    var m = calcTransitMinutes(a, destLat, destLon);
    if (m > maxMinutes) maxMinutes = m;
  }
  return maxMinutes;
}

function formatTransitTime(minutes) {
  if (minutes <= 0) return 'INSTANT';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  if (h === 0) return m + 'min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}

// --- Deploy & Return ---

function deployAssets(assetIds, destLat, destLon, opId) {
  var now = V.time.totalMinutes;
  for (var i = 0; i < assetIds.length; i++) {
    var asset = getAsset(assetIds[i]);
    if (!asset || asset.status !== 'STATIONED') continue;

    var transitMin = calcTransitMinutes(asset, destLat, destLon);

    asset.status = 'IN_TRANSIT';
    asset.assignedOpId = opId;
    asset.currentBaseId = null;
    asset.originLat = asset.currentLat;
    asset.originLon = asset.currentLon;
    asset.destinationLat = destLat;
    asset.destinationLon = destLon;
    asset.transitStartTotalMinutes = now;
    asset.transitDurationMinutes = transitMin;
  }
}

function returnAssetsToBase(assetIds) {
  var now = V.time.totalMinutes;
  for (var i = 0; i < assetIds.length; i++) {
    var asset = getAsset(assetIds[i]);
    if (!asset) continue;

    var homeBase = getBase(asset.homeBaseId);
    if (!homeBase) continue;

    var transitMin = calcTransitMinutes(asset, homeBase.lat, homeBase.lon);

    asset.status = 'RETURNING';
    asset.assignedOpId = null;
    asset.originLat = asset.currentLat;
    asset.originLon = asset.currentLon;
    asset.destinationLat = homeBase.lat;
    asset.destinationLon = homeBase.lon;
    asset.transitStartTotalMinutes = now;
    asset.transitDurationMinutes = transitMin;
  }
}

function arriveAsset(asset) {
  if (asset.status === 'IN_TRANSIT') {
    asset.status = 'DEPLOYED';
    asset.currentLat = asset.destinationLat;
    asset.currentLon = asset.destinationLon;
    fire('asset:arrived', { asset: asset, opId: asset.assignedOpId });
  } else if (asset.status === 'RETURNING') {
    asset.status = 'STATIONED';
    asset.currentBaseId = asset.homeBaseId;
    var home = getBase(asset.homeBaseId);
    if (home) {
      asset.currentLat = home.lat;
      asset.currentLon = home.lon;
    }
    asset.assignedOpId = null;
    asset.originLat = null;
    asset.originLon = null;
    asset.destinationLat = null;
    asset.destinationLon = null;
    asset.transitStartTotalMinutes = 0;
    asset.transitDurationMinutes = 0;
  }
}
