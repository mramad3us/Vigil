/* ============================================================
   VIGIL — workspaces/operations/operations.js
   Operations board workspace: card grid, Vigil option cards,
   transit progress, debrief display.
   ============================================================ */

(function() {

  var _selectedOpId = null;

  registerWorkspace({
    id: 'operations',
    label: 'Operations',
    icon: '⬡',

    init: function() {
      var container = $('ws-operations');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:320px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">OPERATIONS BOARD</span>' +
              '<span class="ws-list-count" id="ops-count"></span>' +
            '</div>' +
            '<div class="ws-list-body" id="ops-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="ops-detail">' +
              '<div class="ws-detail-empty">Select an operation to view details</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderOpsList();
      if (_selectedOpId) renderOpsDetail(_selectedOpId);
    },
  });

  // --- Status Labels ---

  var STATUS_LABELS = {
    DETECTED: 'DETECTED',
    ANALYSIS: 'ANALYZING',
    OPTIONS_PRESENTED: 'AWAITING APPROVAL',
    APPROVED: 'APPROVED',
    ASSETS_IN_TRANSIT: 'ASSETS IN TRANSIT',
    EXECUTING: 'EXECUTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
  };

  var STATUS_CSS = {
    DETECTED: 'detected',
    ANALYSIS: 'analysis',
    OPTIONS_PRESENTED: 'options',
    APPROVED: 'approved',
    ASSETS_IN_TRANSIT: 'transit',
    EXECUTING: 'executing',
    SUCCESS: 'success',
    FAILURE: 'failure',
  };

  // --- Operations List ---

  function renderOpsList() {
    var listEl = $('ops-list');
    var countEl = $('ops-count');
    if (!listEl) return;

    var ops = V.operations.filter(function(op) {
      return op.status !== 'ARCHIVED' && op.status !== 'EXPIRED';
    });

    if (countEl) countEl.textContent = ops.length + ' active';

    var html = '<div class="ops-grid">';
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      var statusCls = STATUS_CSS[op.status] || op.status.toLowerCase();
      var selectedCls = op.id === _selectedOpId ? ' selected' : '';
      var statusLabel = STATUS_LABELS[op.status] || op.status;

      // Timer display
      var timerHtml = '';
      if (op.status === 'OPTIONS_PRESENTED' && op.expiresAt) {
        var minutesLeft = Math.max(0, op.expiresAt - V.time.totalMinutes);
        var hoursLeft = Math.round(minutesLeft / 60);
        var urgentCls = hoursLeft <= 6 ? ' urgent' : '';
        timerHtml = '<div class="op-timer' + urgentCls + '">' + hoursLeft + 'h left</div>';
      } else if (op.status === 'ASSETS_IN_TRANSIT' && op.transitDurationMinutes > 0) {
        var elapsed = V.time.totalMinutes - op.transitStartTotalMinutes;
        var pct = Math.min(100, Math.round((elapsed / op.transitDurationMinutes) * 100));
        timerHtml = '<div class="op-timer">' + pct + '% transit</div>';
      } else if (op.status === 'EXECUTING' && op.nextTransitionAt) {
        var execLeft = Math.max(0, op.nextTransitionAt - V.time.totalMinutes);
        timerHtml = '<div class="op-timer">' + formatTransitTime(execLeft) + ' exec</div>';
      } else if (op.status === 'ANALYSIS' && op.nextTransitionAt) {
        var anlsLeft = Math.max(0, op.nextTransitionAt - V.time.totalMinutes);
        timerHtml = '<div class="op-timer">' + formatTransitTime(anlsLeft) + '</div>';
      }

      // Threat pips
      var pipsHtml = '<div class="op-threat-level">';
      for (var p = 1; p <= 5; p++) {
        var filledCls = p <= op.threatLevel ? ' filled' : '';
        var highCls = op.threatLevel >= 4 && p <= op.threatLevel ? ' high' : '';
        pipsHtml += '<div class="op-threat-pip' + filledCls + highCls + '"></div>';
      }
      pipsHtml += '</div>';

      html += '<div class="op-card' + selectedCls + '" onclick="selectOperation(\'' + op.id + '\')">' +
        '<div class="op-status-dot ' + statusCls + '"></div>' +
        '<div class="op-card-content">' +
          '<div class="op-card-codename">' + op.codename + '</div>' +
          '<div class="op-card-label">' + op.label + ' · ' + (op.location ? op.location.city : '?') + '</div>' +
        '</div>' +
        '<div class="op-card-right">' +
          '<div class="op-status-chip ' + statusCls + '">' + statusLabel + '</div>' +
          timerHtml +
          pipsHtml +
        '</div>' +
      '</div>';
    }
    html += '</div>';

    if (ops.length === 0) {
      html = '<div class="ws-detail-empty" style="height:200px">No active operations</div>';
    }

    listEl.innerHTML = html;
  }

  // --- Operations Detail ---

  function renderOpsDetail(opId) {
    var detailEl = $('ops-detail');
    if (!detailEl) return;

    var op = getOp(opId);
    if (!op) {
      detailEl.innerHTML = '<div class="ws-detail-empty">Select an operation to view details</div>';
      return;
    }

    var statusCls = STATUS_CSS[op.status] || op.status.toLowerCase();
    var statusLabel = STATUS_LABELS[op.status] || op.status;

    var html =
      '<div class="op-detail-header">' +
        '<div class="op-detail-codename">' + op.codename + '</div>' +
        '<div class="op-status-chip ' + statusCls + '" style="font-size:var(--fs-sm);padding:4px 10px">' + statusLabel + '</div>' +
      '</div>';

    // Briefing
    html += '<div class="op-detail-section" style="margin-top:var(--sp-4)">' +
      '<div class="op-detail-section-title">BRIEFING</div>' +
      '<div class="op-detail-briefing">' + op.briefing + '</div>' +
    '</div>';

    // Details
    var opTypeLabel = op.operationType && OPERATION_TYPES[op.operationType] ? OPERATION_TYPES[op.operationType].label : op.category;
    html += '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">DETAILS</div>' +
      '<div class="feed-detail-meta">' +
        '<span class="feed-detail-meta-key">TYPE</span><span class="feed-detail-meta-val">' + opTypeLabel + '</span>' +
        '<span class="feed-detail-meta-key">LOCATION</span><span class="feed-detail-meta-val">' + (op.location ? op.location.city + ', ' + op.location.country : 'Unknown') + '</span>' +
        '<span class="feed-detail-meta-key">THEATER</span><span class="feed-detail-meta-val">' + (op.location && op.location.theater ? op.location.theater.name : '?') + '</span>' +
        '<span class="feed-detail-meta-key">THREAT</span><span class="feed-detail-meta-val">' + op.threatLevel + '/5</span>' +
      '</div>' +
    '</div>';

    // --- Status-specific content ---

    if (op.status === 'DETECTED' || op.status === 'ANALYSIS') {
      html += '<div class="op-detail-section">' +
        '<div class="op-detail-section-title">STATUS</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text-dim);line-height:2">' +
          (op.status === 'DETECTED' ? 'Threat detected. Vigil is preparing analysis...' : 'Vigil is analyzing threat data and generating deployment options...') +
          '<div class="vigil-analysis-bar"><div class="vigil-analysis-fill" style="width:' + getAnalysisProgress(op) + '%"></div></div>' +
        '</div>' +
      '</div>';
    }

    if (op.status === 'OPTIONS_PRESENTED') {
      html += renderVigilOptions(op);
    }

    if (op.status === 'ASSETS_IN_TRANSIT') {
      html += renderTransitProgress(op);
    }

    if (op.status === 'EXECUTING') {
      html += '<div class="op-detail-section">' +
        '<div class="op-detail-section-title">EXECUTION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--green);line-height:2">' +
          'Operation in progress. All assets on station in ' + op.location.city + '.' +
          '<div class="vigil-analysis-bar" style="margin-top:var(--sp-2)"><div class="vigil-analysis-fill" style="width:' + getExecProgress(op) + '%;background:var(--green)"></div></div>' +
        '</div>' +
      '</div>';
    }

    if (op.status === 'SUCCESS' || op.status === 'FAILURE') {
      if (op.debrief) {
        html += '<div class="op-detail-section">' +
          '<div class="op-detail-section-title">AFTER-ACTION REPORT</div>' +
          '<div class="debrief-container">' + op.debrief + '</div>' +
        '</div>';
      }
    }

    // Actions
    html += '<div class="op-actions">';

    if (op.status !== 'EXECUTING' && op.status !== 'ASSETS_IN_TRANSIT' && op.status !== 'SUCCESS' && op.status !== 'FAILURE' && op.status !== 'APPROVED') {
      html += '<button class="op-action-btn cancel" onclick="cancelOperation(\'' + op.id + '\')">CANCEL</button>';
    }

    if (op.geo) {
      html += '<button class="op-action-btn cancel" onclick="globeFlyTo(' + op.geo.lat + ',' + op.geo.lon + ')">VIEW ON GLOBE</button>';
    }

    html += '</div>';

    detailEl.innerHTML = html;
  }

  // --- Vigil Option Cards ---

  function renderVigilOptions(op) {
    if (!op.options || op.options.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">VIGIL DEPLOYMENT OPTIONS</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);margin-bottom:var(--sp-3)">Select a deployment option to proceed. Vigil recommendation is highlighted.</div>' +
      '<div class="vigil-options">';

    for (var i = 0; i < op.options.length; i++) {
      var opt = op.options[i];
      var recCls = opt.isRecommended ? ' vigil-recommended' : '';
      var riskCls = 'risk-' + opt.riskLevel.toLowerCase();

      html += '<div class="vigil-option-card' + recCls + '">';

      if (opt.isRecommended) {
        html += '<div class="vigil-rec-badge">★ VIGIL RECOMMENDED</div>';
      }

      html += '<div class="vigil-option-label">' + opt.label + '</div>';

      // Risk and confidence
      html += '<div class="vigil-option-stats">' +
        '<div class="vigil-stat">' +
          '<span class="vigil-stat-label">CONFIDENCE</span>' +
          '<span class="vigil-stat-value" style="color:' + confColor(opt.confidencePercent) + '">' + opt.confidencePercent + '%</span>' +
        '</div>' +
        '<div class="vigil-stat">' +
          '<span class="vigil-stat-label">RISK</span>' +
          '<span class="vigil-stat-value ' + riskCls + '">' + opt.riskLevel + '</span>' +
        '</div>' +
        '<div class="vigil-stat">' +
          '<span class="vigil-stat-label">ETA</span>' +
          '<span class="vigil-stat-value">' + formatTransitTime(opt.transitTimeMinutes) + '</span>' +
        '</div>' +
      '</div>';

      // Assets list
      html += '<div class="vigil-option-assets">';
      var assets = getAssetsByIds(opt.assetIds);
      for (var a = 0; a < assets.length; a++) {
        var asset = assets[a];
        var catInfo = ASSET_CATEGORIES[asset.category] || {};
        var base = getBase(asset.currentBaseId || asset.homeBaseId);
        html += '<div class="vigil-asset-row">' +
          '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
          '<span class="vigil-asset-name">' + asset.name + '</span>' +
          '<span class="vigil-asset-base">' + (base ? base.city + ', ' + base.country : '') + '</span>' +
        '</div>';
      }
      html += '</div>';

      // Consequences
      if (opt.consequences) {
        html += '<div class="vigil-option-consequences">' + opt.consequences + '</div>';
      }

      html += '<button class="op-action-btn execute vigil-select-btn" onclick="approveOption(\'' + op.id + '\',' + i + ')">SELECT THIS OPTION</button>';

      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // --- Transit Progress ---

  function renderTransitProgress(op) {
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">ASSET TRANSIT</div>' +
      '<div class="transit-assets">';

    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;

      var catInfo = ASSET_CATEGORIES[asset.category] || {};
      var pct = 100;
      var statusText = 'ON STATION';

      if (asset.status === 'IN_TRANSIT' && asset.transitDurationMinutes > 0) {
        var elapsed = V.time.totalMinutes - asset.transitStartTotalMinutes;
        pct = Math.min(100, Math.round((elapsed / asset.transitDurationMinutes) * 100));
        var remaining = Math.max(0, asset.transitDurationMinutes - elapsed);
        statusText = formatTransitTime(remaining) + ' remaining';
      } else if (asset.status === 'DEPLOYED') {
        statusText = 'DEPLOYED';
      }

      html += '<div class="transit-asset-row">' +
        '<div class="transit-asset-info">' +
          '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
          '<span class="vigil-asset-name">' + asset.name + '</span>' +
        '</div>' +
        '<div class="transit-bar-wrap">' +
          '<div class="transit-bar"><div class="transit-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="transit-status">' + statusText + '</span>' +
        '</div>' +
      '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // --- Helpers ---

  function getAnalysisProgress(op) {
    if (!op.nextTransitionAt) return 0;
    // Estimate based on a 3-hour default analysis time
    var totalDuration = 180; // 3 hours in minutes
    var remaining = op.nextTransitionAt - V.time.totalMinutes;
    var elapsed = totalDuration - remaining;
    return clamp(Math.round((elapsed / totalDuration) * 100), 0, 100);
  }

  function getExecProgress(op) {
    if (!op.nextTransitionAt || !op.execDurationMinutes) return 0;
    var remaining = op.nextTransitionAt - V.time.totalMinutes;
    var elapsed = op.execDurationMinutes - remaining;
    return clamp(Math.round((elapsed / op.execDurationMinutes) * 100), 0, 100);
  }

  function confColor(pct) {
    if (pct >= 70) return 'var(--green)';
    if (pct >= 50) return 'var(--amber)';
    return 'var(--red)';
  }

  // --- Global functions ---

  window.selectOperation = function(opId) {
    _selectedOpId = opId;
    renderOpsList();
    renderOpsDetail(opId);
  };

  // Re-render on state changes
  hook('operation:spawned', function() {
    if (V.ui.activeWorkspace === 'operations') {
      renderOpsList();
    }
  });

  hook('operation:resolved', function() {
    if (V.ui.activeWorkspace === 'operations') {
      renderOpsList();
      if (_selectedOpId) renderOpsDetail(_selectedOpId);
    }
  });

})();
