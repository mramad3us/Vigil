/* ============================================================
   VIGIL — systems/saves.js
   localStorage slots, autosave, JSON export/import.
   ============================================================ */

(function() {

  var STORAGE_KEY = 'vigil_saves';
  var AUTOSAVE_ID = '__autosave__';
  var MAX_SAVES = 20;

  // --- Serialization ---

  function serializeState() {
    var snap = JSON.parse(JSON.stringify(V, function(key, value) {
      if (value instanceof Set) return { __set__: true, values: Array.from(value) };
      if (typeof value === 'function') return undefined;
      return value;
    }));
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

  function saveGame(slotId, label) {
    var saves = getAllSaves();
    var id = slotId || uid('SAVE');

    saves[id] = {
      id: id,
      label: label || 'Save',
      callsign: V.player.callsign,
      day: V.time.day,
      viability: Math.round(V.resources.viability),
      timestamp: Date.now(),
      data: serializeState(),
    };

    // Enforce limit (remove oldest)
    var keys = Object.keys(saves).filter(function(k) { return k !== AUTOSAVE_ID; });
    while (keys.length > MAX_SAVES) {
      var oldest = keys.sort(function(a, b) { return saves[a].timestamp - saves[b].timestamp; })[0];
      delete saves[oldest];
      keys = keys.filter(function(k) { return k !== oldest; });
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
      addLog('Game saved: ' + (label || id), 'log-info');
    } catch (e) {
      addLog('Save failed: storage full', 'log-warn');
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

    // Migrate team readiness fields onto existing assets
    if (V.assets) {
      for (var ai = 0; ai < V.assets.length; ai++) {
        var a = V.assets[ai];
        if (a.fieldUnit === undefined) {
          var tpl = typeof getAssetTemplate === 'function' ? getAssetTemplate(a.type) : null;
          a.fieldUnit = tpl ? (tpl.fieldUnit || false) : false;
          a.teamSize = tpl ? (tpl.teamSize || 0) : 0;
          a.maxTeams = tpl ? (tpl.maxTeams || 0) : 0;
          a.availableTeams = a.maxTeams;
          a.recoveryQueue = [];
        }
        if (!a.recoveryQueue) a.recoveryQueue = [];
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
