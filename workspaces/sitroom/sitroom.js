/* ============================================================
   VIGIL — workspaces/sitroom/sitroom.js
   Situation room workspace: crisis dashboard.
   ============================================================ */

(function() {

  registerWorkspace({
    id: 'sitroom',
    label: 'Sit Room',
    icon: '◉',

    init: function() {
      var container = $('ws-sitroom');
      container.innerHTML =
        '<div class="sitroom-layout">' +
          '<div class="sitroom-gauge-panel" id="sitroom-gauges"></div>' +
          '<div class="sitroom-crises" id="sitroom-crises"></div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderSitroomGauges();
      renderSitroomCrises();
    },
  });

  // --- Gauges Panel ---

  function renderSitroomGauges() {
    var el = $('sitroom-gauges');
    if (!el) return;

    var tl = getGlobalThreatLevel();
    var riskVal = 0;
    var riskCount = 0;
    for (var tid in V.theaters) {
      riskVal += V.theaters[tid].risk;
      riskCount++;
    }
    var avgRisk = riskCount > 0 ? riskVal / riskCount : 0;
    var riskPct = (avgRisk / 5) * 100;

    // SVG gauge
    var circumference = 2 * Math.PI * 42;
    var offset = circumference - (riskPct / 100) * circumference;
    var gaugeColor = riskPct > 70 ? 'var(--red)' : riskPct > 40 ? 'var(--amber)' : 'var(--green)';

    var html =
      '<div class="gauge-section-title">GLOBAL THREAT ASSESSMENT</div>' +
      '<div class="threat-gauge">' +
        '<div class="threat-gauge-ring">' +
          '<svg viewBox="0 0 100 100">' +
            '<circle class="gauge-bg" cx="50" cy="50" r="42" />' +
            '<circle class="gauge-fill" cx="50" cy="50" r="42" ' +
              'stroke="' + gaugeColor + '" ' +
              'stroke-dasharray="' + circumference + '" ' +
              'stroke-dashoffset="' + offset + '" />' +
          '</svg>' +
          '<div class="threat-gauge-label">' + tl.level + '</div>' +
        '</div>' +
        '<div class="threat-gauge-text">' + Math.round(riskPct) + '% RISK CAPACITY</div>' +
      '</div>';

    // Theater risk bars
    html += '<div class="gauge-section-title" style="margin-top:var(--sp-4)">THEATER RISK LEVELS</div>' +
      '<div class="theater-risks">';

    for (var id in THEATERS) {
      var theater = THEATERS[id];
      var risk = V.theaters[id] ? V.theaters[id].risk : theater.baseRisk;
      var pct = (risk / 5) * 100;
      var barColor = risk >= 4 ? 'var(--red)' : risk >= 3 ? 'var(--amber)' : 'var(--green)';

      html += '<div class="theater-risk-row">' +
        '<span class="theater-risk-name">' + theater.shortName + '</span>' +
        '<div class="theater-risk-bar"><div class="theater-risk-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>' +
        '<span class="theater-risk-val">' + risk.toFixed(1) + '</span>' +
      '</div>';
    }
    html += '</div>';

    // Stats
    html += '<div class="gauge-section-title" style="margin-top:var(--sp-4)">OPERATIONS SUMMARY</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);line-height:2">' +
        'Active Ops: ' + getActiveOpsCount() + '<br>' +
        'Completed: ' + V.playStats.opsCompleted + '<br>' +
        'Success Rate: ' + (V.playStats.opsCompleted > 0 ? Math.round(V.playStats.opsSucceeded / V.playStats.opsCompleted * 100) : 0) + '%<br>' +
        'Active Threats: ' + V.threats.filter(function(t) { return t.status === 'ACTIVE'; }).length + '<br>' +
        'Days: ' + V.time.day +
      '</div>';

    el.innerHTML = html;
  }

  // --- Crisis Cards ---

  function renderSitroomCrises() {
    var el = $('sitroom-crises');
    if (!el) return;

    var activeCrises = V.crises.filter(function(c) { return !c.resolved; });

    var html = '<div class="sitroom-crises-header">' +
      '<div class="sitroom-crises-title">ACTIVE CRISES</div>' +
      '<div class="sitroom-crises-count">' + activeCrises.length + ' active</div>' +
    '</div>';

    if (activeCrises.length === 0) {
      html += '<div class="sitroom-empty">' +
        '<div class="sitroom-empty-icon">◎</div>' +
        '<div>NO ACTIVE CRISES</div>' +
        '<div style="font-size:9px;margin-top:var(--sp-2)">Situation nominal. Continue monitoring.</div>' +
      '</div>';
    } else {
      html += '<div class="crisis-cards">';
      for (var i = 0; i < activeCrises.length; i++) {
        var crisis = activeCrises[i];
        var sevCls = crisis.severity.toLowerCase();

        html += '<div class="crisis-card ' + sevCls + '">' +
          '<div class="crisis-card-header">' +
            '<span class="crisis-card-severity ' + sevCls + '">' + crisis.severity + '</span>' +
            '<span class="crisis-card-timer">' + crisis.daysLeft + ' days remaining</span>' +
          '</div>' +
          '<div class="crisis-card-title">' + crisis.label + '</div>' +
          '<div class="crisis-card-location">' + (crisis.location ? crisis.location.city + ', ' + crisis.location.country : 'Unknown') + '</div>' +
          '<div class="crisis-card-desc">' + crisis.description + '</div>' +
          '<div class="crisis-card-actions">';

        for (var r = 0; r < crisis.responses.length; r++) {
          var resp = crisis.responses[r];
          html += '<button class="feed-action-btn' + (r === 0 ? ' primary' : '') + '" onclick="respondToCrisis(\'' + crisis.id + '\',' + r + ')">' + resp.label + '</button>';
        }

        html += '</div></div>';
      }
      html += '</div>';
    }

    // Resolved crises (recent)
    var resolved = V.crises.filter(function(c) { return c.resolved; }).slice(0, 5);
    if (resolved.length > 0) {
      html += '<div class="sitroom-crises-header" style="margin-top:var(--sp-6)">' +
        '<div class="sitroom-crises-title" style="color:var(--text-dim)">RESOLVED</div>' +
      '</div>';
      html += '<div class="crisis-cards">';
      for (var j = 0; j < resolved.length; j++) {
        var rc = resolved[j];
        html += '<div class="crisis-card" style="opacity:0.5">' +
          '<div class="crisis-card-header">' +
            '<span class="crisis-card-severity" style="color:var(--text-dim);background:var(--bg-4)">RESOLVED</span>' +
          '</div>' +
          '<div class="crisis-card-title">' + rc.label + '</div>' +
          '<div class="crisis-card-location">' + (rc.location ? rc.location.city : '') + '</div>' +
        '</div>';
      }
      html += '</div>';
    }

    el.innerHTML = html;
  }

  // Re-render on crisis events
  hook('crisis:spawned', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderSitroomCrises();
      renderSitroomGauges();
    }
  });

})();
