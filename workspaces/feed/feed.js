/* ============================================================
   VIGIL — workspaces/feed/feed.js
   Intelligence feed workspace: active threats dashboard,
   threat intel management, collection asset deployment,
   and scrolling notification feed.
   ============================================================ */

(function() {

  var _selectedFeedId = null;
  var _selectedThreatId = null;
  var _feedFilter = 'UNREAD';
  var _renderedIds = {};
  var _showDeployPanel = false;
  var _deploySortMode = 'EFFECTIVENESS';
  var _deployCovertFilter = false;
  var _expandedCollectors = {};

  function formatTimeRemaining(hours) {
    if (hours < 48) return hours + 'h';
    var days = Math.round(hours / 24);
    if (days < 30) return days + 'd';
    var months = Math.round(days / 30);
    return months + 'mo';
  }

  // Difficulty colors (same as ops)
  var DIFF_COLORS = {
    EASY: 'var(--green)',
    MEDIUM: 'var(--amber)',
    HARD: 'var(--severity-high)',
    VERY_HARD: 'var(--red)',
  };

  registerWorkspace({
    id: 'feed',
    label: 'Intel Feed',
    icon: '⫘',

    init: function() {
      var container = $('ws-feed');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:320px;max-width:400px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">INTELLIGENCE FEED</span>' +
              '<span class="ws-list-count" id="feed-count"></span>' +
            '</div>' +
            '<div class="ws-toolbar" id="feed-toolbar"></div>' +
            '<div class="ws-list-body" id="feed-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="feed-detail">' +
              '<div class="ws-detail-empty">Select an intelligence item to view details</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderFeedList();
      renderFeedToolbar();
      if (_selectedThreatId) {
        renderThreatDetail(_selectedThreatId);
      } else if (_selectedFeedId) {
        renderFeedDetail(_selectedFeedId);
      }
    },
  });

  // =================================================================
  //  FEED LIST — Active threats section + notification feed
  // =================================================================

  function renderFeedList() {
    var listEl = $('feed-list');
    var countEl = $('feed-count');
    if (!listEl) return;

    // Validate selected threat is still in INTEL phase
    if (_selectedThreatId) {
      var selThreat = typeof getThreat === 'function' ? getThreat(_selectedThreatId) : null;
      if (!selThreat || selThreat.phase !== 'INTEL') {
        _selectedThreatId = null;
      }
    }

    var html = '';

    // --- Active INTEL-phase threats section ---
    var intelThreats = typeof getIntelThreats === 'function' ? getIntelThreats() : [];

    if (intelThreats.length > 0) {
      html += '<div class="feed-section-header">ACTIVE THREATS · ' + intelThreats.length + '</div>';
      for (var t = 0; t < intelThreats.length; t++) {
        html += renderThreatCard(intelThreats[t]);
      }
      html += '<div class="feed-section-divider"></div>';
    }

    // --- Notification feed items ---
    var items = getFilteredFeed();
    if (countEl) {
      var unread = 0;
      for (var u = 0; u < V.feed.length; u++) { if (!V.feed[u].read) unread++; }
      countEl.textContent = (intelThreats.length > 0 ? intelThreats.length + ' threats · ' : '') + unread + ' unread';
    }

    if (_feedFilter !== 'THREATS') {
      html += '<div class="feed-section-header">FEED</div>';
      for (var i = 0; i < items.length && i < 100; i++) {
        var item = items[i];
        var severityCls = (item.severity || 'routine').toLowerCase();
        var selectedCls = item.id === _selectedFeedId && !_selectedThreatId ? ' selected' : '';
        var unreadCls = item.read ? '' : ' unread';
        var newCls = _renderedIds[item.id] ? '' : ' new-item';

        html += '<div class="feed-item' + selectedCls + unreadCls + newCls + '" onclick="selectFeedItem(\'' + item.id + '\')">' +
          '<div class="feed-severity ' + severityCls + '"></div>' +
          '<div class="feed-item-content">' +
            '<div class="feed-item-header">' + item.header + '</div>' +
            '<div class="feed-item-meta">' +
              '<span class="feed-item-type">' + (item.type || 'INTEL') + '</span>' +
              '<span>' + formatTimestamp(item.timestamp) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      if (items.length === 0 && intelThreats.length === 0) {
        html += '<div class="ws-detail-empty" style="height:200px">No intelligence items</div>';
      }
    }

    listEl.innerHTML = html;

    // Track rendered IDs
    for (var j = 0; j < items.length && j < 100; j++) {
      _renderedIds[items[j].id] = true;
    }
    var newItems = listEl.querySelectorAll('.new-item');
    for (var k = 0; k < newItems.length; k++) {
      (function(el) {
        el.addEventListener('animationend', function() {
          el.classList.remove('new-item');
        });
      })(newItems[k]);
    }
  }

  // --- Threat Card in Feed List ---

  function renderThreatCard(threat) {
    var selectedCls = threat.id === _selectedThreatId ? ' selected' : '';
    var progress = typeof getThreatIntelProgress === 'function' ? getThreatIntelProgress(threat) : { revealed: 0, total: 0, pct: 0 };
    var timeInfo = typeof getThreatTimeRemaining === 'function' ? getThreatTimeRemaining(threat) : { hours: '?', pct: 100 };
    var urgentCls = timeInfo.pct <= 20 ? ' threat-urgent' : timeInfo.pct <= 40 ? ' threat-warning' : '';

    var hasCollectors = threat.collectorAssetIds && threat.collectorAssetIds.length > 0;
    var collectingLabel = hasCollectors ? ' · ' + threat.collectorAssetIds.length + ' asset' + (threat.collectorAssetIds.length > 1 ? 's' : '') : '';

    return '<div class="feed-threat-card' + selectedCls + urgentCls + '" onclick="selectThreatItem(\'' + threat.id + '\')">' +
      '<div class="feed-threat-top">' +
        '<div class="feed-threat-name">' + threat.orgName + '</div>' +
        '<div class="feed-threat-level">' + threat.threatLevel + '/5</div>' +
        (threat.domestic ? '<div class="feed-threat-urgent-badge" style="background:#d4a04a;color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;letter-spacing:0.5px">DOMESTIC</div>' : '') +
        (threat.urgent ? '<div class="feed-threat-urgent-badge" style="background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;letter-spacing:0.5px">URGENT</div>' : '') +
      '</div>' +
      '<div class="feed-threat-type">' + threat.typeLabel + ' · ' + threat.location.city + ', ' + threat.location.country + '</div>' +
      (threat.foreignTarget && threat.foreignTarget.country !== 'United States' ? '<div class="feed-threat-foreign-target">NON-US TARGET: ' + (threat.foreignTarget.city ? threat.foreignTarget.city + ', ' : '') + threat.foreignTarget.country + '</div>' : '') +
      (threat.foreignTarget && threat.foreignTarget.country === 'United States' ? '<div class="feed-threat-foreign-target" style="color:var(--red)">HOMELAND TARGET: ' + (threat.foreignTarget.city || 'United States') + '</div>' : '') +
      '<div class="feed-threat-bars">' +
        '<div class="feed-threat-bar-row">' +
          '<span class="feed-threat-bar-label">INTEL</span>' +
          '<div class="feed-threat-bar"><div class="feed-threat-bar-fill intel" style="width:' + progress.pct + '%"></div></div>' +
          '<span class="feed-threat-bar-val">' + progress.revealed + '/' + progress.total + '</span>' +
        '</div>' +
        '<div class="feed-threat-bar-row">' +
          '<span class="feed-threat-bar-label">TIME</span>' +
          '<div class="feed-threat-bar"><div class="feed-threat-bar-fill time' + (timeInfo.pct <= 20 ? ' critical' : timeInfo.pct <= 40 ? ' warning' : '') + '" style="width:' + (100 - timeInfo.pct) + '%"></div></div>' +
          '<span class="feed-threat-bar-val">' + formatTimeRemaining(timeInfo.hours) + '</span>' +
        '</div>' +
      '</div>' +
      (hasCollectors ? '<div class="feed-threat-collecting">COLLECTING' + collectingLabel + '</div>' : '') +
    '</div>';
  }

  // --- Feed Toolbar ---

  function renderFeedToolbar() {
    var toolbar = $('feed-toolbar');
    if (!toolbar) return;

    var filters = ['UNREAD', 'THREATS', 'CRITICAL', 'HIGH', 'ALL'];
    var html = '<div class="feed-filters">';
    for (var i = 0; i < filters.length; i++) {
      var activeCls = _feedFilter === filters[i] ? ' active' : '';
      html += '<button class="feed-filter' + activeCls + '" onclick="setFeedFilter(\'' + filters[i] + '\')">' + filters[i] + '</button>';
    }
    html += '</div>';
    toolbar.innerHTML = html;
  }

  // =================================================================
  //  THREAT DETAIL — Intel fields, collection, deployment
  // =================================================================

  function renderThreatDetail(threatId) {
    var detailEl = $('feed-detail');
    if (!detailEl) return;

    var threat = getThreat(threatId);
    if (!threat || threat.phase !== 'INTEL') {
      _selectedThreatId = null;
      detailEl.innerHTML = '<div class="ws-detail-empty">' +
        (threat && threat.phase === 'OPS' ? 'Threat transferred to Operations board. <button class="feed-action-btn primary" onclick="activateWorkspace(\'operations\')" style="margin-top:var(--sp-2)">VIEW IN OPS</button>' : 'Threat data not available') +
      '</div>';
      return;
    }

    var progress = typeof getThreatIntelProgress === 'function' ? getThreatIntelProgress(threat) : { revealed: 0, total: 0, pct: 0 };
    var timeInfo = typeof getThreatTimeRemaining === 'function' ? getThreatTimeRemaining(threat) : { hours: '?', pct: 100, minutes: 0 };

    var html =
      '<div class="feed-detail-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>';

    // --- Threat Header ---
    html += '<div class="threat-detail-header">' +
      '<div class="threat-detail-name">' + threat.orgName + '</div>' +
      '<div class="threat-detail-badges">' +
        '<span class="threat-type-badge">' + threat.typeLabel + '</span>' +
        '<span class="threat-level-badge level-' + threat.threatLevel + '">THREAT ' + threat.threatLevel + '/5</span>' +
        (threat.urgent ? '<span class="threat-urgent-badge" style="background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:2px;letter-spacing:0.5px">URGENT</span>' : '') +
      '</div>' +
    '</div>';

    // --- Location & Theater ---
    html += '<div class="feed-detail-meta">' +
      '<span class="feed-detail-meta-key">LOCATION</span>' +
      '<span class="feed-detail-meta-val">' + threat.location.city + ', ' + threat.location.country + '</span>' +
      '<span class="feed-detail-meta-key">THEATER</span>' +
      '<span class="feed-detail-meta-val">' + (threat.location.theater ? threat.location.theater.name : '?') + '</span>' +
      '<span class="feed-detail-meta-key">IDENTIFIED</span>' +
      '<span class="feed-detail-meta-val">Day ' + threat.daySpawned + '</span>' +
      '<span class="feed-detail-meta-key">INTEL STATUS</span>' +
      '<span class="feed-detail-meta-val">' + progress.revealed + '/' + progress.total + ' fields (' + progress.pct + '%)</span>' +
      '<span class="feed-detail-meta-key">TIME REMAINING</span>' +
      '<span class="feed-detail-meta-val' + (timeInfo.pct <= 20 ? ' threat-time-critical' : timeInfo.pct <= 40 ? ' threat-time-warning' : '') + '">' +
        '~' + (timeInfo.hours < 48 ? timeInfo.hours + ' hours' : timeInfo.hours < 720 ? Math.round(timeInfo.hours / 24) + ' days' : Math.round(timeInfo.hours / 24 / 30) + ' months') + ' (' + timeInfo.pct + '% of window)</span>' +
    '</div>';

    // --- Expiration Progress Bar ---
    var timeCls = timeInfo.pct <= 20 ? ' critical' : timeInfo.pct <= 40 ? ' warning' : '';
    html += '<div class="threat-expiration-section">' +
      '<div class="threat-expiration-bar">' +
        '<div class="threat-expiration-fill' + timeCls + '" style="width:' + (100 - timeInfo.pct) + '%"></div>' +
      '</div>' +
      '<div class="threat-expiration-labels">' +
        '<span>IDENTIFIED</span>' +
        '<span>' + (timeInfo.pct <= 5 ? 'CRITICAL — EXPIRING' : timeInfo.pct <= 15 ? 'URGENCY INCREASING' : 'COLLECTION IN PROGRESS') + '</span>' +
        '<span>EXPIRATION</span>' +
      '</div>' +
    '</div>';

    // --- Intel Fields ---
    html += '<div class="threat-section">' +
      '<div class="threat-section-title">INTELLIGENCE FIELDS</div>';

    if (threat.intelFields && threat.intelFields.length > 0) {
      html += '<div class="intel-fields">';
      for (var i = 0; i < threat.intelFields.length; i++) {
        var field = threat.intelFields[i];
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
          var pct = field.ticksToReveal > 0 ? Math.round((field.ticksAccumulated / field.ticksToReveal) * 100) : 0;
          pct = Math.min(pct, 99);

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
      html += '</div>';
    }
    html += '</div>';

    // --- Active Collection Assets ---
    if (threat.collectorAssetIds && threat.collectorAssetIds.length > 0) {
      html += '<div class="threat-section">' +
        '<div class="threat-section-title">COLLECTION ASSETS DEPLOYED</div>' +
        '<div class="threat-collectors">';

      for (var c = 0; c < threat.collectorAssetIds.length; c++) {
        var asset = getAsset(threat.collectorAssetIds[c]);
        if (!asset) continue;

        var catInfo = ASSET_CATEGORIES[asset.category] || {};
        var base = getBase(asset.homeBaseId);
        var isCollecting = asset.status === 'COLLECTING';
        var statusCls = isCollecting ? 'collecting' : 'transit';

        // Transit time remaining
        var statusText = '';
        if (isCollecting) {
          statusText = 'ON STATION';
        } else if (asset.status === 'IN_TRANSIT' && asset.transitDurationMinutes > 0) {
          var elapsed = V.time.totalMinutes - asset.transitStartTotalMinutes;
          var remaining = Math.max(0, asset.transitDurationMinutes - elapsed);
          statusText = 'ETA ' + (typeof formatTransitTime === 'function' ? formatTransitTime(remaining) : remaining + 'min');
        } else {
          statusText = asset.status;
        }

        // Collection effectiveness for this threat
        var eff = typeof getAssetCollectionEffectiveness === 'function' ?
          getAssetCollectionEffectiveness(asset, threat) : { rating: 0, effectiveFields: 0, totalUnrevealed: 0 };
        var effColor = eff.rating >= 60 ? 'var(--green)' : eff.rating >= 30 ? 'var(--amber)' : 'var(--red)';

        // Source capability tags
        var profile = asset.collectionProfile || {};
        var capTags = '';
        for (var src in profile) {
          var srcColor = profile[src] >= 4 ? 'var(--green)' : profile[src] >= 2 ? 'var(--amber)' : 'var(--text-muted)';
          capTags += '<span class="deploy-cap-tag" style="color:' + srcColor + '">' + src + ':' + profile[src] + '</span>';
        }

        var expandedCls = _expandedCollectors[asset.id] ? ' expanded' : '';

        html += '<div class="threat-collector-card' + expandedCls + '">' +
          '<div class="threat-collector-row" onclick="toggleCollectorExpand(\'' + asset.id + '\')">' +
            '<div class="threat-collector-info">' +
              '<span class="collector-expand-icon">' + (_expandedCollectors[asset.id] ? '▾' : '▸') + '</span>' +
              '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
              '<span class="vigil-asset-name">' + asset.name + '</span>' +
            '</div>' +
            '<div class="threat-collector-status">' +
              '<span class="threat-collector-status-chip ' + statusCls + '">' + statusText + '</span>' +
              '<span class="threat-collector-eff" style="color:' + effColor + '">' + eff.rating + '%</span>' +
            '</div>' +
          '</div>';

        // Expandable detail panel
        if (_expandedCollectors[asset.id]) {
          html += '<div class="threat-collector-detail">' +
            '<div class="collector-detail-grid">' +
              '<div class="collector-detail-item"><span class="collector-detail-label">DESIGNATION</span><span class="collector-detail-value">' + (asset.designation || asset.type) + '</span></div>' +
              '<div class="collector-detail-item"><span class="collector-detail-label">HOME BASE</span><span class="collector-detail-value">' + (base ? base.name + ', ' + base.country : '—') + '</span></div>' +
              '<div class="collector-detail-item"><span class="collector-detail-label">PERSONNEL</span><span class="collector-detail-value">' + (asset.personnel || '—') + '</span></div>' +
              '<div class="collector-detail-item"><span class="collector-detail-label">PLATFORM</span><span class="collector-detail-value">' + (asset.platform || '—') + '</span></div>' +
              '<div class="collector-detail-item"><span class="collector-detail-label">DENIABILITY</span><span class="collector-detail-value" style="color:' + (DENIABILITY_DISPLAY[asset.deniability] || DENIABILITY_DISPLAY.OVERT).color + '">' + (asset.deniability || 'OVERT') + '</span></div>' +
              '<div class="collector-detail-item"><span class="collector-detail-label">EFFECTIVENESS</span><span class="collector-detail-value" style="color:' + effColor + '">' + eff.rating + '% — ' + eff.effectiveFields + '/' + eff.totalUnrevealed + ' fields covered</span></div>' +
            '</div>' +
            (asset.description ? '<div class="collector-detail-desc">' + asset.description + '</div>' : '') +
            (capTags ? '<div class="collector-detail-caps">' + capTags + '</div>' : '') +
            (asset.equipment && asset.equipment.length > 0 ? '<div class="collector-detail-equip"><span class="collector-detail-label">EQUIPMENT</span> ' + asset.equipment.join(' · ') + '</div>' : '') +
            '<div class="collector-detail-actions">' +
              '<button class="threat-collector-recall" onclick="event.stopPropagation();recallCollectionAsset(\'' + asset.id + '\');renderFeedRefresh()">RECALL TO BASE</button>' +
            '</div>' +
          '</div>';
        }

        html += '</div>';
      }

      html += '</div></div>';
    }

    // --- Foreign Target Section ---
    if (threat.foreignTarget && threat.foreignTarget.country === 'United States') {
      // US-targeted threats — no disclosure options, show homeland target info
      html += '<div class="threat-section">' +
        '<div class="threat-section-title" style="color:var(--red)">HOMELAND TARGET</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text);margin-bottom:var(--sp-3)">' +
          'Target intent analysis confirms this threat targets <span style="color:var(--red);font-weight:600">' + (threat.foreignTarget.city || 'the United States') + '</span>. ' +
          'Domestic defense protocols apply.' +
        '</div>' +
      '</div>';
    } else if (threat.foreignTarget && !threat.foreignTarget.disclosed) {
      html += '<div class="threat-section">' +
        '<div class="threat-section-title">FOREIGN TARGET</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text);margin-bottom:var(--sp-3)">' +
          'Target intent analysis reveals this threat targets <span style="color:var(--text-hi);font-weight:600">' + (threat.foreignTarget.city ? threat.foreignTarget.city + ', ' : '') + threat.foreignTarget.country + '</span>. ' +
          'Disclosing intelligence to the target country may improve diplomatic relations.' +
        '</div>' +
        '<div style="display:flex;gap:var(--sp-2);flex-wrap:wrap">' +
          '<button class="feed-action-btn primary" onclick="handleDisclosure(\'' + threat.id + '\',\'OFFICIAL\')">OFFICIAL DISCLOSURE (10 INTEL)</button>' +
          '<button class="feed-action-btn" onclick="handleDisclosure(\'' + threat.id + '\',\'ANONYMOUS\')">ANONYMOUS LEAK</button>' +
          '<button class="feed-action-btn" onclick="handleDisclosure(\'' + threat.id + '\',\'NOTHING\')">DO NOTHING</button>' +
        '</div>' +
      '</div>';
    } else if (threat.foreignTarget && threat.foreignTarget.disclosed) {
      html += '<div class="threat-section">' +
        '<div class="threat-section-title">FOREIGN TARGET</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text-dim)">' +
          'Target: ' + (threat.foreignTarget.city ? threat.foreignTarget.city + ', ' : '') + threat.foreignTarget.country + ' — Disclosed via ' + (threat.foreignTarget.disclosureType || 'unknown') + '.' +
        '</div>' +
      '</div>';
    }

    // --- Vigil Assessment Recommendation (first time only) ---
    if (threat.vigilRecommendsOps) {
      var vigilProgress = typeof getThreatIntelProgress === 'function' ? getThreatIntelProgress(threat) : { revealed: 0, total: 0, pct: 0 };
      var vigilUnrevealed = vigilProgress.total - vigilProgress.revealed;
      html += '<div class="threat-section" style="border:1px solid var(--accent);border-radius:var(--radius-md);background:var(--accent-dim);padding:var(--sp-3)">' +
        '<div class="threat-section-title" style="color:var(--accent)">VIGIL ASSESSMENT — READY FOR DIRECT ACTION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--text);line-height:1.6;margin-bottom:var(--sp-3)">' +
          'Vigil assesses that sufficient intelligence has been gathered to support operational planning against ' + threat.orgName + '. ' +
          'Current coverage: <span style="color:var(--text-hi);font-weight:600">' + vigilProgress.pct + '%</span> (' + vigilProgress.revealed + '/' + vigilProgress.total + ' fields).' +
          (vigilUnrevealed > 0 ? ' <span style="color:var(--amber)">' + vigilUnrevealed + ' field' + (vigilUnrevealed > 1 ? 's' : '') + ' still unrevealed</span> — continued collection may yield additional intelligence for mission planning.' : ' All fields resolved — full intelligence package available.') +
        '</div>' +
        '<div style="display:flex;gap:var(--sp-2)">' +
          '<button class="feed-action-btn primary" onclick="approveMoveThreatToOps(\'' + threat.id + '\')">MOVE TO OPERATIONS</button>' +
          '<button class="feed-action-btn" onclick="declineMoveThreatToOps(\'' + threat.id + '\')">CONTINUE COLLECTION</button>' +
        '</div>' +
      '</div>';
    }

    // --- Persistent "Move to Ops" button once threshold was reached and Vigil dismissed ---
    if (threat._reachedActionable && !threat.vigilRecommendsOps) {
      var moveProgress = typeof getThreatIntelProgress === 'function' ? getThreatIntelProgress(threat) : { revealed: 0, total: 0, pct: 0 };
      html += '<div class="threat-section">' +
        '<div class="threat-section-title">OPERATOR ACTION</div>' +
        '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);margin-bottom:var(--sp-2)">' +
          'Actionable threshold reached. Intel coverage: ' + moveProgress.pct + '% (' + moveProgress.revealed + '/' + moveProgress.total + ').' +
        '</div>' +
        '<button class="feed-action-btn primary" onclick="approveMoveThreatToOps(\'' + threat.id + '\')">MOVE TO OPERATIONS</button>' +
      '</div>';
    }

    // --- Deploy Collection Asset Panel ---
    html += '<div class="threat-section">' +
      '<div class="threat-section-title">DEPLOY COLLECTION ASSET</div>';

    if (_showDeployPanel) {
      html += renderDeployPanel(threat);
    } else {
      // Show summary + button
      var _allCollection = typeof getCollectionAssets === 'function' ? getCollectionAssets() : [];
      if (!threat.domestic) { _allCollection = _allCollection.filter(function(a) { return !a.domesticAuthority; }); }
      var availCount = _allCollection.length;
      html += '<div class="threat-deploy-summary">' +
        availCount + ' collection-capable asset' + (availCount !== 1 ? 's' : '') + ' available for deployment.' +
      '</div>' +
      '<button class="feed-action-btn primary" onclick="toggleDeployPanel()">SELECT ASSET TO DEPLOY</button>';
    }

    html += '</div>';

    // --- Actions ---
    html += '<div class="feed-detail-actions">';
    if (threat.location && threat.location.lat) {
      html += '<button class="feed-action-btn" onclick="globeFlyTo(' + threat.location.lat + ',' + threat.location.lon + ')">VIEW ON GLOBE</button>';
    }
    html += '<button class="feed-action-btn" onclick="archiveThreatFromFeed(\'' + threat.id + '\')">ARCHIVE (NON-THREAT)</button>';
    html += '</div>';

    detailEl.innerHTML = html;
  }

  // =================================================================
  //  DEPLOY PANEL — Asset selection with effectiveness ratings
  // =================================================================

  function renderDeployPanel(threat) {
    var available = typeof getCollectionAssets === 'function' ? getCollectionAssets() : [];
    // Domestic agencies only available for domestic threats
    if (!threat.domestic) {
      available = available.filter(function(a) { return !a.domesticAuthority; });
    }

    if (available.length === 0) {
      return '<div class="threat-deploy-empty">No collection-capable assets available. All assets are currently deployed or in transit.</div>' +
        '<button class="feed-action-btn" onclick="toggleDeployPanel()">CLOSE</button>';
    }

    // Sort by effectiveness for this threat
    var assetData = [];
    for (var i = 0; i < available.length; i++) {
      var a = available[i];
      var eff = typeof getAssetCollectionEffectiveness === 'function' ?
        getAssetCollectionEffectiveness(a, threat) : { rating: 0, effectiveFields: 0, totalUnrevealed: 0 };
      var transit = typeof calcTransitMinutes === 'function' ?
        calcTransitMinutes(a, threat.location.lat, threat.location.lon) : 0;
      assetData.push({ asset: a, eff: eff, transitMin: transit });
    }

    // Mark unreachable assets
    var threatTimeInfo = typeof getThreatTimeRemaining === 'function' ? getThreatTimeRemaining(threat) : { minutes: Infinity };
    for (var u = 0; u < assetData.length; u++) {
      assetData[u].unreachable = assetData[u].transitMin > threatTimeInfo.minutes;
    }

    if (_deployCovertFilter) {
      assetData = assetData.filter(function(d) { return d.asset.deniability === 'COVERT'; });
    }

    // For domestic threats, sort sanctioned (domesticAuthority) first
    assetData.sort(function(a, b) {
      if (a.unreachable !== b.unreachable) return a.unreachable ? 1 : -1;
      if (threat.domestic) {
        var aSanctioned = a.asset.domesticAuthority ? 0 : 1;
        var bSanctioned = b.asset.domesticAuthority ? 0 : 1;
        if (aSanctioned !== bSanctioned) return aSanctioned - bSanctioned;
      }
      if (_deploySortMode === 'TIME') return a.transitMin - b.transitMin;
      return b.eff.rating - a.eff.rating;
    });

    var html = '<div class="threat-deploy-sort">' +
      '<button class="feed-filter' + (_deploySortMode === 'EFFECTIVENESS' ? ' active' : '') + '" onclick="setDeploySortMode(\'EFFECTIVENESS\')">EFFECTIVENESS</button>' +
      '<button class="feed-filter' + (_deploySortMode === 'TIME' ? ' active' : '') + '" onclick="setDeploySortMode(\'TIME\')">TRANSIT TIME</button>' +
      '<button class="feed-filter' + (_deployCovertFilter ? ' active' : '') + '" onclick="toggleCovertFilter()">COVERT ONLY</button>' +
    '</div>';

    // Diplomatic warning for overt deployment
    if (threat.location && threat.location.country && threat.location.country !== 'United States') {
      var deployCountry = threat.location.country;
      if (typeof getCountryStance === 'function') {
        var deployStance = getCountryStance(deployCountry);
        var deployPerms = typeof getCountryPermissions === 'function' ? getCountryPermissions(deployCountry) : {};
        if (!deployPerms.overtOps) {
          html += '<div class="threat-deploy-warning" style="margin-bottom:var(--sp-2)">' +
            '⚠ DIPLOMATIC WARNING: ' + deployCountry + ' (' + deployStance.label + ') — Overt asset deployment is NOT authorized. ' +
            'Deploying overt assets will constitute a sovereignty violation with severe diplomatic consequences. ' +
            'Consider covert assets or request clearance first.' +
          '</div>';
        }
      }
    }

    // Posse Comitatus warning for domestic threats
    if (threat.domestic) {
      html += '<div class="threat-deploy-warning" style="margin-bottom:var(--sp-2);border-color:rgba(212,160,74,0.3);background:rgba(212,160,74,0.06)">' +
        '◎ DOMESTIC OPERATION — Posse Comitatus Act restricts military deployment on US soil. ' +
        'Sanctioned federal agency assets are listed first. Deploying unsanctioned military/CIA assets ' +
        'will incur viability penalties.' +
      '</div>';
    }

    html += '<div class="threat-deploy-list">';

    for (var j = 0; j < assetData.length; j++) {
      var d = assetData[j];
      var asset = d.asset;
      var eff = d.eff;
      var catInfo = ASSET_CATEGORIES[asset.category] || {};
      var base = getBase(asset.currentBaseId || asset.homeBaseId);
      var transitStr = typeof formatTransitTime === 'function' ? formatTransitTime(d.transitMin) : d.transitMin + 'min';

      var effColor = eff.rating >= 60 ? 'var(--green)' : eff.rating >= 30 ? 'var(--amber)' : 'var(--red)';
      var ineffective = eff.rating === 0;
      var isReturning = asset.status === 'RETURNING';

      // Build source capability tags
      var profile = asset.collectionProfile || {};
      var capTags = '';
      for (var src in profile) {
        var srcColor = profile[src] >= 4 ? 'var(--green)' : profile[src] >= 2 ? 'var(--amber)' : 'var(--text-muted)';
        capTags += '<span class="deploy-cap-tag" style="color:' + srcColor + '">' + src + ':' + profile[src] + '</span>';
      }

      var unreachableCls = d.unreachable ? ' unreachable' : '';
      html += '<div class="threat-deploy-card' + (ineffective ? ' ineffective' : '') + unreachableCls + '">' +
        '<div class="threat-deploy-card-top">' +
          '<div class="threat-deploy-card-info">' +
            '<span class="vigil-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || '') + '</span>' +
            '<span class="threat-deploy-card-name">' + asset.name + '</span>' +
          '</div>' +
          '<div class="threat-deploy-card-eff" style="color:' + effColor + '">' + eff.rating + '%</div>' +
        '</div>' +
        '<div class="threat-deploy-card-meta">' +
          (base ? '<span>' + base.city + ', ' + base.country + '</span>' : '') +
          '<span>ETA: ' + transitStr + '</span>' +
          '<span>' + eff.effectiveFields + '/' + eff.totalUnrevealed + ' fields covered</span>' +
          '<span style="color:' + (DENIABILITY_DISPLAY[asset.deniability] || DENIABILITY_DISPLAY.OVERT).color + '">' + (asset.deniability || 'OVERT') + '</span>' +
          (isReturning ? '<span style="color:var(--amber)">RTB — reroute available</span>' : '') +
          (threat.domestic && !asset.domesticAuthority ? '<span style="color:var(--red);font-weight:700">UNSANCTIONED</span>' : '') +
          (threat.domestic && asset.domesticAuthority ? '<span style="color:#d4a04a;font-weight:700">SANCTIONED</span>' : '') +
        '</div>' +
        '<div class="threat-deploy-card-caps">' + capTags + '</div>';

      if (ineffective) {
        html += '<div class="threat-deploy-warning">⚠ VIGIL: This asset has no collection capability matching remaining unrevealed field sources. Deployment would not accelerate intelligence gathering.</div>';
      }

      if (d.unreachable) {
        html += '<div class="threat-deploy-warning" style="color:var(--red);border-color:rgba(224,64,64,0.15);background:rgba(224,64,64,0.05)">UNREACHABLE — Transit time exceeds threat window. Asset cannot arrive before expiration.</div>';
      }

      html += '<button class="feed-action-btn primary threat-deploy-btn' + (ineffective ? ' ineffective-btn' : '') + '" ' +
        'onclick="deployAssetToThreat(\'' + asset.id + '\',\'' + threat.id + '\')">' +
        (ineffective ? 'DEPLOY ANYWAY (INEFFECTIVE)' : 'DEPLOY') +
      '</button>';

      html += '</div>';
    }

    html += '</div>';
    html += '<button class="feed-action-btn" onclick="toggleDeployPanel()" style="margin-top:var(--sp-2)">CLOSE</button>';

    return html;
  }

  // =================================================================
  //  FEED DETAIL — Regular notification items
  // =================================================================

  function renderFeedDetail(feedId) {
    var detailEl = $('feed-detail');
    if (!detailEl) return;

    var item = null;
    for (var i = 0; i < V.feed.length; i++) {
      if (V.feed[i].id === feedId) { item = V.feed[i]; break; }
    }

    if (!item) {
      detailEl.innerHTML = '<div class="ws-detail-empty">Select an intelligence item to view details</div>';
      return;
    }

    // If this feed item has a threatId and the threat is still in INTEL phase,
    // show the threat detail instead
    if (item.threatId) {
      var linkedThreat = getThreat(item.threatId);
      if (linkedThreat && linkedThreat.phase === 'INTEL') {
        _selectedThreatId = linkedThreat.id;
        _selectedFeedId = null;
        renderFeedList();
        renderThreatDetail(linkedThreat.id);
        return;
      }
    }

    var severityCls = (item.severity || 'routine').toLowerCase();

    var html =
      '<div class="feed-detail-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
      '<div class="feed-detail-title">' + item.header + '</div>' +
      '<div class="feed-detail-meta">' +
        '<span class="feed-detail-meta-key">SEVERITY</span>' +
        '<span class="feed-detail-meta-val"><span class="urgent-severity severity-' + severityCls + '" style="font-size:9px">' + item.severity + '</span></span>' +
        '<span class="feed-detail-meta-key">TYPE</span>' +
        '<span class="feed-detail-meta-val">' + (item.type || 'INTELLIGENCE') + '</span>' +
        '<span class="feed-detail-meta-key">TIME</span>' +
        '<span class="feed-detail-meta-val">' + formatTimestamp(item.timestamp) + '</span>' +
        (item.theaterId ? '<span class="feed-detail-meta-key">THEATER</span><span class="feed-detail-meta-val">' + (THEATERS[item.theaterId] ? THEATERS[item.theaterId].name : item.theaterId) + '</span>' : '') +
      '</div>' +
      '<div class="feed-detail-body"><p>' + item.body + '</p></div>';

    // Action buttons
    html += '<div class="feed-detail-actions">';
    if (item.opId) {
      html += '<button class="feed-action-btn primary" onclick="activateWorkspace(\'operations\')">VIEW OPERATION</button>';
    } else if (item.threatId) {
      var t = getThreat(item.threatId);
      if (t && t.phase === 'OPS' && t.linkedOpId) {
        html += '<button class="feed-action-btn primary" onclick="selectOperation(\'' + t.linkedOpId + '\');activateWorkspace(\'operations\')">VIEW OPERATION</button>';
      }
    }
    if (item.geo && item.geo.lat && item.geo.lon) {
      html += '<button class="feed-action-btn" onclick="globeFlyTo(' + item.geo.lat + ',' + item.geo.lon + ')">VIEW ON GLOBE</button>';
    }
    html += '</div>';

    detailEl.innerHTML = html;
  }

  // =================================================================
  //  HELPERS
  // =================================================================

  function getFilteredFeed() {
    if (_feedFilter === 'ALL') return V.feed;
    if (_feedFilter === 'UNREAD') return V.feed.filter(function(i) { return !i.read; });
    if (_feedFilter === 'THREATS') return []; // Threats shown in dedicated section
    return V.feed.filter(function(i) { return i.severity === _feedFilter; });
  }

  // =================================================================
  //  GLOBAL FUNCTIONS (onclick handlers)
  // =================================================================

  window.selectFeedItem = function(feedId) {
    _selectedFeedId = feedId;
    _selectedThreatId = null;
    _showDeployPanel = false;

    // Mark as read
    for (var i = 0; i < V.feed.length; i++) {
      if (V.feed[i].id === feedId) {
        V.feed[i].read = true;
        break;
      }
    }

    renderFeedList();
    renderFeedDetail(feedId);
    updateWorkspaceBadge('feed', getUnreadFeedCount());
  };

  window.selectThreatItem = function(threatId) {
    _selectedThreatId = threatId;
    _selectedFeedId = null;
    _showDeployPanel = false;

    renderFeedList();
    renderThreatDetail(threatId);
  };

  window.setFeedFilter = function(filter) {
    _feedFilter = filter;
    renderFeedList();
    renderFeedToolbar();
  };

  window.toggleDeployPanel = function() {
    _showDeployPanel = !_showDeployPanel;
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
  };

  window.deployAssetToThreat = function(assetId, threatId) {
    if (typeof deployAssetForCollection === 'function') {
      deployAssetForCollection(assetId, threatId);
    }
    _showDeployPanel = false;
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
    renderFeedList();
  };

  window.archiveThreatFromFeed = function(threatId) {
    if (typeof archiveThreat === 'function') {
      archiveThreat(threatId);
    }
    _selectedThreatId = null;
    _showDeployPanel = false;
    var detailEl = $('feed-detail');
    if (detailEl) detailEl.innerHTML = '<div class="ws-detail-empty">Threat archived</div>';
    renderFeedList();
  };

  window.setDeploySortMode = function(mode) {
    _deploySortMode = mode;
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
  };

  window.toggleCovertFilter = function() {
    _deployCovertFilter = !_deployCovertFilter;
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
  };

  window.toggleCollectorExpand = function(assetId) {
    _expandedCollectors[assetId] = !_expandedCollectors[assetId];
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
  };

  window.handleDisclosure = function(threatId, type) {
    if (type === 'NOTHING') {
      var t = getThreat(threatId);
      if (t && t.foreignTarget) {
        t.foreignTarget.disclosed = true;
        t.foreignTarget.disclosureType = 'NONE';
      }
    } else if (typeof discloseToCountry === 'function') {
      discloseToCountry(threatId, type);
    }
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
  };

  window.renderFeedRefresh = function() {
    if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
    renderFeedList();
  };

  // --- Re-render on state changes ---
  hook('threat:spawned', function() {
    if (V.ui.activeWorkspace === 'feed') renderFeedList();
  });

  hook('threat:intel:revealed', function() {
    if (V.ui.activeWorkspace === 'feed') {
      renderFeedList();
      if (_selectedThreatId) renderThreatDetail(_selectedThreatId);
    }
  });

  hook('threat:moved:ops', function(data) {
    if (_selectedThreatId === data.threat.id) {
      _selectedThreatId = null;
      if (V.ui.activeWorkspace === 'feed') {
        var detailEl = $('feed-detail');
        if (detailEl) detailEl.innerHTML = '<div class="ws-detail-empty">Threat transferred to Operations board. <button class="feed-action-btn primary" onclick="activateWorkspace(\'operations\')" style="margin-top:var(--sp-2)">VIEW IN OPS</button></div>';
      }
    }
    if (V.ui.activeWorkspace === 'feed') renderFeedList();
  });

  hook('alert:incoming', function() {
    if (V.ui.activeWorkspace === 'feed') renderFeedList();
  });

})();
