/* ============================================================
   VIGIL — systems/geopolitics.js
   Theater volatility, risk levels, geopolitical events.
   ============================================================ */

(function() {

  // --- Weekly theater risk adjustment ---
  hook('tick:week', function() {
    for (var tid in V.theaters) {
      var theater = V.theaters[tid];
      var base = THEATERS[tid].baseRisk;

      // Drift toward base risk
      if (theater.risk > base) {
        theater.risk = Math.max(base, theater.risk - 0.3);
      } else if (theater.risk < base) {
        theater.risk = Math.min(base, theater.risk + 0.2);
      }

      // Random volatility fluctuation
      if (Math.random() < THEATERS[tid].volatility) {
        theater.risk = clamp(theater.risk + randFloat(-0.5, 0.5), 1, 5);
      }
    }
  });

  // --- Theater risk from operations ---
  hook('operation:resolved', function(data) {
    var op = data.operation;
    if (!op.location || !op.location.theaterId) return;
    var tid = op.location.theaterId;

    if (op.status === 'SUCCESS') {
      // Success reduces theater risk
      V.theaters[tid].risk = clamp(V.theaters[tid].risk - 0.3, 1, 5);
    } else if (op.status === 'FAILURE') {
      // Failure increases theater risk
      V.theaters[tid].risk = clamp(V.theaters[tid].risk + 0.5, 1, 5);
    }
  });

  // --- Initialize theaters on game start ---
  hook('game:start', function() {
    for (var tid in THEATERS) {
      if (!V.theaters[tid]) {
        V.theaters[tid] = {
          risk: THEATERS[tid].baseRisk,
          volatility: THEATERS[tid].volatility,
          activeEvents: [],
          eventCount: 0,
        };
      }
    }
  }, 1);

})();
