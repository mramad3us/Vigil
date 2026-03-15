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
      // Save scroll positions before re-render
      var centerEl = $('sitroom-defcon');
      var savedCenterScroll = centerEl ? centerEl.scrollTop : 0;
      var migrationEl = document.querySelector('.migration-assets');
      var savedMigrationScroll = migrationEl ? migrationEl.scrollTop : 0;

      renderSitroomGauges();
      renderDefconPanel();
      renderSitroomCrises();

      // Restore scroll positions
      centerEl = $('sitroom-defcon');
      if (centerEl && savedCenterScroll > 0) centerEl.scrollTop = savedCenterScroll;
      migrationEl = document.querySelector('.migration-assets');
      if (migrationEl && savedMigrationScroll > 0) migrationEl.scrollTop = savedMigrationScroll;
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

    // --- Global Force Distribution ---
    html += renderForceDistribution();

    el.innerHTML = html;
  }

  // --- Global Force Distribution ---

  function renderForceDistribution() {
    // Count all assets per theater (active ones — STATIONED, DEPLOYED, COLLECTING, IN_TRANSIT)
    var theaterCounts = {};
    var totalAssets = 0;

    for (var tid in THEATERS) {
      theaterCounts[tid] = { total: 0, byCategory: {} };
    }
    theaterCounts['_IN_TRANSIT'] = { total: 0 };
    theaterCounts['_UNASSIGNED'] = { total: 0 };

    for (var i = 0; i < V.assets.length; i++) {
      var asset = V.assets[i];
      totalAssets++;

      if (asset.status === 'IN_TRANSIT') {
        theaterCounts['_IN_TRANSIT'].total++;
        continue;
      }

      var theaterId = typeof getAssetTheaterId === 'function' ? getAssetTheaterId(asset) : null;
      if (theaterId && theaterCounts[theaterId]) {
        theaterCounts[theaterId].total++;
        theaterCounts[theaterId].byCategory[asset.category] = (theaterCounts[theaterId].byCategory[asset.category] || 0) + 1;
      } else {
        theaterCounts['_UNASSIGNED'].total++;
      }
    }

    if (totalAssets === 0) return '';

    var html = '<div class="gauge-section-title" style="margin-top:var(--sp-4)">FORCE DISTRIBUTION</div>';
    html += '<div class="force-dist-panel">';

    // Stacked bar showing all theaters
    html += '<div class="force-dist-bar">';
    var theaterOrder = [];
    for (var t in THEATERS) theaterOrder.push(t);
    // Sort by count descending
    theaterOrder.sort(function(a, b) { return theaterCounts[b].total - theaterCounts[a].total; });

    for (var ti = 0; ti < theaterOrder.length; ti++) {
      var tId = theaterOrder[ti];
      var count = theaterCounts[tId].total;
      if (count === 0) continue;
      var pct = (count / totalAssets) * 100;
      var theaterColor = THEATERS[tId].color || 'var(--text-dim)';
      html += '<div class="force-dist-segment" style="width:' + pct + '%;background:' + theaterColor + '" data-tip="' + THEATERS[tId].shortName + ': ' + count + ' units (' + Math.round(pct) + '%)' + '" data-tip-align="bottom"></div>';
    }
    // In-transit segment
    if (theaterCounts['_IN_TRANSIT'].total > 0) {
      var transitPct = (theaterCounts['_IN_TRANSIT'].total / totalAssets) * 100;
      html += '<div class="force-dist-segment force-dist-transit" style="width:' + transitPct + '%" data-tip="In Transit: ' + theaterCounts['_IN_TRANSIT'].total + '" data-tip-align="bottom"></div>';
    }
    html += '</div>';

    // Legend rows
    html += '<div class="force-dist-legend">';
    for (var li = 0; li < theaterOrder.length; li++) {
      var lId = theaterOrder[li];
      var lCount = theaterCounts[lId].total;
      if (lCount === 0) continue;
      var lPct = Math.round((lCount / totalAssets) * 100);
      var lColor = THEATERS[lId].color || 'var(--text-dim)';
      html += '<div class="force-dist-row">' +
        '<span class="force-dist-swatch" style="background:' + lColor + '"></span>' +
        '<span class="force-dist-name">' + THEATERS[lId].shortName + '</span>' +
        '<span class="force-dist-count">' + lCount + '</span>' +
        '<span class="force-dist-pct">' + lPct + '%</span>' +
      '</div>';
    }
    if (theaterCounts['_IN_TRANSIT'].total > 0) {
      html += '<div class="force-dist-row">' +
        '<span class="force-dist-swatch force-dist-transit-swatch"></span>' +
        '<span class="force-dist-name">IN TRANSIT</span>' +
        '<span class="force-dist-count">' + theaterCounts['_IN_TRANSIT'].total + '</span>' +
        '<span class="force-dist-pct">' + Math.round((theaterCounts['_IN_TRANSIT'].total / totalAssets) * 100) + '%</span>' +
      '</div>';
    }
    html += '</div>';

    html += '<div class="force-dist-total">' + totalAssets + ' TOTAL ASSETS</div>';
    html += '</div>';
    return html;
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

      // Relocation buttons (DEFCON 3 or below) — always available to request more assets
      if (defcon <= 3 && !(ts.pendingMigration && ts.pendingMigration.assets.length > 0)) {
        html += '<div class="migration-request-btns">';
        html += '<button class="migration-request-btn covert" onclick="requestRelocation(\'' + tid + '\',\'covert\')">+ COVERT ASSETS</button>';
        if (defcon <= 2) {
          html += '<button class="migration-request-btn full" onclick="requestRelocation(\'' + tid + '\',\'full\')">+ MILITARY FORCES</button>';
        }
        html += '</div>';
      }

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

    // Count selected
    var selectedCount = 0;
    for (var si = 0; si < migration.assets.length; si++) {
      if (migration.assets[si].selected) selectedCount++;
    }

    var html = '<div class="migration-panel" style="border-color:' + borderColor + '">' +
      '<div class="migration-header" style="color:' + borderColor + '">' + headerText +
        '<span class="migration-selected-count">' + selectedCount + ' / ' + migration.assets.length + ' selected</span>' +
      '</div>' +
      '<div class="migration-assets">';

    // Group assets by source theater
    var byTheater = {};
    for (var i = 0; i < migration.assets.length; i++) {
      var entry = migration.assets[i];
      var src = entry.fromTheaterName || 'UNKNOWN';
      if (!byTheater[src]) byTheater[src] = [];
      byTheater[src].push(entry);
    }

    for (var theaterName in byTheater) {
      var group = byTheater[theaterName];
      html += '<div class="migration-group-header">FROM: ' + theaterName + '</div>';

      for (var gi = 0; gi < group.length; gi++) {
        var e = group[gi];
        var catInfo = typeof ASSET_CATEGORIES !== 'undefined' ? ASSET_CATEGORIES[e.category] : null;
        var catColor = catInfo ? catInfo.color : 'var(--text)';
        var catLabel = catInfo ? catInfo.shortLabel : e.category;
        var selectedCls = e.selected ? ' migration-row-selected' : '';
        var dest = e.destinations[e.selectedDestIdx];
        var destName = dest ? dest.name : '—';
        var eta = dest ? formatTransitTime(dest.transitMinutes) : '—';
        var hasMultipleDests = e.destinations.length > 1;

        html += '<div class="migration-asset-row' + selectedCls + '">' +
          '<div class="migration-row-check" onclick="toggleMigrationAsset(\'' + theaterId + '\',\'' + e.id + '\');renderSitroom()">' +
            '<span class="migration-checkbox">' + (e.selected ? '■' : '□') + '</span>' +
          '</div>' +
          '<div class="migration-row-info">' +
            '<div class="migration-row-name" style="color:' + catColor + '">' +
              '<span class="migration-cat-badge" style="background:' + catColor + '">' + catLabel + '</span>' +
              e.name +
              (e.deniability === 'COVERT' ? ' <span class="migration-covert-tag">COV</span>' : '') +
            '</div>' +
            '<div class="migration-row-route">' +
              '<span class="migration-from">' + e.fromBaseName + '</span>' +
              '<span class="migration-arrow">&rarr;</span>' +
              '<span class="migration-to">' + destName + '</span>' +
              (hasMultipleDests ? '<span class="migration-dest-nav">' +
                '<button class="migration-dest-btn" onclick="cycleMigrationDest(\'' + theaterId + '\',\'' + e.id + '\',-1);renderSitroom()">&lsaquo;</button>' +
                '<span class="migration-dest-idx">' + (e.selectedDestIdx + 1) + '/' + e.destinations.length + '</span>' +
                '<button class="migration-dest-btn" onclick="cycleMigrationDest(\'' + theaterId + '\',\'' + e.id + '\',1);renderSitroom()">&rsaquo;</button>' +
              '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="migration-row-eta">' + eta + '</div>' +
          '<button class="migration-remove" onclick="removeMigrationAsset(\'' + theaterId + '\',\'' + e.id + '\');renderSitroom()">✕</button>' +
        '</div>';
      }
    }

    html += '</div>';
    html += '<div class="migration-actions">' +
      '<button class="op-action-btn execute' + (selectedCount === 0 ? ' disabled" disabled' : '"') + ' onclick="approveMigration(\'' + theaterId + '\')">APPROVE (' + selectedCount + ')</button>' +
      '<button class="op-action-btn cancel" onclick="dismissMigration(\'' + theaterId + '\');renderSitroom()">DISMISS</button>' +
    '</div>';
    html += '</div>';
    return html;
  }

  // Expose render for inline onclick calls — preserves scroll positions
  window.renderSitroom = function() {
    // Save scroll positions before re-render
    var centerEl = $('sitroom-defcon');
    var savedCenterScroll = centerEl ? centerEl.scrollTop : 0;
    var migrationEl = document.querySelector('.migration-assets');
    var savedMigrationScroll = migrationEl ? migrationEl.scrollTop : 0;

    renderSitroomGauges();
    renderDefconPanel();
    renderSitroomCrises();

    // Restore scroll positions
    centerEl = $('sitroom-defcon');
    if (centerEl && savedCenterScroll > 0) centerEl.scrollTop = savedCenterScroll;
    migrationEl = document.querySelector('.migration-assets');
    if (migrationEl && savedMigrationScroll > 0) migrationEl.scrollTop = savedMigrationScroll;
  };

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
      var centerEl = $('sitroom-defcon');
      var savedScroll = centerEl ? centerEl.scrollTop : 0;
      renderDefconPanel();
      renderSitroomGauges();
      centerEl = $('sitroom-defcon');
      if (centerEl && savedScroll > 0) centerEl.scrollTop = savedScroll;
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
