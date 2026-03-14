/* ============================================================
   VIGIL — workspaces/operations/lifecycle.js
   Operation state machine, timers, resolution.
   States: INCOMING → INVESTIGATING → READY → EXECUTING → SUCCESS/FAILURE
   ============================================================ */

(function() {

  // --- Timer ticks ---

  hook('tick:day', function(data) {
    for (var i = 0; i < V.operations.length; i++) {
      var op = V.operations[i];

      // Urgency countdown
      if (op.status === 'INCOMING' || op.status === 'READY') {
        op.urgencyLeft = Math.max(0, op.urgencyLeft - 1);
        if (op.urgencyLeft <= 0) {
          expireOperation(op);
          continue;
        }
      }

      // Investigation countdown
      if (op.status === 'INVESTIGATING') {
        op.invDaysLeft = Math.max(0, op.invDaysLeft - 1);
        if (op.invDaysLeft <= 0) {
          completeInvestigation(op);
        }
        // Also check urgency
        op.urgencyLeft = Math.max(0, op.urgencyLeft - 1);
        if (op.urgencyLeft <= 0) {
          expireOperation(op);
        }
      }

      // Execution countdown
      if (op.status === 'EXECUTING') {
        op.execDaysLeft = Math.max(0, op.execDaysLeft - 1);
        if (op.execDaysLeft <= 0) {
          resolveOperation(op);
        }
      }
    }
  });

  // --- State Transitions ---

  function expireOperation(op) {
    op.status = 'EXPIRED';
    addLog('OP ' + op.codename + ' EXPIRED — deadline passed.', 'log-warn');

    V.resources.confidence = clamp(V.resources.confidence - randInt(1, 3), 0, 100);

    var feedItem = {
      id: uid('FI'),
      type: 'OPERATION',
      severity: 'ELEVATED',
      header: 'OPERATION EXPIRED: ' + op.codename,
      body: 'Operation ' + op.codename + ' has expired due to inaction. The operational window has closed. Confidence impact: negative.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
    };
    pushFeedItem(feedItem);
  }

  function completeInvestigation(op) {
    op.status = 'READY';

    // Reveal intel fields based on investigation quality
    var total = op.intelFields.length;
    var hidden = op.intelFields.filter(function(f) { return !f.revealed; });
    var toReveal = Math.min(hidden.length, randInt(1, Math.ceil(total * 0.6)));

    for (var i = 0; i < toReveal; i++) {
      hidden[i].revealed = true;
      hidden[i].value = generateIntelFieldValue(hidden[i].key);
    }

    addLog('OP ' + op.codename + ' investigation complete. ' + toReveal + ' intel fields revealed.', 'log-info');

    var feedItem = {
      id: uid('FI'),
      type: 'OPERATION',
      severity: 'ELEVATED',
      header: 'INVESTIGATION COMPLETE: ' + op.codename,
      body: 'Investigation phase for Operation ' + op.codename + ' is complete. ' + toReveal + ' intelligence fields have been confirmed. The operation is ready for execution.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      read: false,
      opId: op.id,
    };
    pushFeedItem(feedItem);
  }

  function resolveOperation(op) {
    var prob = op.successProb || calcOpProb(op);
    var roll = Math.random() * 100;

    if (roll < prob) {
      op.status = 'SUCCESS';
      V.playStats.opsSucceeded++;

      // Rewards
      V.resources.confidence = clamp(V.resources.confidence + randInt(2, 6), 0, 100);
      V.resources.intel += randInt(5, 15);
      V.resources.xp += randInt(3, 8);

      addLog('OP ' + op.codename + ' SUCCESS. Confidence +, Intel +.', 'log-success');

      var feedItem = {
        id: uid('FI'),
        type: 'OPERATION',
        severity: 'ROUTINE',
        header: 'OPERATION SUCCESS: ' + op.codename,
        body: 'Operation ' + op.codename + ' has been completed successfully. ' +
          op.location.city + ', ' + op.location.country + '. ' +
          'Objectives achieved. Confidence and intelligence assets have been reinforced.',
        timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
        read: false,
        opId: op.id,
      };
      pushFeedItem(feedItem);

    } else {
      op.status = 'FAILURE';
      V.playStats.opsFailed++;

      // Penalties
      V.resources.confidence = clamp(V.resources.confidence - randInt(3, 8), 0, 100);

      addLog('OP ' + op.codename + ' FAILED. Confidence -.', 'log-fail');

      var feedItem2 = {
        id: uid('FI'),
        type: 'OPERATION',
        severity: 'HIGH',
        header: 'OPERATION FAILURE: ' + op.codename,
        body: 'Operation ' + op.codename + ' has failed to achieve its objectives. ' +
          'Location: ' + op.location.city + ', ' + op.location.country + '. ' +
          'Post-action assessment is underway. Confidence has been impacted.',
        timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
        read: false,
        opId: op.id,
      };
      pushFeedItem(feedItem2);

      // Failed ops may increase theater risk
      if (op.location && op.location.theaterId && V.theaters[op.location.theaterId]) {
        V.theaters[op.location.theaterId].risk = clamp(V.theaters[op.location.theaterId].risk + 0.5, 1, 5);
      }
    }

    V.playStats.opsCompleted++;
    fire('operation:resolved', { operation: op });
  }

  // --- Probability Calculation ---

  window.calcOpProb = function(op, budget, depts) {
    var base = 35;

    // Budget contribution (0-20%)
    var assignedBudget = budget || op.assignedBudget || op.baseBudget;
    var budgetRatio = clamp(assignedBudget / Math.max(1, op.baseBudget), 0, 2);
    var budgetBonus = Math.round(budgetRatio * 10);

    // Intel contribution (0-15%)
    var totalFields = op.intelFields.length;
    var revealedFields = op.intelFields.filter(function(f) { return f.revealed; }).length;
    var intelRatio = totalFields > 0 ? revealedFields / totalFields : 0;
    var intelBonus = Math.round(intelRatio * 15);

    // Intel penalty if fields missing (-10%)
    var intelPenalty = intelRatio < 0.3 ? 10 : 0;

    // Department bonus (0-10%)
    var deptBonus = 0;
    var assignedDepts = depts || op.assignedExecDepts || [];
    deptBonus = Math.min(10, assignedDepts.length * 5);

    var prob = base + budgetBonus + intelBonus + deptBonus - intelPenalty;
    return clamp(prob, 10, 92);
  };

  // --- Player Actions ---

  window.assignInvestigation = function(opId, deptId) {
    var op = getOp(opId);
    if (!op || op.status !== 'INCOMING') return;
    if (deptAvail(deptId) < 1) {
      addLog('Department unavailable.', 'log-warn');
      return;
    }

    op.status = 'INVESTIGATING';
    op.assignedDept = deptId;
    op.invDaysLeft = op.invDays;

    addLog('OP ' + op.codename + ' assigned to ' + deptId + ' for investigation.', 'log-info');
  };

  window.executeOperation = function(opId) {
    var op = getOp(opId);
    if (!op || op.status !== 'READY') return;

    var budget = op.assignedBudget || op.baseBudget;
    if (V.resources.budget < budget) {
      addLog('Insufficient budget.', 'log-warn');
      return;
    }

    V.resources.budget -= budget;
    op.status = 'EXECUTING';
    op.execDaysLeft = op.execDays;
    op.successProb = calcOpProb(op);

    addLog('OP ' + op.codename + ' LAUNCHED. Budget: $' + budget + 'M. Prob: ' + op.successProb + '%', 'log-op');
  };

  window.cancelOperation = function(opId) {
    var op = getOp(opId);
    if (!op) return;
    if (op.status === 'EXECUTING') return; // Can't cancel executing ops

    op.status = 'ARCHIVED';
    addLog('OP ' + op.codename + ' cancelled.', 'log-info');
  };

})();
