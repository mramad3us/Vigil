/* ============================================================
   VIGIL — workspaces/illegals/illegals.js
   Illegals workspace — detained operatives, foreign intelligence
   service organizations, interrogation management.
   ============================================================ */

(function() {

  var _mode = 'PRISONERS';   // 'PRISONERS' | 'AGENCIES'
  var _selectedPrisonerId = null;
  var _selectedAgencyId = null;
  var _badgeCount = 0;


  registerWorkspace({
    id: 'illegals',
    label: 'Illegals',
    icon: '\u2622',

    init: function() {
      var container = $('ws-illegals');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:300px;min-width:260px;max-width:360px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title" id="ill-list-title">DETAINED OPERATIVES</span>' +
              '<span class="ws-list-count" id="ill-count"></span>' +
            '</div>' +
            '<div class="ill-toolbar">' +
              '<span class="ill-tab-btn active" id="ill-tab-prisoners" onclick="setIllMode(\'PRISONERS\')">PRISONERS</span>' +
              '<span class="ill-tab-btn" id="ill-tab-agencies" onclick="setIllMode(\'AGENCIES\')">ORGANIZATIONS</span>' +
            '</div>' +
            '<div class="ws-list-body" id="ill-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="ill-detail">' +
              '<div class="ill-empty">Select an operative or organization to view details</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {
      _badgeCount = 0;
      updateWorkspaceBadge('illegals', 0);
    },

    deactivate: function() {},

    render: function() {
      if (_mode === 'PRISONERS') {
        renderPrisonerList();
        if (_selectedPrisonerId) renderPrisonerDetail(_selectedPrisonerId);
      } else {
        renderAgencyList();
        if (_selectedAgencyId) renderAgencyDetail(_selectedAgencyId);
      }
    },
  });

  // --- Badge on capture ---
  hook('prisoner:captured', function() {
    if (V.ui.activeWorkspace !== 'illegals') {
      _badgeCount++;
      updateWorkspaceBadge('illegals', _badgeCount);
    }
  });

  // --- Global Handlers ---

  window.setIllMode = function(mode) {
    _mode = mode;
    $('ill-tab-prisoners').classList.toggle('active', mode === 'PRISONERS');
    $('ill-tab-agencies').classList.toggle('active', mode === 'AGENCIES');
    $('ill-list-title').textContent = mode === 'PRISONERS' ? 'DETAINED OPERATIVES' : 'INTELLIGENCE SERVICES';

    if (mode === 'PRISONERS') {
      renderPrisonerList();
      if (_selectedPrisonerId) {
        renderPrisonerDetail(_selectedPrisonerId);
      } else {
        $('ill-detail').innerHTML = '<div class="ill-empty">Select a detained operative to view details</div>';
      }
    } else {
      renderAgencyList();
      if (_selectedAgencyId) {
        renderAgencyDetail(_selectedAgencyId);
      } else {
        $('ill-detail').innerHTML = '<div class="ill-empty">Select an intelligence service to view details</div>';
      }
    }
  };

  window.selectPrisoner = function(id) {
    _selectedPrisonerId = id;
    renderPrisonerList();
    renderPrisonerDetail(id);
  };

  window.selectAgency = function(id) {
    _selectedAgencyId = id;
    renderAgencyList();
    renderAgencyDetail(id);
  };

  window.confirmRepatriate = function(id) {
    var p = getPrisoner(id);
    if (!p) return;
    var svc = getServiceById(p.agency);
    var isNonState = svc && svc.type === 'NON_STATE';

    if (isNonState) {
      // Non-state: show enemy country selection
      var enemies = svc.enemies || [];
      if (enemies.length === 0) return;
      var body = '<div class="response-select-instruction">' +
        'Transfer <strong>' + getPrisonerDisplayName(p) + '</strong> (' + p.tierLabel + ', ' + esc(svc.shortLabel) + ') to an allied intelligence service.<br><br>' +
        'Select a country to receive the prisoner and interrogation intelligence. Relations with that country will improve.' +
      '</div>';
      body += '<div class="response-select-grid">';
      for (var ei = 0; ei < enemies.length; ei++) {
        var country = enemies[ei];
        var rel = typeof getRelations === 'function' ? getRelations(country) : null;
        var relPct = rel !== null ? Math.round(rel) + '%' : '—';
        body += '<div class="response-card" onclick="executeTransfer(\'' + esc(id) + '\',\'' + esc(country) + '\')">' +
          '<div class="response-card-header">' +
            '<span class="response-card-name">' + esc(country) + '</span>' +
            '<span class="response-card-short">RELATIONS: ' + relPct + '</span>' +
          '</div>' +
          '<div class="response-card-desc">Transfer prisoner to ' + esc(country) + '\'s intelligence service for exploitation.</div>' +
        '</div>';
      }
      body += '</div>';
      showModal('TRANSFER PRISONER', body, { pause: false, wide: true, actions: [
        { label: 'CANCEL', onclick: 'hideModal()', primary: false },
      ]});
    } else {
      // State agency: standard repatriation
      showModal('CONFIRM REPATRIATION',
        '<div class="response-select-instruction">' +
          'Repatriate <strong>' + getPrisonerDisplayName(p) + '</strong> (' + p.tierLabel + ') to ' + p.agencyCountry + '?<br><br>' +
          'This will end interrogation and return the prisoner in exchange for a diplomatic relations improvement ' +
          'with ' + p.agencyCountry + '.<br><br>' +
          'Total intelligence yielded: ' + Math.round(p.interrogation.totalIntelYielded) + ' INTEL.' +
        '</div>',
        { pause: false, actions: [
          { label: 'REPATRIATE', onclick: "executeRepatriate('" + id + "')", primary: true },
          { label: 'CANCEL', onclick: 'hideModal()', primary: false },
        ]});
    }
  };

  window.executeRepatriate = function(id) {
    hideModal();
    repatriatePrisoner(id);
    _selectedPrisoner = null;
    renderPrisonerList();
    var detail = $('ill-detail');
    if (detail) detail.innerHTML = '<div class="ws-detail-empty">Select a prisoner</div>';
  };

  window.executeTransfer = function(id, country) {
    hideModal();
    repatriatePrisoner(id, country);
    _selectedPrisoner = null;
    renderPrisonerList();
    var detail = $('ill-detail');
    if (detail) detail.innerHTML = '<div class="ws-detail-empty">Select a prisoner</div>';
  };

  window.executePursue = function(agencyId) {
    pursueAgencyOp(agencyId);
    renderAgencyList();
    renderAgencyDetail(agencyId);
  };

  // ===================================================================
  //  PRISONER LIST
  // ===================================================================

  function renderPrisonerList() {
    var list = $('ill-list');
    if (!list) return;

    var countEl = $('ill-count');
    if (countEl) countEl.textContent = V.prisoners.length + ' active';

    if (V.prisoners.length === 0) {
      list.innerHTML = '<div class="ill-empty">No detained operatives</div>';
      return;
    }

    var html = '<div class="ill-group-header">ACTIVE DETENTION</div>';
    for (var i = 0; i < V.prisoners.length; i++) {
      html += renderPrisonerRow(V.prisoners[i]);
    }

    list.innerHTML = html;
  }

  function renderPrisonerRow(p) {
    var sel = p.id === _selectedPrisonerId ? ' selected' : '';
    var tierCls = p.tier === 'DEEP_COVER' ? 'tier-deep' : p.tier === 'MISSION_SPECIFIC' ? 'tier-mission' : 'tier-recruited';
    var tierShort = p.tier === 'DEEP_COVER' ? 'DEEP' : p.tier === 'MISSION_SPECIFIC' ? 'MSA' : 'RCA';

    var rightBadge = '';
    if (p.interrogation.driedUp) {
      rightBadge = '<span class="ill-dried-badge">DRIED UP</span>';
    } else {
      var pct = Math.round(p.interrogation.progress);
      rightBadge = '<div class="ill-mini-bar"><div class="ill-mini-bar-fill" style="width:' + pct + '%"></div></div>';
    }

    return '<div class="ill-prisoner-row' + sel + '" onclick="selectPrisoner(\'' + p.id + '\')">' +
      '<div class="ill-prisoner-info">' +
        '<div class="ill-prisoner-name">' + esc(getPrisonerDisplayName(p)) + '</div>' +
        '<div class="ill-prisoner-agency">' + esc(p.agencyLabel ? (getServiceById(p.agency) || {}).shortLabel || p.agency : p.agency) + ' — ' + esc(p.agencyCountry) + '</div>' +
      '</div>' +
      '<span class="ill-tier-badge ' + tierCls + '">' + tierShort + '</span>' +
      rightBadge +
    '</div>';
  }

  // ===================================================================
  //  PRISONER DETAIL
  // ===================================================================

  function renderPrisonerDetail(id) {
    var detail = $('ill-detail');
    if (!detail) return;

    var p = getPrisoner(id);
    if (!p) {
      detail.innerHTML = '<div class="ill-empty">Prisoner not found</div>';
      return;
    }

    var tierCls = p.tier === 'DEEP_COVER' ? 'tier-deep' : p.tier === 'MISSION_SPECIFIC' ? 'tier-mission' : 'tier-recruited';
    var svc = getServiceById(p.agency);
    var svcShort = svc ? svc.shortLabel : p.agency;

    var html = '<div class="ill-detail-header">' +
      '<div class="ill-detail-title">' + esc(getPrisonerDisplayName(p)) + ' <span class="ill-tier-badge ' + tierCls + '">' + esc(p.tierLabel) + '</span></div>' +
      '<div class="ill-detail-subtitle">' + esc(p.agencyLabel) + ' — ' + esc(p.agencyCountry) + '</div>' +
    '</div>';

    html += '<div class="ill-detail-body">';

    // Meta
    html += '<div class="ill-detail-section">';
    html += '<div class="ill-meta-row">' +
      '<div class="ill-meta-item"><span class="ill-meta-label">DETENTION SITE: </span><span class="ill-meta-value">' + esc(p.detentionSite) + '</span></div>' +
      '<div class="ill-meta-item"><span class="ill-meta-label">CAPTURED: </span><span class="ill-meta-value">Day ' + p.capturedDay + '</span></div>' +
    '</div>';
    // Show cover identity line if both cover and real identity are known and they differ
    var _coverName = null, _realName = null;
    for (var ci = 0; ci < p.intelFields.length; ci++) {
      if (p.intelFields[ci].key === 'COVER_IDENTITY' && p.intelFields[ci].revealed) _coverName = extractNameFromIntel(p.intelFields[ci].value);
      if (p.intelFields[ci].key === 'REAL_IDENTITY' && p.intelFields[ci].revealed) _realName = extractNameFromIntel(p.intelFields[ci].value);
    }
    if (_coverName && _realName && _coverName !== _realName) {
      html += '<div class="ill-meta-row"><div class="ill-meta-item"><span class="ill-meta-label">COVER IDENTITY: </span><span class="ill-meta-value">' + esc(_coverName) + '</span></div></div>';
    }
    html += '</div>';

    // Interrogation
    html += '<div class="ill-detail-section">';
    html += '<div class="ill-detail-section-title">INTERROGATION</div>';
    var pct = Math.round(p.interrogation.progress);
    var barCls = p.interrogation.driedUp ? ' dried' : '';
    html += '<div class="ill-interrog-bar"><div class="ill-interrog-bar-fill' + barCls + '" style="width:' + pct + '%"></div></div>';
    html += '<div class="ill-interrog-stats">' +
      '<span><span class="ill-meta-label">PROGRESS: </span><span class="ill-interrog-stat-value">' + pct + '%' + (p.interrogation.driedUp ? ' — EXHAUSTED' : '') + '</span></span>' +
      '<span><span class="ill-meta-label">YIELD RATE: </span><span class="ill-interrog-stat-value">' + (p.interrogation.driedUp ? '0' : (p.interrogation.intelPerHour * (1 - p.interrogation.progress / 100)).toFixed(1)) + '/hr</span></span>' +
      '<span><span class="ill-meta-label">TOTAL INTEL: </span><span class="ill-interrog-stat-value">' + Math.round(p.interrogation.totalIntelYielded) + '</span></span>' +
    '</div>';
    html += '</div>';

    // Intel Fields
    html += '<div class="ill-detail-section">';
    html += '<div class="ill-detail-section-title">INTELLIGENCE FIELDS</div>';
    for (var i = 0; i < p.intelFields.length; i++) {
      html += renderIntelField(p.intelFields[i]);
    }
    html += '</div>';

    // Actions
    var _svc = getServiceById(p.agency);
    var _isNonState = _svc && _svc.type === 'NON_STATE';
    var btnLabel = _isNonState ? 'TRANSFER TO ALLIED SERVICE' : ('REPATRIATE TO ' + esc(p.agencyCountry).toUpperCase());
    html += '<div class="ill-detail-section">';
    html += '<button class="ill-repatriate-btn" onclick="confirmRepatriate(\'' + p.id + '\')">' + btnLabel + '</button>';
    html += '</div>';

    html += '</div>';
    detail.innerHTML = html;
  }

  // ===================================================================
  //  AGENCY LIST
  // ===================================================================

  function renderAgencyList() {
    var list = $('ill-list');
    if (!list) return;

    // Group agencies by relationship stance
    var hostile = [], tense = [], neutral = [], friendly = [], nonstate = [];

    for (var agencyId in V.agencies) {
      var agency = V.agencies[agencyId];
      var svc = getServiceById(agencyId);
      if (!svc) continue;

      if (svc.type === 'NON_STATE') {
        nonstate.push({ agency: agency, svc: svc });
        continue;
      }

      var cd = V.diplomacy[svc.country];
      var rel = cd ? cd.relations : 50;
      if (rel <= 10) hostile.push({ agency: agency, svc: svc, rel: rel });
      else if (rel <= 25) tense.push({ agency: agency, svc: svc, rel: rel });
      else if (rel <= 50) neutral.push({ agency: agency, svc: svc, rel: rel });
      else friendly.push({ agency: agency, svc: svc, rel: rel });
    }

    var countEl = $('ill-count');
    if (countEl) countEl.textContent = Object.keys(V.agencies).length + ' orgs';

    var html = '';

    var groups = [
      { label: 'HOSTILE', items: hostile },
      { label: 'TENSE', items: tense },
      { label: 'NEUTRAL', items: neutral },
      { label: 'FRIENDLY / ALLIED', items: friendly },
      { label: 'NON-STATE', items: nonstate },
    ];

    for (var g = 0; g < groups.length; g++) {
      if (groups[g].items.length === 0) continue;
      html += '<div class="ill-group-header">' + groups[g].label + '</div>';
      for (var a = 0; a < groups[g].items.length; a++) {
        html += renderAgencyRow(groups[g].items[a]);
      }
    }

    if (html === '') html = '<div class="ill-empty">No intelligence services registered</div>';
    list.innerHTML = html;
  }

  function renderAgencyRow(item) {
    var agency = item.agency;
    var svc = item.svc;
    var sel = agency.id === _selectedAgencyId ? ' selected' : '';
    var typeCls = svc.type === 'NON_STATE' ? 'nonstate' : 'state';
    var typeLabel = svc.type === 'NON_STATE' ? 'NON-STATE' : 'STATE';

    // Count held prisoners for this agency
    var prisonerCount = 0;
    for (var i = 0; i < V.prisoners.length; i++) {
      if (V.prisoners[i].agency === agency.id) prisonerCount++;
    }

    // Intel progress indicator
    var revealedFields = 0;
    for (var f = 0; f < agency.intelFields.length; f++) {
      if (agency.intelFields[f].revealed) revealedFields++;
    }

    var countryLabel = svc.country || (svc.countries ? svc.countries.slice(0, 2).join(', ') : '');

    return '<div class="ill-agency-row' + sel + '" onclick="selectAgency(\'' + agency.id + '\')">' +
      '<div class="ill-agency-info">' +
        '<div class="ill-agency-short">' + esc(agency.shortLabel) + '</div>' +
        '<div class="ill-agency-country">' + esc(countryLabel) + '</div>' +
      '</div>' +
      '<span class="ill-agency-type-badge ' + typeCls + '">' + typeLabel + '</span>' +
      (prisonerCount > 0 ? '<span class="ill-prisoner-count-badge">' + prisonerCount + '</span>' : '') +
      '<span style="font-family:var(--font-mono);font-size:8px;color:var(--text-dim)">' + revealedFields + '/' + agency.intelFields.length + '</span>' +
    '</div>';
  }

  // ===================================================================
  //  AGENCY DETAIL
  // ===================================================================

  function renderAgencyDetail(id) {
    var detail = $('ill-detail');
    if (!detail) return;

    var agency = V.agencies[id];
    if (!agency) {
      detail.innerHTML = '<div class="ill-empty">Agency not found</div>';
      return;
    }

    var svc = getServiceById(id);
    var countryLabel = agency.country || (agency.countries ? agency.countries.join(', ') : 'Unknown');
    var typeCls = (svc && svc.type === 'NON_STATE') ? 'nonstate' : 'state';
    var typeLabel = (svc && svc.type === 'NON_STATE') ? 'NON-STATE ORGANIZATION' : 'STATE INTELLIGENCE SERVICE';

    // Relationship
    var relStr = '';
    if (agency.country && V.diplomacy[agency.country]) {
      var cd = V.diplomacy[agency.country];
      relStr = cd.relations + '% (' + (cd.stance || 'NEUTRAL') + ')';
    }

    var html = '<div class="ill-detail-header">' +
      '<div class="ill-detail-title">' + esc(agency.label) + '</div>' +
      '<div class="ill-detail-subtitle">' + esc(countryLabel) + ' — <span class="ill-agency-type-badge ' + typeCls + '">' + typeLabel + '</span>' +
        (relStr ? ' — Relations: ' + relStr : '') + '</div>' +
    '</div>';

    html += '<div class="ill-detail-body">';

    // Agency Intel Fields
    html += '<div class="ill-detail-section">';
    html += '<div class="ill-detail-section-title">INTELLIGENCE COLLECTION</div>';

    // Prisoner acceleration note
    var heldPrisoners = [];
    for (var pi = 0; pi < V.prisoners.length; pi++) {
      if (V.prisoners[pi].agency === id && !V.prisoners[pi].interrogation.driedUp) {
        heldPrisoners.push(V.prisoners[pi]);
      }
    }
    if (heldPrisoners.length > 0) {
      var totalAccel = 0;
      for (var pa = 0; pa < heldPrisoners.length; pa++) {
        totalAccel += heldPrisoners[pa].interrogation.agencyTicksPerHour;
      }
      html += '<div style="font-size:9px;color:var(--green);margin-bottom:var(--sp-2);font-family:var(--font-mono);">' +
        'ACCELERATED: ' + heldPrisoners.length + ' prisoner(s) contributing +' + totalAccel + ' ticks/hour to agency intelligence</div>';
    }

    for (var f = 0; f < agency.intelFields.length; f++) {
      var field = agency.intelFields[f];
      html += renderAgencyIntelField(field, id);
    }
    html += '</div>';

    // Associated Threats
    var relatedThreats = [];
    for (var t = 0; t < V.threats.length; t++) {
      if (V.threats[t].agencyId === id && V.threats[t].status === 'ACTIVE') {
        relatedThreats.push(V.threats[t]);
      }
    }
    if (relatedThreats.length > 0) {
      html += '<div class="ill-detail-section">';
      html += '<div class="ill-detail-section-title">ACTIVE THREATS</div>';
      for (var rt = 0; rt < relatedThreats.length; rt++) {
        var threat = relatedThreats[rt];
        html += '<div class="ill-link-row">' + esc(threat.orgName) + ' — ' + esc(threat.location.city) + ' (TL ' + threat.threatLevel + ')</div>';
      }
      html += '</div>';
    }

    // Held Prisoners
    var allPrisoners = [];
    for (var pp = 0; pp < V.prisoners.length; pp++) {
      if (V.prisoners[pp].agency === id) allPrisoners.push(V.prisoners[pp]);
    }
    if (allPrisoners.length > 0) {
      html += '<div class="ill-detail-section">';
      html += '<div class="ill-detail-section-title">DETAINED OPERATIVES</div>';
      for (var dp = 0; dp < allPrisoners.length; dp++) {
        var prisoner = allPrisoners[dp];
        var statusLabel = prisoner.interrogation.driedUp ? 'DRIED UP' : Math.round(prisoner.interrogation.progress) + '%';
        html += '<div class="ill-link-row" onclick="setIllMode(\'PRISONERS\');selectPrisoner(\'' + prisoner.id + '\')">' +
          esc(getPrisonerDisplayName(prisoner)) + ' — ' + esc(prisoner.tierLabel) + ' [' + statusLabel + ']</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    detail.innerHTML = html;
  }

  // ===================================================================
  //  INTEL FIELD RENDERERS
  // ===================================================================

  function renderIntelField(field) {
    var cls = field.revealed ? ' revealed' : '';
    var pct = field.ticksToReveal > 0 ? Math.min(100, Math.round((field.ticksAccumulated / field.ticksToReveal) * 100)) : 0;

    var html = '<div class="ill-intel-field' + cls + '">';
    html += '<div class="ill-intel-field-header">' +
      '<span class="ill-intel-field-label">' + esc(field.label) + '</span>' +
      '<span class="ill-intel-field-diff">' + field.difficulty + ' / ' + field.source + '</span>' +
    '</div>';

    if (field.revealed && field.value) {
      html += '<div class="ill-intel-field-value">' + esc(field.value) + '</div>';
    } else {
      html += '<div class="ill-intel-field-progress"><div class="ill-intel-field-progress-fill" style="width:' + pct + '%"></div></div>';
    }

    html += '</div>';
    return html;
  }

  function renderAgencyIntelField(field, agencyId) {
    var cls = field.revealed ? (field.dynamic && field.pendingPursue ? ' revealed dynamic-pending' : ' revealed') : '';
    var pct = field.ticksToReveal > 0 ? Math.min(100, Math.round((field.ticksAccumulated / field.ticksToReveal) * 100)) : 0;

    var html = '<div class="ill-intel-field' + cls + '">';
    html += '<div class="ill-intel-field-header">' +
      '<span class="ill-intel-field-label">' + esc(field.label) + (field.dynamic ? ' [DYNAMIC]' : '') + '</span>' +
      '<span class="ill-intel-field-diff">' + field.difficulty + ' / ' + field.source + '</span>' +
    '</div>';

    if (field.revealed && field.value) {
      html += '<div class="ill-intel-field-value">' + esc(field.value) + '</div>';
      if (field.dynamic && field.pendingPursue) {
        html += '<button class="ill-pursue-btn" onclick="executePursue(\'' + agencyId + '\')">PURSUE THIS LEAD</button>';
      }
    } else {
      html += '<div class="ill-intel-field-progress"><div class="ill-intel-field-progress-fill" style="width:' + pct + '%"></div></div>';
    }

    html += '</div>';
    return html;
  }

  // --- Utility ---
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
