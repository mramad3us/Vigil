/* ============================================================
   VIGIL — systems/viability.js
   Operator viability tracking, monthly evaluation, game over.
   Viability → 0 = neural chip activates. Operator terminated.
   ============================================================ */

(function() {

  // --- Monthly Evaluation ---

  hook('tick:day', function() {
    var dt = dayToDate(V.time.day, V.time.year, V.time.month);
    var currentMonth = dt.year * 12 + dt.month;

    if (V.viability.lastEvalMonth >= currentMonth) return;
    if (V.time.day < 28) return; // Don't eval in the first month

    V.viability.lastEvalMonth = currentMonth;

    // Gather stats for this period
    var eval = computeMonthlyEval(dt);
    V.viability.monthlyHistory.push(eval);

    // Show eval modal
    showMonthlyEvalModal(eval);

    addLog('MONTHLY EVALUATION: Grade ' + eval.grade + '. Viability: ' + Math.round(V.resources.viability) + '%.', eval.grade === 'F' ? 'log-fail' : 'log-info');
  });

  // --- Game Over Check ---

  hook('tick', function() {
    if (V.resources.viability <= 0) {
      V.resources.viability = 0;
      gameOverTermination();
    }
  }, 50);

  // --- Compute Monthly Evaluation ---

  function computeMonthlyEval(dt) {
    var s = V.playStats;
    var successRate = s.opsCompleted > 0 ? (s.opsSucceeded / s.opsCompleted) * 100 : 50;
    var totalRecs = s.recommendationsFollowed + s.recommendationsDeviated;
    var deviationRate = totalRecs > 0 ? (s.recommendationsDeviated / totalRecs) * 100 : 0;
    var viability = V.resources.viability;

    // Weighted grade: success 40%, viability 30%, deviation 30%
    var successScore = clamp(successRate, 0, 100);
    var viabilityScore = clamp(viability, 0, 100);
    var deviationScore = clamp(100 - deviationRate, 0, 100); // Lower deviation = better

    var composite = successScore * 0.4 + viabilityScore * 0.3 + deviationScore * 0.3;

    var grade;
    if (composite >= 90) grade = 'A';
    else if (composite >= 75) grade = 'B';
    else if (composite >= 60) grade = 'C';
    else if (composite >= 40) grade = 'D';
    else grade = 'F';

    return {
      month: MONTH_NAMES[dt.month] + ' ' + dt.year,
      viability: Math.round(viability),
      successRate: Math.round(successRate),
      deviationRate: Math.round(deviationRate),
      opsCompleted: s.opsCompleted,
      opsSucceeded: s.opsSucceeded,
      opsFailed: s.opsFailed,
      deviations: s.recommendationsDeviated,
      composite: Math.round(composite),
      grade: grade,
    };
  }

  // --- Monthly Evaluation Modal ---

  function showMonthlyEvalModal(eval) {
    var gradeColor = eval.grade === 'A' ? 'var(--green)' :
                     eval.grade === 'B' ? 'var(--accent)' :
                     eval.grade === 'C' ? 'var(--amber)' :
                     eval.grade === 'D' ? 'var(--severity-high)' : 'var(--red)';

    var commentary = getVigilCommentary(eval);

    var body =
      '<div style="text-align:center;padding:var(--sp-4) 0">' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-muted);letter-spacing:2px">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
        '<div style="font-family:var(--font-display);font-size:var(--fs-2xl);color:var(--text-hi);margin:var(--sp-4) 0">MONTHLY PERFORMANCE EVALUATION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text-dim)">' + eval.month + ' EVALUATION PERIOD</div>' +
      '</div>' +

      '<div style="display:flex;justify-content:center;margin:var(--sp-6) 0">' +
        '<div style="width:80px;height:80px;border-radius:50%;border:3px solid ' + gradeColor + ';display:flex;align-items:center;justify-content:center">' +
          '<span style="font-family:var(--font-display);font-size:var(--fs-3xl);font-weight:700;color:' + gradeColor + '">' + eval.grade + '</span>' +
        '</div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);margin:var(--sp-4) 0">' +
        metricCard('VIABILITY', eval.viability + '%', eval.viability > 60 ? 'var(--green)' : eval.viability > 30 ? 'var(--amber)' : 'var(--red)') +
        metricCard('SUCCESS RATE', eval.successRate + '%', eval.successRate > 70 ? 'var(--green)' : eval.successRate > 40 ? 'var(--amber)' : 'var(--red)') +
        metricCard('OPS COMPLETED', String(eval.opsCompleted), 'var(--accent)') +
        metricCard('DEVIATION RATE', eval.deviationRate + '%', eval.deviationRate < 20 ? 'var(--green)' : eval.deviationRate < 50 ? 'var(--amber)' : 'var(--red)') +
      '</div>' +

      '<div style="margin:var(--sp-4) 0;padding:var(--sp-3);background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm)">' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-muted);letter-spacing:1px;margin-bottom:var(--sp-2)">VIGIL ASSESSMENT</div>' +
        '<div style="font-size:var(--fs-md);color:var(--text);line-height:1.7">' + commentary + '</div>' +
      '</div>';

    showModal('EVALUATION — ' + eval.month, body);
  }

  function metricCard(label, value, color) {
    return '<div style="padding:var(--sp-3);background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center">' +
      '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text-muted);letter-spacing:1px">' + label + '</div>' +
      '<div style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;color:' + color + ';margin-top:var(--sp-1)">' + value + '</div>' +
    '</div>';
  }

  // --- Vigil Commentary (parametrized with actual stats) ---

  function getVigilCommentary(eval) {
    if (eval.grade === 'A') {
      return pick([
        'Operator performance exceeds all benchmarks. ' + eval.opsSucceeded + ' successful operations with a ' + eval.deviationRate + '% deviation rate demonstrates exemplary adherence to Vigil directives. Viability status: optimal.',
        'Outstanding operational record. Vigil assessment confirms operator judgment aligns with system recommendations at a ' + (100 - eval.deviationRate) + '% compliance rate. Current viability of ' + eval.viability + '% reflects sustained excellence.',
        'Evaluation: exemplary. The operator has maintained a ' + eval.successRate + '% success rate across ' + eval.opsCompleted + ' operations. No corrective action required. Neural implant status: nominal.',
      ]);
    }
    if (eval.grade === 'B') {
      return pick([
        'Operator performance meets Vigil standards. ' + eval.opsCompleted + ' operations processed with acceptable outcomes. Deviation rate of ' + eval.deviationRate + '% is within tolerance. Continue current operational posture.',
        'Satisfactory performance. Success rate of ' + eval.successRate + '% is adequate. Viability at ' + eval.viability + '% is stable. Minor deviations from Vigil recommendations have been noted but did not compromise mission outcomes.',
        'Evaluation: acceptable. Operator has demonstrated competence across ' + eval.opsCompleted + ' operations. Recommendation: maintain current approach. Unauthorized deviations: ' + eval.deviations + '.',
      ]);
    }
    if (eval.grade === 'C') {
      return pick([
        'Operator performance is marginal. Success rate of ' + eval.successRate + '% falls below optimal. ' + eval.deviations + ' deviations from Vigil recommendations have been logged. Viability trending: concerning.',
        'Warning: performance metrics are declining. Of ' + eval.opsCompleted + ' operations, ' + eval.opsFailed + ' failed. Deviation rate of ' + eval.deviationRate + '% suggests operator is overriding Vigil analysis. This pattern is inadvisable.',
        'Evaluation: marginal. Current viability of ' + eval.viability + '% requires improvement. Vigil reminds the operator that its recommendations carry a 90% historical accuracy rate. Deviation from these recommendations has demonstrable consequences.',
      ]);
    }
    if (eval.grade === 'D') {
      return pick([
        'CRITICAL: Operator viability at ' + eval.viability + '%. Performance is unsatisfactory. ' + eval.opsFailed + ' failed operations of ' + eval.opsCompleted + ' total. Deviation rate of ' + eval.deviationRate + '% represents a pattern of poor judgment. Neural implant threshold approaching activation parameters.',
        'WARNING: Operator is underperforming significantly. Success rate of ' + eval.successRate + '% is unacceptable. Vigil analysis indicates ' + eval.deviations + ' unauthorized deviations from recommended courses of action. Immediate correction required. Viability: ' + eval.viability + '%.',
        'Evaluation: unsatisfactory. The operator has demonstrated a pattern of decisions that diverge from Vigil\'s optimized recommendations. With viability at ' + eval.viability + '%, the neural implant\'s safety threshold is approaching. Compliance is not optional.',
      ]);
    }
    // Grade F
    return pick([
      'TERMINAL WARNING: Operator viability at ' + eval.viability + '%. Neural implant activation threshold: imminent. ' + eval.opsFailed + ' operational failures. ' + eval.deviations + ' Vigil overrides. This operator has failed to demonstrate the judgment required for continued service. Vigil recommends immediate behavioral correction or acceptance of consequences.',
      'CRITICAL FAILURE: Viability ' + eval.viability + '%. The operator\'s record of ' + eval.successRate + '% success across ' + eval.opsCompleted + ' operations, combined with a ' + eval.deviationRate + '% deviation rate, falls catastrophically below acceptable parameters. Neural implant status: pre-activation standby. There will be no further warnings.',
    ]);
  }

  // --- Game Over: Operator Termination ---

  var _gameOver = false;

  function gameOverTermination() {
    if (_gameOver) return;
    _gameOver = true;

    stopEngine();

    var callsign = V.player.callsign || 'UNKNOWN';
    var daysServed = V.time.day;
    var dt = dayToDate(V.time.day, V.time.year, V.time.month);
    var dateStr = MONTH_FULL[dt.month] + ' ' + dt.dayOfMonth + ', ' + dt.year;

    var body =
      '<div style="text-align:center;padding:var(--sp-6) 0">' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--red);letter-spacing:2px;animation:pulse-ring 1.5s ease infinite">⬤ NEURAL IMPLANT ACTIVATED ⬤</div>' +
        '<div style="font-family:var(--font-display);font-size:var(--fs-3xl);font-weight:700;color:var(--red);margin:var(--sp-6) 0">OPERATOR TERMINATED</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text-dim)">' + dateStr + '</div>' +
      '</div>' +

      '<div style="margin:var(--sp-4) 0;padding:var(--sp-4);background:var(--bg-3);border:1px solid var(--red-dim);border-radius:var(--radius-sm);line-height:1.8;color:var(--text)">' +
        'Operator ' + callsign + ' has failed to maintain acceptable viability metrics. ' +
        'After ' + daysServed + ' days of service, the neural implant\'s safety protocol has been activated per Vigil Directive 7, Section 12.4: ' +
        '"An operator whose viability reaches zero represents an unacceptable risk to national security and shall be immediately deactivated."' +
        '<br><br>' +
        'The operator\'s bunker will be sanitized. A replacement operator has been selected and will be inducted within 72 hours. ' +
        'All active operations have been reassigned to adjacent operators. ' +
        'This termination has been logged under case file ' + generateCaseFileId() + '.' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-3);margin:var(--sp-4) 0">' +
        metricCard('DAYS SERVED', String(daysServed), 'var(--text-dim)') +
        metricCard('OPS COMPLETED', String(V.playStats.opsCompleted), 'var(--text-dim)') +
        metricCard('SUCCESS RATE', (V.playStats.opsCompleted > 0 ? Math.round(V.playStats.opsSucceeded / V.playStats.opsCompleted * 100) : 0) + '%', 'var(--text-dim)') +
      '</div>' +

      '<div style="text-align:center;margin-top:var(--sp-4)">' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-muted)">VIGIL CONTINUES. THE SYSTEM ENDURES.</div>' +
      '</div>';

    showModal('TERMINATION NOTICE', body);
  }

})();
