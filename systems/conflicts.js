/* ============================================================
   VIGIL — systems/conflicts.js
   Regional conflict spawning, types, effects, resolution.
   Requires DEFCON system to be loaded.
   ============================================================ */

var CONFLICT_TYPES = [
  { id: 'BORDER_WAR',            label: 'Border War',            weight: 3 },
  { id: 'NAVAL_CONFRONTATION',   label: 'Naval Confrontation',   weight: 2 },
  { id: 'PROXY_CONFLICT',        label: 'Proxy Conflict',        weight: 3 },
  { id: 'INSURGENT_OFFENSIVE',   label: 'Insurgent Offensive',   weight: 2 },
];

(function() {

  // --- Conflict Spawn (daily check) ---

  hook('tick:day', function() {
    for (var tid in V.theaters) {
      if (tid === 'NORTH_AMERICA') continue; // No conflicts on home soil

      var theater = V.theaters[tid];
      var defcon = theater.defcon || 5;

      // Require risk >= 4.0 AND defcon <= 3
      if (theater.risk < 4.0 || defcon > 3) continue;

      // Max 1 conflict per theater
      var hasConflict = false;
      for (var ci = 0; ci < V.conflicts.length; ci++) {
        if (V.conflicts[ci].theaterId === tid && V.conflicts[ci].active) {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) continue;

      // 15% daily chance
      if (Math.random() > 0.15) continue;

      spawnConflict(tid);
    }
  });

  // --- Conflict Resolution (daily check) ---

  hook('tick:day', function() {
    for (var i = V.conflicts.length - 1; i >= 0; i--) {
      var conflict = V.conflicts[i];
      if (!conflict.active) continue;

      var theater = V.theaters[conflict.theaterId];
      var daysActive = V.time.day - conflict.startDay;

      // Resolve if theater risk drops below 3.0 or duration exceeded
      if (theater.risk < 3.0 || daysActive > conflict.maxDuration) {
        resolveConflict(conflict);
      }
    }
  });

  function spawnConflict(theaterId) {
    var type = weightedPick(CONFLICT_TYPES);
    var theater = THEATERS[theaterId];
    if (!theater) return;

    // Pick a hot zone location from theater cities
    var city = pick(theater.cities);
    var conflictCountries = [];
    for (var ci = 0; ci < theater.countries.length; ci++) {
      var country = theater.countries[ci];
      var cd = V.diplomacy[country];
      if (cd && deriveStance(country) <= 2) {
        conflictCountries.push(country);
      }
    }
    if (conflictCountries.length === 0) {
      conflictCountries = [city.country];
    }

    var conflict = {
      id: uid('CONF'),
      theaterId: theaterId,
      type: type.id,
      typeLabel: type.label,
      hotZone: {
        lat: city.lat,
        lon: city.lon,
        radiusKm: randInt(100, 500),
        city: city.city,
        country: city.country,
      },
      countries: conflictCountries,
      startDay: V.time.day,
      maxDuration: randInt(14, 45),
      active: true,
    };

    V.conflicts.push(conflict);

    addLog('CONFLICT: ' + type.label + ' in ' + theater.name + ' (' + city.city + ', ' + city.country + ').', 'log-warn');

    pushFeedItem({
      id: uid('FI'),
      type: 'CONFLICT',
      severity: 'CRITICAL',
      header: 'REGIONAL CONFLICT: ' + type.label.toUpperCase(),
      body: 'A ' + type.label.toLowerCase() + ' has erupted near ' + city.city + ', ' + city.country +
        ' in the ' + theater.name + ' theater. Threat generation in this theater has increased significantly. ' +
        'DEFCON posture may need adjustment.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      geo: { lat: city.lat, lon: city.lon },
    });

    fire('conflict:spawned', { conflict: conflict });
  }

  function resolveConflict(conflict) {
    conflict.active = false;
    conflict.resolvedDay = V.time.day;

    var theaterName = THEATERS[conflict.theaterId] ? THEATERS[conflict.theaterId].name : conflict.theaterId;

    addLog('CONFLICT: ' + conflict.typeLabel + ' in ' + theaterName + ' has been resolved.', 'log-info');

    pushFeedItem({
      id: uid('FI'),
      type: 'CONFLICT',
      severity: 'ROUTINE',
      header: 'CONFLICT RESOLVED: ' + theaterName.toUpperCase(),
      body: 'The ' + conflict.typeLabel.toLowerCase() + ' near ' + conflict.hotZone.city + ', ' + conflict.hotZone.country +
        ' has de-escalated. Theater threat generation returning to baseline.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
    });

    fire('conflict:resolved', { conflict: conflict });
  }

})();

// --- Conflict Helpers ---

function getActiveConflicts() {
  return V.conflicts.filter(function(c) { return c.active; });
}

function getTheaterConflicts(theaterId) {
  return V.conflicts.filter(function(c) {
    return c.theaterId === theaterId && c.active;
  });
}

function getConflictSpawnMultiplier(theaterId) {
  var conflicts = getTheaterConflicts(theaterId);
  return conflicts.length > 0 ? 3.0 : 1.0;
}

