/* ============================================================
   VIGIL — systems/saves.js
   localStorage slots, autosave, JSON export/import.
   ============================================================ */

(function() {

  var STORAGE_KEY = 'vigil_saves';
  var AUTOSAVE_ID = '__autosave__';
  var MAX_SAVES = 20;

  // --- Serialization ---

  // Static asset fields that come from ASSET_TEMPLATES — stripped on save, rehydrated on load.
  var ASSET_STATIC_KEYS = [
    'description', 'equipment', 'vehicles', 'unitComposition', 'platform',
    'designation', 'collectionProfile', 'personnel', 'deniability',
    'domesticAuthority', 'diplomaticEffectiveness', 'isMobileBase',
    'effectiveRangeKm', 'fieldUnit', 'teamSize',
  ];

  function serializeState() {
    var snap = JSON.parse(JSON.stringify(V, function(key, value) {
      if (value instanceof Set) return { __set__: true, values: Array.from(value) };
      if (typeof value === 'function') return undefined;
      return value;
    }));

    // --- Slim assets: strip static template fields (rehydrated on load) ---
    if (snap.assets && Array.isArray(snap.assets)) {
      for (var ai = 0; ai < snap.assets.length; ai++) {
        var a = snap.assets[ai];
        for (var si = 0; si < ASSET_STATIC_KEYS.length; si++) {
          delete a[ASSET_STATIC_KEYS[si]];
        }
      }
    }

    // --- Slim operations: strip options + intelFields from completed ops (debrief already stored) ---
    if (snap.operations && Array.isArray(snap.operations)) {
      for (var oi = 0; oi < snap.operations.length; oi++) {
        var op = snap.operations[oi];
        if (op.status === 'SUCCESS' || op.status === 'FAILURE' || op.status === 'EXPIRED') {
          // Keep only the selected option's confidence for reference
          if (op.options && op.selectedOptionIdx !== undefined && op.options[op.selectedOptionIdx]) {
            op._selectedConfidence = op.options[op.selectedOptionIdx].confidencePercent;
          }
          delete op.options;
          delete op.intelFields;
        }
      }
    }

    // --- Slim agencies: strip static config fields (rehydrated from INTELLIGENCE_SERVICES / NON_STATE_AGENCIES on load) ---
    if (snap.agencies && typeof snap.agencies === 'object') {
      for (var agKey in snap.agencies) {
        if (snap.agencies.hasOwnProperty(agKey)) {
          var ag = snap.agencies[agKey];
          delete ag.label;
          delete ag.shortLabel;
          delete ag.country;
          delete ag.countries;
          delete ag.type;
          delete ag.region;
        }
      }
    }

    // --- Cap feed to latest 50 items ---
    if (snap.feed && Array.isArray(snap.feed) && snap.feed.length > 50) {
      snap.feed = snap.feed.slice(snap.feed.length - 50);
    }

    // --- Cap log to latest 100 entries ---
    if (snap.log && Array.isArray(snap.log) && snap.log.length > 100) {
      snap.log = snap.log.slice(snap.log.length - 100);
    }

    return snap;
  }

  function deserializeState(snap) {
    return reviveSets(snap);
  }

  function reviveSets(obj) {
    if (obj && typeof obj === 'object') {
      if (obj.__set__ && Array.isArray(obj.values)) {
        return new Set(obj.values);
      }
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          obj[k] = reviveSets(obj[k]);
        }
      }
    }
    return obj;
  }

  // --- Save/Load ---

  function getAllSaves() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // Slim an existing save's data in-place (compact old bloated saves)
  function compactSaveData(data) {
    if (!data) return;
    // Strip static asset fields
    if (data.assets && Array.isArray(data.assets)) {
      for (var ai = 0; ai < data.assets.length; ai++) {
        var a = data.assets[ai];
        for (var si = 0; si < ASSET_STATIC_KEYS.length; si++) delete a[ASSET_STATIC_KEYS[si]];
      }
    }
    // Strip completed op options/intelFields
    if (data.operations && Array.isArray(data.operations)) {
      for (var oi = 0; oi < data.operations.length; oi++) {
        var op = data.operations[oi];
        if (op.status === 'SUCCESS' || op.status === 'FAILURE' || op.status === 'EXPIRED') {
          if (op.options && op.selectedOptionIdx !== undefined && op.options[op.selectedOptionIdx]) {
            op._selectedConfidence = op.options[op.selectedOptionIdx].confidencePercent;
          }
          delete op.options;
          delete op.intelFields;
        }
      }
    }
    // Strip static agency fields
    if (data.agencies && typeof data.agencies === 'object') {
      for (var agKey in data.agencies) {
        if (data.agencies.hasOwnProperty(agKey)) {
          var ag = data.agencies[agKey];
          delete ag.label; delete ag.shortLabel; delete ag.country;
          delete ag.countries; delete ag.type; delete ag.region;
        }
      }
    }
    // Cap feed + log
    if (data.feed && Array.isArray(data.feed) && data.feed.length > 50) {
      data.feed = data.feed.slice(data.feed.length - 50);
    }
    if (data.log && Array.isArray(data.log) && data.log.length > 100) {
      data.log = data.log.slice(data.log.length - 100);
    }
  }

  function saveGame(slotId, label) {
    try {
      var saves = getAllSaves();
      var id = slotId || uid('SAVE');

      var serialized = serializeState();

      saves[id] = {
        id: id,
        label: label || 'Save',
        callsign: V.player.callsign,
        day: V.time.day,
        viability: Math.round(V.resources.viability),
        timestamp: Date.now(),
        data: serialized,
      };

      // Enforce limit (remove oldest)
      var keys = Object.keys(saves).filter(function(k) { return k !== AUTOSAVE_ID; });
      while (keys.length > MAX_SAVES) {
        var oldest = keys.sort(function(a, b) { return saves[a].timestamp - saves[b].timestamp; })[0];
        delete saves[oldest];
        keys = keys.filter(function(k) { return k !== oldest; });
      }

      var jsonStr = JSON.stringify(saves);
      localStorage.setItem(STORAGE_KEY, jsonStr);
      addLog('Game saved: ' + (label || id), 'log-info');
    } catch (e) {
      console.error('[SAVE] Save failed:', e.message);
      addLog('Save failed: ' + e.message, 'log-warn');
    }
  }

  function loadGame(slotId) {
    var saves = getAllSaves();
    var save = saves[slotId];
    if (!save || !save.data) return false;

    var restored = deserializeState(save.data);
    // Copy restored state into V
    for (var k in restored) {
      if (restored.hasOwnProperty(k)) V[k] = restored[k];
    }

    // Ensure Set fields survive older saves that lacked them
    if (!(V.usedCodenames instanceof Set)) {
      V.usedCodenames = new Set(Array.isArray(V.usedCodenames) ? V.usedCodenames : []);
    }

    // Rehydrate static asset fields from templates (stripped during save to reduce size)
    if (V.assets && typeof getAssetTemplate === 'function') {
      for (var ai = 0; ai < V.assets.length; ai++) {
        var a = V.assets[ai];
        var tpl = getAssetTemplate(a.type);
        if (tpl) {
          // Rehydrate any missing static fields from template
          if (a.description === undefined) a.description = tpl.description || '';
          if (a.equipment === undefined) a.equipment = tpl.equipment ? tpl.equipment.slice() : [];
          if (a.vehicles === undefined) a.vehicles = tpl.vehicles ? tpl.vehicles.slice() : [];
          if (a.unitComposition === undefined) a.unitComposition = tpl.unitComposition || '';
          if (a.platform === undefined) a.platform = tpl.platform || '';
          if (a.designation === undefined) a.designation = tpl.designation || '';
          if (a.collectionProfile === undefined) a.collectionProfile = tpl.collectionProfile || {};
          if (a.personnel === undefined) a.personnel = tpl.personnel || 0;
          if (a.deniability === undefined) a.deniability = tpl.deniability || 'OVERT';
          if (a.domesticAuthority === undefined) a.domesticAuthority = tpl.domesticAuthority || false;
          if (a.diplomaticEffectiveness === undefined) a.diplomaticEffectiveness = tpl.diplomaticEffectiveness || 0;
          if (a.isMobileBase === undefined) a.isMobileBase = tpl.type.indexOf('CSG') === 0;
          if (a.effectiveRangeKm === undefined) a.effectiveRangeKm = tpl.effectiveRangeKm || 0;
          if (a.fieldUnit === undefined) a.fieldUnit = tpl.fieldUnit || false;
          if (a.teamSize === undefined) a.teamSize = tpl.teamSize || 0;
          if (a.maxTeams === undefined) a.maxTeams = tpl.maxTeams || 0;
          if (a.availableTeams === undefined) a.availableTeams = a.maxTeams;
        }
        if (!a.recoveryQueue) a.recoveryQueue = [];
      }
    }

    // Rehydrate static agency fields from config (stripped during save)
    if (V.agencies && typeof INTELLIGENCE_SERVICES !== 'undefined' && typeof NON_STATE_AGENCIES !== 'undefined') {
      var allServices = INTELLIGENCE_SERVICES.concat(NON_STATE_AGENCIES);
      for (var agId in V.agencies) {
        if (V.agencies.hasOwnProperty(agId)) {
          var ag = V.agencies[agId];
          if (ag.label === undefined) {
            // Find matching service config
            for (var si = 0; si < allServices.length; si++) {
              if (allServices[si].id === agId) {
                var svc = allServices[si];
                ag.label = svc.label;
                ag.shortLabel = svc.shortLabel;
                ag.country = svc.country || null;
                ag.countries = svc.countries || null;
                ag.type = svc.type;
                ag.region = svc.region || null;
                break;
              }
            }
          }
        }
      }
    }

    // Resync uid counters so new IDs don't collide with loaded state
    if (typeof resyncUidCounters === 'function') resyncUidCounters();

    fire('game:load', V);
    addLog('Game loaded: ' + (save.label || slotId), 'log-info');
    return true;
  }

  function deleteSave(slotId) {
    var saves = getAllSaves();
    delete saves[slotId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  }

  function exportSave(slotId) {
    var saves = getAllSaves();
    var save = saves[slotId];
    if (!save) return;

    var blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'vigil_' + (save.callsign || 'save') + '_day' + save.day + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Autosave ---

  hook('tick:day', function() {
    if (V.time.day % 10 === 0) {
      saveGame(AUTOSAVE_ID, 'Autosave — Day ' + V.time.day);
    }
  });

  hook('game:paused', function() {
    saveGame(AUTOSAVE_ID, 'Autosave — Day ' + V.time.day);
  });

  // --- Save Modal Content ---

  window.renderSaveModalContent = function() {
    var saves = getAllSaves();
    var keys = Object.keys(saves).sort(function(a, b) {
      return (saves[b].timestamp || 0) - (saves[a].timestamp || 0);
    });

    var html = '<div style="margin-bottom:var(--sp-4)">' +
      '<button class="modal-btn modal-btn-primary" onclick="quickSave()" style="width:100%">SAVE CURRENT GAME</button>' +
      '</div>';

    if (keys.length === 0) {
      html += '<div style="color:var(--text-dim);text-align:center;padding:var(--sp-6);font-family:var(--font-mono);font-size:var(--fs-sm)">No saves found</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:var(--sp-2)">';
      for (var i = 0; i < keys.length; i++) {
        var s = saves[keys[i]];
        var dateStr = s.timestamp ? new Date(s.timestamp).toLocaleString() : 'Unknown';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3);background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm)">' +
          '<div>' +
            '<div style="font-weight:600;color:var(--text-hi);font-size:var(--fs-sm)">' + (s.label || s.id) + '</div>' +
            '<div style="font-family:var(--font-mono);font-size:9px;color:var(--text-dim)">' +
              (s.callsign || '?') + ' · Day ' + (s.day || '?') + ' · ' + dateStr +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:var(--sp-1)">' +
            '<button class="modal-btn modal-btn-ghost" onclick="loadGameSlot(\'' + keys[i] + '\')">LOAD</button>' +
            '<button class="modal-btn modal-btn-ghost" onclick="exportSaveSlot(\'' + keys[i] + '\')">↗</button>' +
            (keys[i] !== AUTOSAVE_ID ? '<button class="modal-btn modal-btn-ghost" onclick="deleteSaveSlot(\'' + keys[i] + '\')">✕</button>' : '') +
          '</div>' +
        '</div>';
      }
      html += '</div>';
    }

    return html;
  };

  // Global save functions for onclick
  window.quickSave = function() {
    saveGame(null, 'Manual Save — Day ' + V.time.day);
    hideModal();
    showSaveModal();
  };

  window.loadGameSlot = function(slotId) {
    if (loadGame(slotId)) {
      hideModal();
      renderStatusBar();
      renderWorkspace();
    }
  };

  window.deleteSaveSlot = function(slotId) {
    deleteSave(slotId);
    hideModal();
    showSaveModal();
  };

  window.exportSaveSlot = function(slotId) {
    exportSave(slotId);
  };

})();
