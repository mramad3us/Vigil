/* ============================================================
   VIGIL — workspaces/operations/operations.js
   Operations board workspace: card grid, Vigil option cards,
   progressive intel, asset detail dropdowns, transit progress,
   debrief display, ops archive.
   ============================================================ */

(function() {

  var _selectedOpId = null;
  var _showArchive = false;
  var _expandedAssets = {}; // track which asset rows are expanded in option cards

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

  // Difficulty color coding
  var DIFF_COLORS = {
    EASY: 'var(--green)',
    MEDIUM: 'var(--amber)',
    HARD: 'var(--severity-high)',
    VERY_HARD: 'var(--red)',
  };

  // --- Operations List ---

  function renderOpsList() {
    var listEl = $('ops-list');
    var countEl = $('ops-count');
    if (!listEl) return;

    var activeOps = V.operations.filter(function(op) {
      return op.status !== 'ARCHIVED' && op.status !== 'EXPIRED' && op.status !== 'SUCCESS' && op.status !== 'FAILURE';
    });

    var completedOps = V.operations.filter(function(op) {
      return op.status === 'SUCCESS' || op.status === 'FAILURE';
    });

    if (countEl) countEl.textContent = activeOps.length + ' active';

    var html = '';

    // Active ops
    html += '<div class="ops-grid">';
    for (var i = 0; i < activeOps.length; i++) {
      html += renderOpCard(activeOps[i]);
    }
    html += '</div>';

    if (activeOps.length === 0) {
      html = '<div class="ws-detail-empty" style="height:120px">No active operations</div>';
    }

    // Completed ops (last up to 10)
    if (completedOps.length > 0) {
      html += '<div class="ops-archive-header" onclick="toggleOpsArchive()">' +
        '<span class="ops-archive-toggle">' + (_showArchive ? '▾' : '▸') + '</span>' +
        '<span class="ops-archive-title">ARCHIVE</span>' +
        '<span class="ops-archive-count">' + completedOps.length + '</span>' +
      '</div>';

      if (_showArchive) {
        var archiveOps = completedOps.slice(0, 10);
        html += '<div class="ops-grid ops-archive-grid">';
        for (var j = 0; j < archiveOps.length; j++) {
          html += renderOpCard(archiveOps[j]);
        }
        html += '</div>';
      }
    }

    listEl.innerHTML = html;
  }

  function renderOpCard(op) {
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

    return '<div class="op-card' + selectedCls + '" onclick="selectOperation(\'' + op.id + '\')"' +
      ' data-tip="' + escTip(op.label + ' · ' + (op.location ? op.location.city + ', ' + op.location.country : '?') + ' · Threat ' + op.threatLevel + '/5') + '"' +
      ' data-tip-align="right">' +
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
    var opTypeDef = op.operationType && OPERATION_TYPES[op.operationType] ? OPERATION_TYPES[op.operationType] : null;
    var opTypeLabel = opTypeDef ? opTypeDef.label : op.category;

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

    // Details — expanded
    html += '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">OPERATION DETAILS</div>' +
      '<div class="intel-fields">';

    html += intelRow('OPERATION TYPE', opTypeLabel);
    html += intelRow('CODENAME', op.codename);
    html += intelRow('CLASSIFICATION', 'TOP SECRET // SCI // VIGIL');
    html += intelRow('LOCATION', op.location ? op.location.city + ', ' + op.location.country : 'Unknown');
    html += intelRow('THEATER', op.location && op.location.theater ? op.location.theater.name : '?');
    html += intelRow('THREAT LEVEL', op.threatLevel + '/5');
    if (op.orgName) {
      html += intelRow('THREAT ACTOR', op.orgName);
    }
    if (op.targetAlias) {
      html += intelRow('TARGET ALIAS', op.targetAlias);
    }
    html += intelRow('URGENCY', op.urgencyHours ? op.urgencyHours + 'h operational window' : 'STANDARD');
    html += intelRow('BUDGET ESTIMATE', '$' + (op.budgetCost || '?') + 'M');
    html += intelRow('DAY DETECTED', 'Day ' + op.daySpawned);

    html += '</div></div>';

    // --- Intel Section (from threat intel fields) ---
    if (op.intelFields && op.intelFields.length > 0) {
      html += renderIntelSection(op);
    }

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
      // Show assigned assets
      html += renderAssignedAssets(op);

      html += '<div class="op-detail-section">' +
        '<div class="op-detail-section-title">EXECUTION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--green);line-height:2">' +
          'Operation in progress. All assets on station in ' + op.location.city + '.' +
          '<div class="vigil-analysis-bar" style="margin-top:var(--sp-2)"><div class="vigil-analysis-fill" style="width:' + getExecProgress(op) + '%;background:var(--green)"></div></div>' +
        '</div>' +
      '</div>';
    }

    if (op.status === 'SUCCESS' || op.status === 'FAILURE') {
      // Show assigned assets summary
      html += renderAssignedAssets(op);

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

  // --- Intel Fields (tick-based, from threat) ---

  function renderIntelSection(op) {
    var fields = op.intelFields;
    var revealedCount = 0;
    for (var c = 0; c < fields.length; c++) {
      if (fields[c].revealed) revealedCount++;
    }

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">INTELLIGENCE PACKAGE</div>' +
      '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);margin-bottom:var(--sp-3)">' +
        revealedCount + '/' + fields.length + ' fields resolved · Transferred from intel collection phase' +
      '</div>' +
      '<div class="intel-fields">';

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var diffColor = DIFF_COLORS[field.difficulty] || 'var(--text-dim)';

      if (field.revealed) {
        html += '<div class="intel-field-row">' +
          '<span class="intel-field-key">' +
            '<span class="intel-source-tag" style="color:' + diffColor + '">' + field.source + '</span> ' +
            field.label +
          '</span>' +
          '<span class="intel-field-val revealed">' + field.value + '</span>' +
        '</div>';
      } else {
        // Show progress bar for unrevealed fields
        var pct = field.ticksToReveal > 0 ? Math.round((field.ticksAccumulated / field.ticksToReveal) * 100) : 0;
        pct = Math.min(pct, 99); // Never show 100% if not revealed

        html += '<div class="intel-field-row">' +
          '<span class="intel-field-key">' +
            '<span class="intel-source-tag" style="color:' + diffColor + '">' + field.source + '</span> ' +
            field.label +
          '</span>' +
          '<span class="intel-field-val hidden">' +
            '<span class="intel-progress-wrap">' +
              '<span class="intel-progress-bar"><span class="intel-progress-fill" style="width:' + pct + '%;background:' + diffColor + '"></span></span>' +
              '<span class="intel-progress-label">' + pct + '% · ' + field.difficulty.replace('_', ' ') + '</span>' +
            '</span>' +
          '</span>' +
        '</div>';
      }
    }

    html += '</div></div>';
    return html;
  }

  // --- Assigned Assets Summary ---

  function renderAssignedAssets(op) {
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

    var html = '<div class="op-detail-section">' +
      '<div class="op-detail-section-title">ASSIGNED ASSETS</div>' +
      '<div class="vigil-option-assets">';

    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;
      html += renderAssetRow(asset, false);
    }

    html += '</div></div>';
    return html;
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

      // Description if available
      if (opt.description) {
        html += '<div style="font-size:var(--fs-xs);color:var(--text-dim);line-height:1.6;margin-bottom:var(--sp-3)">' + opt.description + '</div>';
      }

      // Stats row
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
        '<div class="vigil-stat">' +
          '<span class="vigil-stat-label">ASSETS</span>' +
          '<span class="vigil-stat-value">' + opt.assetIds.length + '</span>' +
        '</div>' +
      '</div>';

      // Assets list with expandable detail
      html += '<div class="vigil-option-assets">';
      var assets = getAssetsByIds(opt.assetIds);
      for (var a = 0; a < assets.length; a++) {
        var asset = assets[a];
        var expandKey = op.id + '-' + i + '-' + asset.id;
        var isExpanded = _expandedAssets[expandKey];
        html += renderAssetRow(asset, true, expandKey, isExpanded);
      }
      html += '</div>';

      // Consequences
      if (opt.consequences) {
        html += '<div class="vigil-option-consequences">' + opt.consequences + '</div>';
      }

      // Diplomatic assessment
      if (op.location && op.location.country && op.location.country !== 'United States' && typeof getCountryStance === 'function') {
        var opCountry = op.location.country;
        var opStance = getCountryStance(opCountry);
        var opPerms = typeof getCountryPermissions === 'function' ? getCountryPermissions(opCountry) : {};

        // Check if this option has overt assets
        var optHasOvert = false;
        for (var oa = 0; oa < assets.length; oa++) {
          if (assets[oa].deniability === 'OVERT') { optHasOvert = true; break; }
        }

        if (optHasOvert && !opPerms.overtOps) {
          html += '<div class="vigil-option-consequences" style="color:var(--red);border-color:var(--red);background:var(--red-dim)">' +
            'DIPLOMATIC WARNING: Deploying overt assets to ' + opCountry + ' (' + opStance.label + ') without clearance will constitute a sovereignty violation. ' +
            'Expected stance impact: ' + (opPerms.overtOps ? 'minimal' : 'SEVERE (-3 to -5 levels)') + '.' +
          '</div>';
        } else if (optHasOvert) {
          html += '<div class="vigil-option-consequences" style="color:var(--green);border-color:var(--green);background:var(--green-dim)">' +
            'AUTHORIZED: ' + opCountry + ' (' + opStance.label + ') permits overt operations.' +
          '</div>';
        }
      }

      html += '<button class="op-action-btn execute vigil-select-btn" onclick="approveOption(\'' + op.id + '\',' + i + ')">SELECT THIS OPTION</button>';

      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // --- Asset Row with Expandable Detail ---

  function renderAssetRow(asset, expandable, expandKey, isExpanded) {
    var catInfo = ASSET_CATEGORIES[asset.category] || {};
    var base = getBase(asset.currentBaseId || asset.homeBaseId);
    var catClass = asset.category.toLowerCase();

    var html = '<div class="vigil-asset-row' + (expandable ? ' expandable' : '') + '"' +
      (expandable ? ' onclick="toggleAssetExpand(\'' + expandKey + '\')"' : '') + '>' +
      '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
      '<span class="vigil-asset-name">' + asset.name + '</span>' +
      (asset.deniability ? '<span style="font-family:var(--font-mono);font-size:8px;padding:1px 4px;border-radius:2px;color:' + (DENIABILITY_DISPLAY[asset.deniability] || DENIABILITY_DISPLAY.OVERT).color + '">' + asset.deniability + '</span>' : '') +
      '<span class="vigil-asset-base">' + (base ? base.city + ', ' + base.country : '') + '</span>' +
      (expandable ? '<span class="asset-expand-icon">' + (isExpanded ? '▾' : '▸') + '</span>' : '') +
    '</div>';

    if (isExpanded) {
      html += renderAssetDetail(asset);
    }

    return html;
  }

  function renderAssetDetail(asset) {
    var catInfo = ASSET_CATEGORIES[asset.category] || {};
    var base = getBase(asset.homeBaseId);
    var readinessColor = asset.readiness === 'TIER_1' ? 'var(--red)' : asset.readiness === 'TIER_2' ? 'var(--amber)' : 'var(--green)';

    var html = '<div class="asset-detail-card">';

    // Header
    html += '<div class="asset-detail-header">' +
      '<div class="asset-detail-name">' + asset.name + '</div>' +
      '<div class="asset-detail-designation">' + (asset.designation || '') + '</div>' +
    '</div>';

    // Key stats
    html += '<div class="asset-detail-stats">';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">CATEGORY</span><span class="asset-detail-stat-val" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.label || asset.category) + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">PLATFORM</span><span class="asset-detail-stat-val">' + (asset.platform || '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">PERSONNEL</span><span class="asset-detail-stat-val">' + (asset.personnel ? asset.personnel.toLocaleString() : '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">READINESS</span><span class="asset-detail-stat-val" style="color:' + readinessColor + '">' + (asset.readiness || 'FULL').replace('_', ' ') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">HOME BASE</span><span class="asset-detail-stat-val">' + (base ? base.name : '—') + '</span></div>';
    html += '<div class="asset-detail-stat"><span class="asset-detail-stat-label">SPEED</span><span class="asset-detail-stat-val">' + (asset.speed > 0 ? asset.speed + ' km/h' : 'REMOTE') + '</span></div>';
    html += '</div>';

    // Description
    if (asset.description) {
      html += '<div class="asset-detail-desc">' + asset.description + '</div>';
    }

    // Unit composition
    if (asset.unitComposition) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">UNIT COMPOSITION</div>' +
        '<div class="asset-detail-subsection-text">' + asset.unitComposition + '</div>' +
      '</div>';
    }

    // Vehicles
    if (asset.vehicles && asset.vehicles.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">VEHICLES & PLATFORMS</div>' +
        '<div class="asset-detail-list">';
      for (var v = 0; v < asset.vehicles.length; v++) {
        html += '<div class="asset-detail-list-item">' + asset.vehicles[v] + '</div>';
      }
      html += '</div></div>';
    }

    // Equipment
    if (asset.equipment && asset.equipment.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">EQUIPMENT & SYSTEMS</div>' +
        '<div class="asset-detail-list">';
      for (var e = 0; e < asset.equipment.length; e++) {
        html += '<div class="asset-detail-list-item">' + asset.equipment[e] + '</div>';
      }
      html += '</div></div>';
    }

    // Capabilities
    if (asset.capabilities && asset.capabilities.length > 0) {
      html += '<div class="asset-detail-subsection">' +
        '<div class="asset-detail-subsection-title">CAPABILITIES</div>' +
        '<div class="asset-detail-caps">';
      for (var c = 0; c < asset.capabilities.length; c++) {
        html += '<span class="tip-tag ' + (catInfo.shortLabel || '').toLowerCase() + '">' + asset.capabilities[c] + '</span>';
      }
      html += '</div></div>';
    }

    html += '</div>';
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

      html += '<div class="transit-asset-row"' +
        ' data-tip="' + escTip(asset.designation + ' · ' + (asset.personnel || '?') + ' personnel · ' + (asset.platform || '?')) + '"' +
        ' data-tip-align="right">' +
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

  function intelRow(key, val) {
    return '<div class="intel-field-row">' +
      '<span class="intel-field-key">' + key + '</span>' +
      '<span class="intel-field-val">' + val + '</span>' +
    '</div>';
  }

  function escTip(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
  }

  function getAnalysisProgress(op) {
    if (!op.nextTransitionAt) return 0;
    var totalDuration = op.phaseDuration || 180;
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

  window.toggleOpsArchive = function() {
    _showArchive = !_showArchive;
    renderOpsList();
  };

  window.toggleAssetExpand = function(key) {
    _expandedAssets[key] = !_expandedAssets[key];
    if (_selectedOpId) renderOpsDetail(_selectedOpId);
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
