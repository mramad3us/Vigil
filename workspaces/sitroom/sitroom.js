/* ============================================================
   VIGIL — workspaces/sitroom/sitroom.js
   Situation room workspace: DEFCON controls, force disposition,
   theater risk, crises, migration proposals.
   Three-column layout.
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
          '<div class="sitroom-center" id="sitroom-defcon"></div>' +
          '<div class="sitroom-crises" id="sitroom-crises"></div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderSitroomGauges();
      renderDefconPanel();
      renderSitroomCrises();
    },
  });

  // --- Left Column: Gauges Panel ---

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

    // Stats
    html += '<div class="gauge-section-title" style="margin-top:var(--sp-4)">OPERATIONS SUMMARY</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);line-height:2">' +
        'Active Ops: ' + getActiveOpsCount() + '<br>' +
        'Completed: ' + V.playStats.opsCompleted + '<br>' +
        'Success Rate: ' + (V.playStats.opsCompleted > 0 ? Math.round(V.playStats.opsSucceeded / V.playStats.opsCompleted * 100) : 0) + '%<br>' +
        'Active Threats: ' + V.threats.filter(function(t) { return t.status === 'ACTIVE'; }).length + '<br>' +
        'Active Conflicts: ' + (typeof getActiveConflicts === 'function' ? getActiveConflicts().length : 0) + '<br>' +
        'Days: ' + V.time.day +
      '</div>';

    el.innerHTML = html;
  }

  // --- Center Column: DEFCON Theater Cards ---

  function renderDefconPanel() {
    var el = $('sitroom-defcon');
    if (!el) return;

    var html = '<div class="sitroom-defcon-header">THEATER DEFCON STATUS</div>';

    html += '<div class="defcon-cards">';

    for (var tid in THEATERS) {
      var theater = THEATERS[tid];
      var ts = V.theaters[tid];
      if (!ts) continue;

      var defcon = ts.defcon || 5;
      var defconInfo = typeof getDefconInfo === 'function' ? getDefconInfo(defcon) : { label: 'FADE OUT', color: 'var(--green)', desc: '' };
      var risk = ts.risk || 0;
      var riskPct = (risk / 5) * 100;
      var riskColor = risk >= 4 ? 'var(--red)' : risk >= 3 ? 'var(--amber)' : 'var(--green)';

      // Active conflicts in theater
      var conflictCount = typeof getTheaterConflicts === 'function' ? getTheaterConflicts(tid).length : 0;

      // Active threats in theater
      var threatCount = 0;
      for (var ti = 0; ti < V.threats.length; ti++) {
        if (V.threats[ti].status === 'ACTIVE' && V.threats[ti].location && V.threats[ti].location.theaterId === tid) {
          threatCount++;
        }
      }

      // Force disposition
      var forceCount = {};
      for (var ai = 0; ai < V.assets.length; ai++) {
        var asset = V.assets[ai];
        if (asset.status === 'STATIONED' || asset.status === 'DEPLOYED' || asset.status === 'COLLECTING') {
          var assetBase = getBase(asset.currentBaseId || asset.homeBaseId);
          if (assetBase && theater.countries.indexOf(assetBase.country) >= 0) {
            forceCount[asset.category] = (forceCount[asset.category] || 0) + 1;
          }
        }
      }

      html += '<div class="defcon-card" style="border-left:3px solid ' + defconInfo.color + '">';

      // Theater name + DEFCON
      html += '<div class="defcon-card-header">' +
        '<span class="defcon-card-name">' + theater.shortName + '</span>' +
        '<span class="defcon-card-level" style="color:' + defconInfo.color + '">DEFCON ' + defcon + '</span>' +
      '</div>';

      // DEFCON label
      html += '<div class="defcon-card-label" style="color:' + defconInfo.color + '">' + defconInfo.label + '</div>';

      // DEFCON selector
      html += '<div class="defcon-selector">';
      for (var d = 5; d >= 1; d--) {
        var dInfo = typeof getDefconInfo === 'function' ? getDefconInfo(d) : DEFCON_LEVELS[d];
        var activeCls = d === defcon ? ' active' : '';
        var tipText = typeof TIPS !== 'undefined' && TIPS.defcon ? TIPS.defcon[d] : '';
        html += '<div class="defcon-level defcon-' + d + activeCls + '"' +
          ' onclick="setTheaterDefcon(\'' + tid + '\',' + d + ')"' +
          ' data-tip="' + (tipText || '').replace(/"/g, '&quot;') + '" data-tip-align="bottom">' +
          d + '</div>';
      }
      html += '</div>';

      // Risk bar
      html += '<div class="defcon-risk-row">' +
        '<span class="defcon-risk-label">RISK</span>' +
        '<div class="theater-risk-bar" style="flex:1"><div class="theater-risk-fill" style="width:' + riskPct + '%;background:' + riskColor + '"></div></div>' +
        '<span class="defcon-risk-val">' + risk.toFixed(1) + '</span>' +
      '</div>';

      // Force disposition
      var forceParts = [];
      var catOrder = ['SOF', 'NAVY', 'AIR', 'ISR', 'INTEL', 'DIPLOMATIC', 'DOMESTIC'];
      for (var ci = 0; ci < catOrder.length; ci++) {
        var cat = catOrder[ci];
        if (forceCount[cat]) {
          var catInfo = typeof ASSET_CATEGORIES !== 'undefined' ? ASSET_CATEGORIES[cat] : null;
          var catColor = catInfo ? catInfo.color : 'var(--text)';
          var catLabel = catInfo ? catInfo.shortLabel : cat;
          forceParts.push('<span style="color:' + catColor + '">' + catLabel + ': ' + forceCount[cat] + '</span>');
        }
      }
      if (forceParts.length > 0) {
        html += '<div class="force-disposition">' + forceParts.join(' <span style="color:var(--border)">|</span> ') + '</div>';
      }

      // Badges
      html += '<div class="defcon-card-badges">';
      if (conflictCount > 0) {
        html += '<span class="conflict-badge">' + conflictCount + ' CONFLICT' + (conflictCount > 1 ? 'S' : '') + '</span>';
      }
      if (threatCount > 0) {
        html += '<span class="threat-count-badge">' + threatCount + ' THREAT' + (threatCount > 1 ? 'S' : '') + '</span>';
      }
      html += '</div>';

      // Pending migration
      if (ts.pendingMigration && ts.pendingMigration.assets.length > 0) {
        html += renderMigrationPanel(tid, ts.pendingMigration);
      }

      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  }

  function renderMigrationPanel(theaterId, migration) {
    var isCovert = migration.scope === 'covert';
    var headerText = isCovert ? 'COVERT ASSET RELOCATION PROPOSAL' : 'FORCE MIGRATION PROPOSAL';
    var borderColor = isCovert ? 'var(--amber)' : 'var(--severity-high)';
    var html = '<div class="migration-panel" style="border-color:' + borderColor + '">' +
      '<div class="migration-header" style="color:' + borderColor + '">' + headerText + '</div>' +
      '<div class="migration-assets">';

    for (var i = 0; i < migration.assets.length; i++) {
      var entry = migration.assets[i];
      var catInfo = typeof ASSET_CATEGORIES !== 'undefined' ? ASSET_CATEGORIES[entry.category] : null;
      var catColor = catInfo ? catInfo.color : 'var(--text)';

      html += '<div class="migration-asset-row">' +
        '<span style="color:' + catColor + ';font-weight:600">' + entry.name + '</span>' +
        '<span class="migration-dest">' + (entry.toStation || entry.toBaseName || '—') + '</span>' +
        '<span class="migration-eta">' + formatTransitTime(entry.transitMinutes) + '</span>' +
        '<button class="migration-remove" onclick="removeMigrationAsset(\'' + theaterId + '\',\'' + entry.id + '\')">✕</button>' +
      '</div>';
    }

    html += '</div>';
    html += '<div class="migration-actions">' +
      '<button class="op-action-btn execute" onclick="approveMigration(\'' + theaterId + '\')">APPROVE MIGRATION</button>' +
      '<button class="op-action-btn cancel" onclick="dismissMigration(\'' + theaterId + '\')">DISMISS</button>' +
    '</div>';
    html += '</div>';
    return html;
  }

  // --- Right Column: Crises ---

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

  // Re-render on events
  hook('crisis:spawned', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderSitroomCrises();
      renderSitroomGauges();
    }
  });

  hook('defcon:changed', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderDefconPanel();
      renderSitroomGauges();
    }
  });

  hook('conflict:spawned', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderDefconPanel();
      renderSitroomGauges();
    }
  });

  hook('conflict:resolved', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderDefconPanel();
      renderSitroomGauges();
    }
  });

  hook('tick:hour', function() {
    if (V.ui.activeWorkspace === 'sitroom') {
      renderDefconPanel();
    }
  });

})();
