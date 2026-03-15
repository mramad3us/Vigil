/* ============================================================
   VIGIL — workspaces/diplomacy/diplomacy.js
   Diplomacy workspace — manage country relationships,
   deploy envoys, request clearances, war/peace/alliances.
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

  window.showDeclareWarConfirm = function(country) {
    var esc = country.replace(/'/g, "\\'");
    var bodyHtml =
      '<p style="color:var(--text);line-height:1.7;margin-bottom:var(--sp-4)">Declare war on <strong>' + country + '</strong>? This will sever all diplomatic ties and set relations to 0%.</p>' +
      '<div style="display:flex;gap:var(--sp-2);justify-content:flex-end">' +
        '<button class="modal-btn" onclick="hideModal()" style="min-width:100px">ABORT</button>' +
        '<button class="modal-btn modal-btn-primary" onclick="doDeclareWar(\'' + esc + '\')" style="min-width:100px;background:var(--red);border-color:var(--red)">CONFIRM</button>' +
      '</div>';
    showModal('DECLARATION OF WAR', bodyHtml, { pause: true });
  };

  window.doDeclareWar = function(country) {
    hideModal();
    declareWar(country);
    _activeAction = null;
    renderCountryDetail(country);
    renderCountryList();
  };

  window.doCeasefire = function(country) {
    if (proposeCeasefire(country)) {
      _activeAction = null;
      renderCountryDetail(country);
      renderCountryList();
    }
  };

  window.doPeace = function(country) {
    if (proposePeace(country)) {
      _activeAction = null;
      renderCountryDetail(country);
      renderCountryList();
    }
  };

  window.doGift = function(country) {
    if (sendDiplomaticGift(country)) {
      _activeAction = null;
      renderCountryDetail(country);
      renderCountryList();
    }
  };

  window.doAllianceProposal = function(country, tier) {
    proposeAlliance(country, tier);
    _activeAction = null;
    renderCountryDetail(country);
    renderCountryList();
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
    var groups = {};
    for (var i = 0; i < countries.length; i++) {
      var c = countries[i];
      var level = deriveStance(c);
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
    var stance = deriveStance(country);
    var tier = getStanceTier(stance);
    var selected = (_selectedCountry === country) ? ' selected' : '';

    var indicators = '';
    // War indicator
    if (cd.atWar) {
      indicators += '<span class="diplo-indicator" style="color:var(--red)" title="AT WAR">\u2694</span>';
    }
    // Alliance badge
    if (cd.alliance) {
      indicators += '<span class="diplo-indicator" style="color:var(--green)" title="' + cd.alliance + ' alliance">\u2726</span>';
    }
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
    if (cd.pendingProposal) {
      indicators += '<span class="diplo-indicator" style="color:var(--accent)" title="Pending proposal">\u2709</span>';
    }

    return '<div class="diplo-country-row' + selected + '" onclick="selectCountry(\'' + country.replace(/'/g, "\\'") + '\')">' +
      '<span class="diplo-stance-dot" style="background:' + tier.color + '"></span>' +
      '<span class="diplo-country-name">' + country + '</span>' +
      (indicators ? '<span class="diplo-indicators">' + indicators + '</span>' : '') +
      '<span class="diplo-stance-chip" style="background:' + tier.color + '22;color:' + tier.color + '">' + cd.relations + '% ' + tier.label + '</span>' +
    '</div>';
  }

  // --- Country Detail Rendering ---

  function renderCountryDetail(country) {
    var detailEl = $('diplo-detail');
    if (!detailEl || !V.diplomacy[country]) return;

    var cd = V.diplomacy[country];
    var stance = deriveStance(country);
    var tier = getStanceTier(stance);
    var perms = getStancePermissions(stance);

    var html = '';

    // Header
    html += '<div class="diplo-detail-header">' +
      '<span class="diplo-detail-name">' + country + '</span>' +
      '<span class="diplo-detail-stance" style="background:' + tier.color + '22;color:' + tier.color + '">' + tier.label + '</span>' +
    '</div>';

    // War state indicator
    if (cd.atWar) {
      html += '<div style="background:var(--red)22;border:1px solid var(--red);padding:6px 10px;margin-bottom:8px;font-size:var(--fs-sm);color:var(--red)">' +
        '\u2694 AT WAR — All diplomatic channels severed. Military operations authorized.</div>';
    }

    // Alliance display
    if (cd.alliance) {
      html += '<div style="background:var(--green)22;border:1px solid var(--green);padding:6px 10px;margin-bottom:8px;font-size:var(--fs-sm);color:var(--green)">' +
        '\u2726 ' + cd.alliance + ' ALLIANCE — Active bilateral cooperation agreement.</div>';
    }

    // Ceasefire indicator
    if (cd.ceasefire) {
      var cfRemaining = cd.ceasefire.expiryDay - V.time.day;
      html += '<div style="background:var(--amber)22;border:1px solid var(--amber);padding:6px 10px;margin-bottom:8px;font-size:var(--fs-sm);color:var(--amber)">' +
        'CEASEFIRE ACTIVE — ' + cfRemaining + ' days remaining. Pursue peace treaty to stabilize relations.</div>';
    }

    // Peace treaty indicator
    if (cd.peaceTreaty) {
      var ptRemaining = cd.peaceTreaty.expiryDay - V.time.day;
      html += '<div style="background:var(--accent)22;border:1px solid var(--accent);padding:6px 10px;margin-bottom:8px;font-size:var(--fs-sm);color:var(--accent)">' +
        'PEACE TREATY — ' + ptRemaining + ' days remaining. Sovereignty violation penalties halved.</div>';
    }

    // Pending alliance proposal
    if (cd.pendingProposal) {
      html += '<div style="background:var(--accent)22;border:1px solid var(--accent);padding:6px 10px;margin-bottom:8px;font-size:var(--fs-sm);color:var(--accent)">' +
        '\u2709 ' + country + ' proposes a ' + cd.pendingProposal + ' alliance. ' +
        '<span class="diplo-send-btn" style="margin-left:8px" onclick="event.stopPropagation(); acceptAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\'); selectCountry(\'' + country.replace(/'/g, "\\'") + '\')">ACCEPT</span> ' +
        '<span class="diplo-send-btn" style="margin-left:4px;background:var(--red)22;color:var(--red)" onclick="event.stopPropagation(); declineAllianceProposal(\'' + country.replace(/'/g, "\\'") + '\'); selectCountry(\'' + country.replace(/'/g, "\\'") + '\')">DECLINE</span>' +
      '</div>';
    }

    // Relations bar (continuous 0-100%)
    html += '<div class="diplo-section"><div class="diplo-section-title">RELATIONS</div>';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '<div style="flex:1;height:12px;background:var(--surface-2);border-radius:2px;overflow:hidden">' +
        '<div style="width:' + cd.relations + '%;height:100%;background:' + tier.color + ';transition:width 0.3s"></div>' +
      '</div>' +
      '<span style="font-size:var(--fs-sm);color:' + tier.color + ';min-width:42px;text-align:right">' + cd.relations + '%</span>' +
    '</div>';
    html += '</div>';

    // Permissions
    html += '<div class="diplo-section"><div class="diplo-section-title">PERMISSIONS</div>';
    html += '<div class="diplo-perm-grid">';
    html += renderPermRow('COVERT OPS', true, 'Risk: ' + Math.round(perms.covertRisk * 100) + '%', perms.covertRisk > 0.5 ? 'risky' : 'authorized');
    html += renderPermRow('OVERT OPS', perms.overtOps || (cd.pendingClearance && cd.pendingClearance.status === 'GRANTED'));
    html += '</div></div>';

    // Clearance Status
    html += '<div class="diplo-section"><div class="diplo-section-title">CLEARANCE STATUS</div>';
    if (cd.pendingClearance) {
      var cl = cd.pendingClearance;
      if (cl.status === 'PENDING') {
        var remaining = cl.estimatedCompletion - V.time.totalMinutes;
        var approvalChance = getClearanceApprovalChance(stance, country);
        var modeLabel = cl.mode === 'IN_PERSON' ? 'In-person envoy' : 'Diplomatic cable';

        var assetInTransit = false;
        var assetTransitRemaining = 0;
        if (cl.assetId) {
          var clAsset = getAsset(cl.assetId);
          if (clAsset && clAsset.status === 'IN_TRANSIT') {
            assetInTransit = true;
            assetTransitRemaining = Math.max(0, (clAsset.transitStartTotalMinutes + clAsset.transitDurationMinutes) - V.time.totalMinutes);
          }
        }

        html += '<div style="font-size:var(--fs-sm);color:var(--text);line-height:1.8">' +
          'Status: <span style="color:var(--amber)">PENDING</span> &middot; ' +
          modeLabel + '<br>';

        if (assetInTransit) {
          html += 'Envoy in transit to capital: <span style="color:var(--amber)">' + formatTransitTime(Math.round(assetTransitRemaining)) + ' remaining</span><br>' +
            'Negotiation begins on arrival. ';
        }

        html += 'Expected response: <span style="color:var(--text)">' + formatTransitTime(Math.max(0, remaining)) + '</span> &middot; ' +
          'Approval likelihood: ' + Math.round(approvalChance * 100) + '%' +
        '</div>';
      } else {
        var statusColor = cl.status === 'GRANTED' ? 'var(--green)' : 'var(--red)';
        var statusLabel = cl.status === 'GRANTED'
          ? 'CLEARANCE GRANTED — ' + country + ' has authorized overt operations'
          : 'CLEARANCE DENIED — ' + country + ' has refused authorization';
        html += '<div style="font-size:var(--fs-sm);color:' + statusColor + '">' + statusLabel + '</div>';
      }
    } else {
      html += '<div style="font-size:var(--fs-xs);color:var(--text-muted)">No active clearance request</div>';
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

    // Relations History
    if (cd.relationsHistory && cd.relationsHistory.length > 0) {
      html += '<div class="diplo-section"><div class="diplo-section-title">RELATIONS HISTORY</div>';
      var history = cd.relationsHistory.slice(-8).reverse();
      for (var h = 0; h < history.length; h++) {
        var entry = history[h];
        var delta = entry.to - entry.from;
        var deltaColor = delta > 0 ? 'var(--green)' : 'var(--red)';
        var deltaStr = delta > 0 ? '+' + delta + '%' : delta + '%';
        html += '<div class="diplo-history-row">' +
          '<span class="diplo-history-time">D' + entry.day + ' ' + String(entry.hour).padStart(2, '0') + '00</span>' +
          '<span style="color:' + deltaColor + '">' + entry.from + '% \u2192 ' + entry.to + '% (' + deltaStr + ')</span>' +
          (entry.reason ? '<span style="color:var(--text-muted);font-size:var(--fs-xs);margin-left:6px">' + entry.reason + '</span>' : '') +
        '</div>';
      }
      html += '</div>';
    }

    // Diplomatic Actions
    html += '<div class="diplo-section"><div class="diplo-section-title">DIPLOMATIC ACTIONS</div>';
    html += renderGiftCard(country, cd);
    html += renderOutreachCard(country, cd);
    html += renderClearanceCard(country, cd);
    html += renderShareIntelCard(country);
    html += renderWarCard(country, cd);
    html += renderCeasefireCard(country, cd);
    html += renderPeaceCard(country, cd);
    html += renderAllianceCard(country, cd);
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

  function renderGiftCard(country, cd) {
    var disabled = false;
    var reason = '';

    if (cd.atWar) { disabled = true; reason = 'Cannot send aid to nations at war'; }
    else if (V.resources.intel < 15) { disabled = true; reason = 'Insufficient intel (15 required)'; }
    else if (V.time.day - cd.lastGiftDay < 14) {
      var cooldownLeft = 14 - (V.time.day - cd.lastGiftDay);
      disabled = true;
      reason = 'Cooldown: ' + cooldownLeft + ' days remaining';
    }

    var esc = country.replace(/'/g, "\\'");
    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + '"' +
      (!disabled ? ' onclick="doGift(\'' + esc + '\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">DIPLOMATIC AID</span>' +
        '<span class="diplo-action-cost">15 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">Send diplomatic aid package. +8% relations. 14-day cooldown per country.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '') +
    '</div>';
    return html;
  }

  function renderOutreachCard(country, cd) {
    var stance = deriveStance(country);
    var cost = getOutreachCost(stance);
    var disabled = false;
    var reason = '';

    if (cd.atWar) { disabled = true; reason = 'Cannot engage nations at war'; }
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
      '<div class="diplo-action-desc">Attempt to improve relations. +5% on success.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '');

    if (expanded) {
      html += renderAssetPanel(country, 'OUTREACH');
    }

    html += '</div>';
    return html;
  }

  function renderClearanceCard(country, cd) {
    var stance = deriveStance(country);
    var disabled = false;
    var reason = '';

    if (stance >= 6) {
      disabled = true;
      reason = 'Overt operations already authorized at this stance';
    } else if (cd.pendingClearance && cd.pendingClearance.status === 'PENDING') {
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
        Math.round(getClearanceApprovalChance(stance, country) * 100) + '%.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '');

    if (expanded) {
      html += renderClearanceAssetPanel(country);
    }

    html += '</div>';
    return html;
  }

  function renderShareIntelCard(country) {
    var threats = getDisclosableThreats(country);
    var disabled = false;
    var reason = '';

    if (threats.length === 0) { disabled = true; reason = 'No disclosable threats for this country.'; }
    else if (V.resources.intel < 10) { disabled = true; reason = 'Insufficient intel (10 required)'; }

    var expanded = (_activeAction === 'SHARE_INTEL' && !disabled);

    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + (expanded ? ' expanded' : '') + '"' +
      (!disabled ? ' onclick="toggleDiploAction(\'SHARE_INTEL\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">SHARE INTELLIGENCE</span>' +
        '<span class="diplo-action-cost">10 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">' + (threats.length === 0 ? 'No disclosable threats for this country.' : threats.length + ' threat(s) can be disclosed.') + '</div>' +
      (reason && threats.length > 0 ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '');

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

  function renderWarCard(country, cd) {
    if (cd.atWar) return '';
    var disabled = cd.relations >= 15;
    var reason = disabled ? 'Relations must be below 15% to declare war' : '';

    var esc = country.replace(/'/g, "\\'");
    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + '" style="' + (!disabled ? 'border-color:var(--red)' : '') + '"' +
      (!disabled ? ' onclick="showDeclareWarConfirm(\'' + esc + '\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name" style="color:var(--red)">DECLARE WAR</span>' +
        '<span class="diplo-action-cost">FREE</span>' +
      '</div>' +
      '<div class="diplo-action-desc">Formally declare war. Severs all diplomatic channels. Relations set to 0%.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '') +
    '</div>';
    return html;
  }

  function renderCeasefireCard(country, cd) {
    if (!cd.atWar) return '';
    var disabled = V.resources.intel < 15;
    var reason = disabled ? 'Insufficient intel (15 required)' : '';

    var esc = country.replace(/'/g, "\\'");
    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + '"' +
      (!disabled ? ' onclick="doCeasefire(\'' + esc + '\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">PROPOSE CEASEFIRE</span>' +
        '<span class="diplo-action-cost">15 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">Suspend hostilities for 30 days. Relations reset to 10%. Use the window to pursue peace.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '') +
    '</div>';
    return html;
  }

  function renderPeaceCard(country, cd) {
    if (cd.atWar) return '';
    var hasCeasefire = cd.ceasefire && V.time.day < cd.ceasefire.expiryDay;
    if (!hasCeasefire) return '';
    var disabled = V.resources.intel < 25;
    var reason = disabled ? 'Insufficient intel (25 required)' : '';

    var esc = country.replace(/'/g, "\\'");
    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + '"' +
      (!disabled ? ' onclick="doPeace(\'' + esc + '\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">PROPOSE PEACE TREATY</span>' +
        '<span class="diplo-action-cost">25 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">Formalize peace for 90 days. +10% relations. Sovereignty violation penalties halved.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '') +
    '</div>';
    return html;
  }

  function renderAllianceCard(country, cd) {
    if (cd.atWar) return '';

    // Determine what alliance tier the player can propose
    var proposeTier = null;
    if (!cd.alliance && cd.relations >= 60) proposeTier = 'ECONOMIC';
    else if (cd.alliance === 'ECONOMIC' && cd.relations >= 70) proposeTier = 'MILITARY';
    else if (cd.alliance === 'MILITARY' && cd.relations >= 80) proposeTier = 'FULL';

    if (!proposeTier) return '';

    var thresholds = { 'ECONOMIC': 60, 'MILITARY': 70, 'FULL': 80 };
    var acceptPct = Math.min(95, Math.round((0.70 + ((cd.relations - thresholds[proposeTier]) / 20) * 0.25) * 100));
    var disabled = V.resources.intel < 10;
    var reason = disabled ? 'Insufficient intel (10 required)' : '';

    var esc = country.replace(/'/g, "\\'");
    var html = '<div class="diplo-action-card' + (disabled ? ' disabled' : '') + '"' +
      (!disabled ? ' onclick="doAllianceProposal(\'' + esc + '\', \'' + proposeTier + '\')"' : '') + '>' +
      '<div class="diplo-action-header">' +
        '<span class="diplo-action-name">PROPOSE ' + proposeTier + ' ALLIANCE</span>' +
        '<span class="diplo-action-cost">10 INTEL</span>' +
      '</div>' +
      '<div class="diplo-action-desc">' + (cd.alliance ? 'Upgrade alliance to ' + proposeTier + '.' : 'Propose ' + proposeTier + ' alliance.') +
        ' Acceptance: ~' + acceptPct + '%.</div>' +
      (reason ? '<div class="diplo-action-disabled-reason">' + reason + '</div>' : '') +
    '</div>';
    return html;
  }

  function renderAssetPanel(country, actionType) {
    var assets = getDiplomaticAssets();
    var capital = getCountryCapital(country);

    var html = '<div class="diplo-asset-panel">';

    var remoteChance = getOutreachSuccessChance('REMOTE', 2);
    html += '<div class="diplo-asset-option">' +
      '<div class="diplo-asset-info">' +
        '<span class="diplo-asset-name">REMOTE (No asset required)</span>' +
        '<span class="diplo-asset-meta">Immediate &middot; Success: ' + Math.round(remoteChance * 100) + '%</span>' +
      '</div>' +
      '<span class="diplo-send-btn" onclick="event.stopPropagation(); startOutreach(\'' + country.replace(/'/g, "\\'") + '\', null, \'REMOTE\')">SEND</span>' +
    '</div>';

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
    var cd = V.diplomacy[country];
    var stance = deriveStance(country);
    var approvalPct = Math.round(getClearanceApprovalChance(stance, country) * 100);

    var delayRanges = {
      7: [60, 120], 6: [120, 360], 5: [360, 720], 4: [720, 1440],
      3: [1440, 2880], 2: [1440, 2880], 1: [1440, 2880], 0: [1440, 2880],
    };
    var range = delayRanges[stance] || delayRanges[3];
    var remoteMin = range[0];
    var remoteMax = range[1];

    var html = '<div class="diplo-asset-panel">';

    html += '<div class="diplo-asset-option">' +
      '<div class="diplo-asset-info">' +
        '<span class="diplo-asset-name">REMOTE — Diplomatic cable via embassy</span>' +
        '<span class="diplo-asset-meta">' +
          'Approval: ' + approvalPct + '% &middot; ' +
          'Processing: ' + formatTransitTime(remoteMin) + '–' + formatTransitTime(remoteMax) +
        '</span>' +
        '<span class="diplo-asset-meta" style="color:var(--text-muted)">' +
          'Formal request transmitted through existing diplomatic channels. No envoy required — standard bureaucratic timeline.' +
        '</span>' +
      '</div>' +
      '<span class="diplo-send-btn" onclick="event.stopPropagation(); startClearanceRequest(\'' + country.replace(/'/g, "\\'") + '\', null)">REQUEST</span>' +
    '</div>';

    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (a.status !== 'STATIONED') continue;

      var transit = calcTransitMinutes(a, capital.lat, capital.lon);
      var negoMin = Math.round(remoteMin * 0.40);
      var negoMax = Math.round(remoteMax * 0.60);
      var totalMin = transit + negoMin;
      var totalMax = transit + negoMax;

      html += '<div class="diplo-asset-option">' +
        '<div class="diplo-asset-info">' +
          '<span class="diplo-asset-name">' + a.name + '</span>' +
          '<span class="diplo-asset-meta">' +
            'Approval: ' + approvalPct + '% &middot; ' +
            'Est. total: ' + formatTransitTime(totalMin) + '–' + formatTransitTime(totalMax) +
          '</span>' +
          '<span class="diplo-asset-meta" style="color:var(--text-muted)">' +
            (transit > 0 ? 'Transit to capital: ' + formatTransitTime(transit) + '. ' : '') +
            'In-person engagement accelerates host nation deliberation.' +
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

  hook('diplomacy:war', function() {
    if (V.ui.activeWorkspace === 'diplomacy') {
      renderCountryList();
      if (_selectedCountry) renderCountryDetail(_selectedCountry);
    } else {
      _badgeCount++;
      updateWorkspaceBadge('diplomacy', _badgeCount);
    }
  });

  hook('diplomacy:alliance', function() {
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
