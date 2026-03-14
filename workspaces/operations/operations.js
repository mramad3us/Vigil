/* ============================================================
   VIGIL — workspaces/operations/operations.js
   Operations board workspace: card grid, detail panel.
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

  // --- Operations List ---

  function renderOpsList() {
    var listEl = $('ops-list');
    var countEl = $('ops-count');
    if (!listEl) return;

    // Filter out archived/expired
    var ops = V.operations.filter(function(op) {
      return op.status !== 'ARCHIVED' && op.status !== 'EXPIRED';
    });

    if (countEl) countEl.textContent = ops.length + ' active';

    var html = '<div class="ops-grid">';
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      var statusCls = op.status.toLowerCase();
      var selectedCls = op.id === _selectedOpId ? ' selected' : '';

      // Timer display
      var timerHtml = '';
      if (op.status === 'INCOMING' || op.status === 'READY') {
        var urgentCls = op.urgencyLeft <= 3 ? ' urgent' : '';
        timerHtml = '<div class="op-timer' + urgentCls + '">' + op.urgencyLeft + 'd left</div>';
      } else if (op.status === 'INVESTIGATING') {
        timerHtml = '<div class="op-timer">' + op.invDaysLeft + 'd inv</div>';
      } else if (op.status === 'EXECUTING') {
        timerHtml = '<div class="op-timer">' + op.execDaysLeft + 'd exec</div>';
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
          '<div class="op-status-chip ' + statusCls + '">' + op.status + '</div>' +
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

    var statusCls = op.status.toLowerCase();

    var html =
      '<div class="op-detail-header">' +
        '<div class="op-detail-codename">' + op.codename + '</div>' +
        '<div class="op-status-chip ' + statusCls + '" style="font-size:var(--fs-sm);padding:4px 10px">' + op.status + '</div>' +
      '</div>';

    // Meta info
    html += '<div class="op-detail-section" style="margin-top:var(--sp-4)">' +
      '<div class="op-detail-section-title">BRIEFING</div>' +
      '<div class="op-detail-briefing">' + op.briefing + '</div>' +
    '</div>';

    // Location & details
    html += '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">DETAILS</div>' +
      '<div class="feed-detail-meta">' +
        '<span class="feed-detail-meta-key">CATEGORY</span><span class="feed-detail-meta-val">' + op.category + '</span>' +
        '<span class="feed-detail-meta-key">LOCATION</span><span class="feed-detail-meta-val">' + (op.location ? op.location.city + ', ' + op.location.country : 'Unknown') + '</span>' +
        '<span class="feed-detail-meta-key">THEATER</span><span class="feed-detail-meta-val">' + (op.location && op.location.theater ? op.location.theater.name : '?') + '</span>' +
        '<span class="feed-detail-meta-key">THREAT</span><span class="feed-detail-meta-val">' + op.threatLevel + '/5</span>' +
        '<span class="feed-detail-meta-key">BUDGET REQ</span><span class="feed-detail-meta-val">$' + op.baseBudget + 'M</span>' +
        '<span class="feed-detail-meta-key">DEADLINE</span><span class="feed-detail-meta-val">' + op.urgencyLeft + ' days</span>' +
      '</div>' +
    '</div>';

    // Intel fields
    html += '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">INTELLIGENCE</div>' +
      '<div class="intel-fields">';

    for (var i = 0; i < op.intelFields.length; i++) {
      var field = op.intelFields[i];
      var valCls = field.revealed ? 'revealed' : 'hidden';
      var valText = field.revealed ? field.value : '[UNCONFIRMED]';
      html += '<div class="intel-field-row">' +
        '<div class="intel-field-key">' + field.label + '</div>' +
        '<div class="intel-field-val ' + valCls + '">' + valText + '</div>' +
      '</div>';
    }
    html += '</div></div>';

    // Actions based on status
    html += '<div class="op-actions">';

    if (op.status === 'INCOMING') {
      // Department assignment
      html += '<div style="width:100%">' +
        '<div class="op-detail-section-title" style="margin-bottom:var(--sp-2)">ASSIGN DEPARTMENT</div>' +
        '<div class="dept-grid">';

      for (var d = 0; d < DEPT_CONFIG.length; d++) {
        var dept = DEPT_CONFIG[d];
        var avail = deptAvail(dept.id);
        var unavailCls = avail < 1 ? ' unavailable' : '';
        html += '<div class="dept-chip' + unavailCls + '" onclick="' + (avail > 0 ? "assignInvestigation('" + op.id + "','" + dept.id + "')" : '') + '">' +
          '<div>' + dept.short + '</div>' +
          '<div class="dept-chip-avail">' + avail + '/' + deptCapacity(dept.id) + '</div>' +
        '</div>';
      }

      html += '</div></div>';
    }

    if (op.status === 'READY') {
      var prob = calcOpProb(op);
      html += '<div style="width:100%;text-align:center;margin-bottom:var(--sp-3)">' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim)">SUCCESS PROBABILITY</div>' +
        '<div style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:700;color:' + (prob >= 60 ? 'var(--green)' : prob >= 40 ? 'var(--amber)' : 'var(--red)') + '">' + prob + '%</div>' +
      '</div>' +
      '<button class="op-action-btn execute" onclick="executeOperation(\'' + op.id + '\')">EXECUTE OPERATION ($' + op.baseBudget + 'M)</button>';
    }

    if (op.status !== 'EXECUTING' && op.status !== 'SUCCESS' && op.status !== 'FAILURE') {
      html += '<button class="op-action-btn cancel" onclick="cancelOperation(\'' + op.id + '\')">CANCEL</button>';
    }

    html += '</div>';

    detailEl.innerHTML = html;
  }

  // --- Global functions ---

  window.selectOperation = function(opId) {
    _selectedOpId = opId;
    renderOpsList();
    renderOpsDetail(opId);
  };

  // Re-render ops after state changes
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
