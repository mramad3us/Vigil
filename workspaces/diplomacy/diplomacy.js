/* ============================================================
   VIGIL — workspaces/diplomacy/diplomacy.js
   Diplomacy workspace — manage country relationships,
   deploy envoys, request clearances.
   ============================================================ */

(function() {

  var _selectedCountry = null;
  var _countrySort = 'STANCE';
  var _activeAction = null;
  var _badgeCount = 0;
  var _acknowledged = {};

  registerWorkspace({
    id: 'diplomacy',
    label: 'Diplomacy',
    icon: '\u2B26',

    init: function() {
      var container = $('ws-diplomacy');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:300px;min-width:260px;max-width:340px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">DIPLOMATIC RELATIONS</span>' +
              '<span class="ws-list-count" id="diplo-count"></span>' +
            '</div>' +
            '<div class="diplo-toolbar">' +
              '<span class="diplo-filter-btn active" onclick="setCountrySort(\'STANCE\')">BY STANCE</span>' +
              '<span class="diplo-filter-btn" onclick="setCountrySort(\'THEATER\')">BY THEATER</span>' +
            '</div>' +
            '<div class="ws-list-body" id="diplo-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="diplo-detail">' +
              '<div class="diplo-empty">Select a country to view diplomatic status</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {
      _badgeCount = 0;
      _acknowledged = {};
      updateWorkspaceBadge('diplomacy', 0);
    },

    deactivate: function() {},

    render: function() {
      renderCountryList();
      if (_selectedCountry) renderCountryDetail(_selectedCountry);
    },
  });

  // --- Global Handlers ---

  window.selectCountry = function(name) {
    _selectedCountry = name;
    _activeAction = null;
    renderCountryList();
    renderCountryDetail(name);
  };

  window.setCountrySort = function(mode) {
    _countrySort = mode;
    var btns = qsa('.diplo-filter-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].textContent.indexOf(mode) >= 0);
    }
    renderCountryList();
  };

  window.toggleDiploAction = function(action) {
    _activeAction = (_activeAction === action) ? null : action;
    if (_selectedCountry) renderCountryDetail(_selectedCountry);
  };

  window.startOutreach = function(country, assetId, mode) {
    var result = startDiplomaticOutreach(country, assetId, mode);
    if (result) {
      _activeAction = null;
      renderCountryDetail(country);
      renderCountryList();
    }
  };

  window.startClearanceRequest = function(country, assetId) {
    var result = requestProactiveClearance(country, assetId);
    if (result) {
      _activeAction = null;
      renderCountryDetail(country);
      renderCountryList();
    }
  };

  // --- Country List Rendering ---

  function renderCountryList() {
    var listEl = $('diplo-list');
    var countEl = $('diplo-count');
    if (!listEl || !V.diplomacy) return;

    var countries = Object.keys(V.diplomacy);
    if (countEl) countEl.textContent = countries.length + ' countries';

    if (_countrySort === 'THEATER') {
      renderByTheater(listEl, countries);
    } else {
      renderByStance(listEl, countries);
    }
  }

  function renderByStance(el, countries) {
    // Group by stance level (high to low)
    var groups = {};
    for (var i = 0; i < countries.length; i++) {
      var c = countries[i];
      var level = V.diplomacy[c].stance;
      if (!groups[level]) groups[level] = [];
      groups[level].push(c);
    }

    var html = '';
    for (var lvl = 7; lvl >= 0; lvl--) {
      if (!groups[lvl] || groups[lvl].length === 0) continue;
      var tier = getStanceTier(lvl);
      html += '<div class="diplo-stance-group" style="color:' + tier.color + '">' +
        '<span>' + tier.label + '</span>' +
        '<span class="diplo-stance-group-count">' + groups[lvl].length + '</span>' +
      '</div>';

      var sorted = groups[lvl].sort();
      for (var j = 0; j < sorted.length; j++) {
        html += renderCountryRow(sorted[j]);
      }
    }

    el.innerHTML = html;
  }

  function renderByTheater(el, countries) {
    // Map countries to theaters
    var theaterGroups = {};
    for (var tid in THEATERS) {
      theaterGroups[tid] = { name: THEATERS[tid].name, countries: [] };
    }
    var unassigned = [];

    for (var i = 0; i < countries.length; i++) {
      var c = countries[i];
      var found = false;
      for (var tid in THEATERS) {
        if (THEATERS[tid].countries.indexOf(c) >= 0) {
          theaterGroups[tid].countries.push(c);
          found = true;
          break;
        }
      }
      if (!found) unassigned.push(c);
    }

    var html = '';
    for (var tid in theaterGroups) {
      var tg = theaterGroups[tid];
      if (tg.countries.length === 0) continue;
      html += '<div class="diplo-stance-group">' +
        '<span>' + tg.name.toUpperCase() + '</span>' +
        '<span class="diplo-stance-group-count">' + tg.countries.length + '</span>' +
      '</div>';

      var sorted = tg.countries.sort();
      for (var j = 0; j < sorted.length; j++) {
        html += renderCountryRow(sorted[j]);
      }
    }

    if (unassigned.length > 0) {
      html += '<div class="diplo-stance-group"><span>OTHER</span><span class="diplo-stance-group-count">' + unassigned.length + '</span></div>';
      for (var k = 0; k < unassigned.length; k++) {
        html += renderCountryRow(unassigned[k]);
      }
    }

    el.innerHTML = html;
  }

  function renderCountryRow(country) {
    var cd = V.diplomacy[country];
    var tier = getStanceTier(cd.stance);
    var selected = (_selectedCountry === country) ? ' selected' : '';

    var indicators = '';
    if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') {
      indicators += '<span class="diplo-indicator" title="Pending clearance">\u25CE</span>';
    }
    if (cd.lastIncident && (V.time.day - cd.lastIncident.day) < 7) {
      indicators += '<span class="diplo-indicator" style="color:var(--amber)" title="Recent incident">\u26A0</span>';
    }
    if (cd.missions) {
      for (var i = 0; i < cd.missions.length; i++) {
        if (cd.missions[i].status === 'IN_TRANSIT' || cd.missions[i].status === 'EXECUTING') {
          indicators += '<span class="diplo-indicator" style="color:var(--accent)" title="Active mission">\u25B8</span>';
          break;
        }
      }
    }

    return '<div class="diplo-country-row' + selected + '" onclick="selectCountry(\'' + country.replace(/'/g, "\\'") + '\')">' +
      '<span class="diplo-stance-dot" style="background:' + tier.color + '"></span>' +
      '<span class="diplo-country-name">' + country + '</span>' +
      (indicators ? '<span class="diplo-indicators">' + indicators + '</span>' : '') +
      '<span class="diplo-stance-chip" style="background:' + tier.color + '22;color:' + tier.color + '">' + tier.label + '</span>' +
    '</div>';
  }

  // --- Country Detail Rendering ---

  function renderCountryDetail(country) {
    var detailEl = $('diplo-detail');
    if (!detailEl || !V.diplomacy[country]) return;

    var cd = V.diplomacy[country];
    var tier = getStanceTier(cd.stance);
    var perms = getStancePermissions(cd.stance);

    var html = '';

    // Header
    html += '<div class="diplo-detail-header">' +
      '<span class="diplo-detail-name">' + country + '</span>' +
      '<span class="diplo-detail-stance" style="background:' + tier.color + '22;color:' + tier.color + '">' + tier.label + '</span>' +
    '</div>';

    // Stance bar
    html += '<div class="diplo-stance-bar">';
    for (var i = 0; i < 8; i++) {
      var segTier = getStanceTier(i);
      var filled = (i <= cd.stance) ? ' filled' : '';
      var bg = filled ? 'background:' + segTier.color : '';
      html += '<div class="diplo-stance-bar-seg' + filled + '" style="' + bg + '"></div>';
    }
    html += '</div>';

    // Permissions
    html += '<div class="diplo-section"><div class="diplo-section-title">PERMISSIONS</div>';
    html += '<div class="diplo-perm-grid">';
    html += renderPermRow('COVERT OPS', true, 'Risk: ' + Math.round(perms.covertRisk * 100) + '%', perms.covertRisk > 0.5 ? 'risky' : 'authorized');
    html += renderPermRow('FLYOVER', perms.flyover);
    html += renderPermRow('STATION', perms.station);
    html += renderPermRow('OVERT OPS', perms.overtOps || (cd.pendingClearance && cd.pendingClearance.status === 'GRANTED'));
    html += '</div></div>';

    // Clearance Status
    html += '<div class="diplo-section"><div class="diplo-section-title">CLEARANCE STATUS</div>';
    if (cd.pendingClearance) {
      var cl = cd.pendingClearance;
      if (cl.status === 'PENDING') {
        var remaining = cl.estimatedCompletion - V.time.totalMinutes;
        var approvalChance = getClearanceApprovalChance(cd.stance);
        html += '<div style="font-size:var(--fs-sm);color:var(--text)">' +
          'Status: <span style="color:var(--amber)">PENDING</span> &middot; ' +
          'ETA: ' + formatTransitTime(Math.max(0, remaining)) + ' &middot; ' +
          'Approval: ' + Math.round(approvalChance * 100) + '%' +
          (cl.mode ? ' &middot; Mode: ' + cl.mode : '') +
        '</div>';
      } else {
        var statusColor = cl.status === 'GRANTED' ? 'var(--green)' : 'var(--red)';
        html += '<div style="font-size:var(--fs-sm);color:' + statusColor + '">' + cl.status + '</div>';
      }
    } else {
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted)">No active clearance</div>';
    }
    html += '</div>';

    // Active Missions
    html += '<div class="diplo-section"><div class="diplo-section-title">ACTIVE MISSIONS</div>';
    var activeMissions = getActiveMissions(country);
    if (activeMissions.length > 0) {
      for (var m = 0; m < activeMissions.length; m++) {
        html += renderMissionRow(activeMissions[m]);
      }
    } else {
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted)">No active missions</div>';
    }
    html += '</div>';

    // Stance History
    if (cd.stanceHistory && cd.stanceHistory.length > 0) {
      html += '<div class="diplo-section"><div class="diplo-section-title">STANCE HISTORY</div>';
      var history = cd.stanceHistory.slice(-8).reverse();
      for (var h = 0; h < history.length; h++) {
        var entry = history[h];
        var fromTier = getStanceTier(entry.from);
        var toTier = getStanceTier(entry.to);
        html += '<div class="diplo-history-row">' +
          '<span class="diplo-history-time">D' + entry.day + ' ' + String(entry.hour).padStart(2, '0') + '00</span>' +
          '<span style="color:' + fromTier.color + '">' + fromTier.label + '</span>' +
          '<span class="diplo-history-arrow">\u2192</span>' +
          '<span style="color:' + toTier.color + '">' + toTier.label + '</span>' +
        '</div>';
      }
      html += '</div>';
    }

    // Diplomatic Actions
    html += '<div class="diplo-section"><div class="diplo-section-title">DIPLOMATIC ACTIONS</div>';
    html += renderOutreachCard(country, cd);
    html += renderClearanceCard(country, cd);
    html += renderShareIntelCard(country);
    html += '</div>';

    detailEl.innerHTML = html;
  }

  function renderPermRow(label, authorized, customValue, customClass) {
    var cls = customClass || (authorized ? 'authorized' : 'denied');
    var val = customValue || (authorized ? 'AUTHORIZED' : 'DENIED');
    return '<div class="diplo-perm-row">' +
      '<span class="diplo-perm-label">' + label + '</span>' +
      '<span class="diplo-perm-value ' + cls + '">' + val + '</span>' +
    '</div>';
  }

  function renderMissionRow(mission) {
    var now = V.time.totalMinutes;
    var progress = 0;
    var statusCls = mission.status === 'IN_TRANSIT' ? 'in-transit' : 'executing';

    if (mission.status === 'EXECUTING' && mission.completionAt) {
      var total = mission.completionAt - mission.startedAt;
      var elapsed = now - mission.startedAt;
      progress = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
    } else if (mission.status === 'IN_TRANSIT' && mission.assetId) {
      var asset = getAsset(mission.assetId);
      if (asset && asset.transitDurationMinutes > 0) {
        var elapsed = now - asset.transitStartTotalMinutes;
        progress = Math.min(100, Math.round((elapsed / asset.transitDurationMinutes) * 100));
      }
    }

    var assetName = '';
    if (mission.assetId) {
      var a = getAsset(mission.assetId);
      if (a) assetName = a.name;
    }

    return '<div class="diplo-mission-row">' +
      '<div class="diplo-mission-header">' +
        '<span class="diplo-mission-type">' + mission.type + ' (' + mission.mode + ')</span>' +
        '<span class="diplo-mission-status ' + statusCls + '">' + mission.status.replace('_', ' ') + '</span>' +
      '</div>' +
      '<div class="diplo-mission-bar"><div class="diplo-mission-bar-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="diplo-mission-detail">' +
        (assetName ? assetName + ' &middot; ' : '') +
        'Success: ' + Math.round(mission.successChance * 100) + '%' +
      '</div>' +
    '</div>';
  }

  // --- Action Cards ---

  function renderOutreachCard(country, cd) {
    var cost = getOutreachCost(cd.stance);
    var disabled = false;
    var reason = '';

    if (cd.stance <= 0) { disabled = true; reason = 'Cannot engage AT WAR nations'; }
    else if (cost === null) { disabled = true; reason = 'Outreach not available at this stance'; }
    else if (V.resources.intel < cost) { disabled = true; reason = 'Insufficient intel (' + cost + ' required)'; }
    else if (hasActiveMission(country, 'OUTREACH')) { disabled = true; reason = 'Outreach already in progress'; }

    var expanded = (_activeAction === 'OUTREACH' && !disabled);

    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + (expanded ? ' expanded' : '') + '"' +
      (!disabled ? ' onclick="toggleDiploAction(\'OUTREACH\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">DIPLOMATIC OUTREACH</span>' +
        (cost !== null ? '<span class="diplo-action-cost">' + cost + ' INTEL</span>' : '') +
      '</div>' +
      '<div class="diplo-action-desc">Attempt to improve relations. +1 stance on success.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '');

    if (expanded) {
      html += renderAssetPanel(country, 'OUTREACH');
    }

    html += '</div>';
    return html;
  }

  function renderClearanceCard(country, cd) {
    var disabled = false;
    var reason = '';

    if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') {
      disabled = true;
      reason = 'Clearance already pending';
    }

    var expanded = (_activeAction === 'CLEARANCE' && !disabled);

    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + (expanded ? ' expanded' : '') + '"' +
      (!disabled ? ' onclick="toggleDiploAction(\'CLEARANCE\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">REQUEST CLEARANCE</span>' +
        '<span class="diplo-action-cost">FREE</span>' +
      '</div>' +
      '<div class="diplo-action-desc">Request authorization for overt operations. Approval: ' +
        Math.round(getClearanceApprovalChance(cd.stance) * 100) + '%.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '');

    if (expanded) {
      html += renderClearanceAssetPanel(country);
    }

    html += '</div>';
    return html;
  }

  function renderShareIntelCard(country) {
    // Find threats targeting this country that haven't been disclosed
    var threats = getDisclosableThreats(country);
    var disabled = threats.length === 0;
    var expanded = (_activeAction === 'SHARE_INTEL' && !disabled);

    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + (expanded ? ' expanded' : '') + '"' +
      (!disabled ? ' onclick="toggleDiploAction(\'SHARE_INTEL\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">SHARE INTELLIGENCE</span>' +
        '<span class="diplo-action-cost">10 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">' + (disabled ? 'No disclosable threats for this country.' : threats.length + ' threat(s) can be disclosed.') + '</div>';

    if (expanded) {
      html += '<div class="diplo-asset-panel">';
      for (var i = 0; i < threats.length; i++) {
        var t = threats[i];
        html += '<div class="diplo-asset-option">' +
          '<div class="diplo-asset-info">' +
            '<span class="diplo-asset-name">' + t.orgName + '</span>' +
            '<span class="diplo-asset-meta">' + t.location.city + ', ' + t.location.country + '</span>' +
          '</div>' +
          '<span class="diplo-send-btn" onclick="event.stopPropagation(); discloseToCountry(\'' + t.id + '\', \'OFFICIAL\'); toggleDiploAction(null); selectCountry(\'' + country.replace(/'/g, "\\'") + '\')">DISCLOSE</span>' +
        '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderAssetPanel(country, actionType) {
    var assets = getDiplomaticAssets();
    var capital = getCountryCapital(country);

    var html = '<div class="diplo-asset-panel">';

    // Remote option
    var remoteChance = getOutreachSuccessChance('REMOTE', 2);
    html += '<div class="diplo-asset-option">' +
      '<div class="diplo-asset-info">' +
        '<span class="diplo-asset-name">REMOTE (No asset required)</span>' +
        '<span class="diplo-asset-meta">Immediate &middot; Success: ' + Math.round(remoteChance * 100) + '%</span>' +
      '</div>' +
      '<span class="diplo-send-btn" onclick="event.stopPropagation(); startOutreach(\'' + country.replace(/'/g, "\\'") + '\', null, \'REMOTE\')">SEND</span>' +
    '</div>';

    // Asset options
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (a.status !== 'STATIONED') continue;

      var transit = calcTransitMinutes(a, capital.lat, capital.lon);
      var chance = getOutreachSuccessChance('IN_PERSON', a.diplomaticEffectiveness);

      html += '<div class="diplo-asset-option">' +
        '<div class="diplo-asset-info">' +
          '<span class="diplo-asset-name">' + a.name + '</span>' +
          '<span class="diplo-asset-meta">' +
            (transit > 0 ? 'Transit: ' + formatTransitTime(transit) + ' &middot; ' : 'Instant &middot; ') +
            'Success: ' + Math.round(chance * 100) + '% &middot; Eff: ' + a.diplomaticEffectiveness +
          '</span>' +
        '</div>' +
        '<span class="diplo-send-btn" onclick="event.stopPropagation(); startOutreach(\'' + country.replace(/'/g, "\\'") + '\', \'' + a.id + '\', \'IN_PERSON\')">SEND</span>' +
      '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderClearanceAssetPanel(country) {
    var assets = getDiplomaticAssets();
    var capital = getCountryCapital(country);

    var html = '<div class="diplo-asset-panel">';

    // Remote option
    html += '<div class="diplo-asset-option">' +
      '<div class="diplo-asset-info">' +
        '<span class="diplo-asset-name">REMOTE (Standard timeline)</span>' +
        '<span class="diplo-asset-meta">Approval: ' + Math.round(getClearanceApprovalChance(V.diplomacy[country].stance) * 100) + '%</span>' +
      '</div>' +
      '<span class="diplo-send-btn" onclick="event.stopPropagation(); startClearanceRequest(\'' + country.replace(/'/g, "\\'") + '\', null)">REQUEST</span>' +
    '</div>';

    // Asset options (faster)
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (a.status !== 'STATIONED') continue;

      var transit = calcTransitMinutes(a, capital.lat, capital.lon);

      html += '<div class="diplo-asset-option">' +
        '<div class="diplo-asset-info">' +
          '<span class="diplo-asset-name">' + a.name + '</span>' +
          '<span class="diplo-asset-meta">' +
            (transit > 0 ? 'Transit: ' + formatTransitTime(transit) + ' &middot; ' : '') +
            '40-60% faster resolution' +
          '</span>' +
        '</div>' +
        '<span class="diplo-send-btn" onclick="event.stopPropagation(); startClearanceRequest(\'' + country.replace(/'/g, "\\'") + '\', \'' + a.id + '\')">REQUEST</span>' +
      '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Helpers ---

  function getActiveMissions(country) {
    var cd = V.diplomacy[country];
    if (!cd || !cd.missions) return [];
    return cd.missions.filter(function(m) {
      return m.status === 'IN_TRANSIT' || m.status === 'EXECUTING';
    });
  }

  function getDisclosableThreats(country) {
    if (!V.threats) return [];
    return V.threats.filter(function(t) {
      return t.foreignTarget && t.foreignTarget.country === country && !t.foreignTarget.disclosed &&
             t.status !== 'NEUTRALIZED' && t.status !== 'EXPIRED';
    });
  }

  // --- Badge & Hook Listeners ---

  hook('diplomatic:incident', function() {
    if (V.ui.activeWorkspace === 'diplomacy') {
      renderCountryList();
      if (_selectedCountry) renderCountryDetail(_selectedCountry);
    } else {
      _badgeCount++;
      updateWorkspaceBadge('diplomacy', _badgeCount);
    }
  });

  hook('diplomatic:mission:complete', function() {
    if (V.ui.activeWorkspace === 'diplomacy') {
      renderCountryList();
      if (_selectedCountry) renderCountryDetail(_selectedCountry);
    } else {
      _badgeCount++;
      updateWorkspaceBadge('diplomacy', _badgeCount);
    }
  });

  hook('tick:hour', function() {
    if (V.ui.activeWorkspace === 'diplomacy' && _selectedCountry) {
      renderCountryDetail(_selectedCountry);
    }
  });

})();
