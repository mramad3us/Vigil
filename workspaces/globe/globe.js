/* ============================================================
   VIGIL — workspaces/globe/globe.js
   CesiumJS viewer init, camera, dark styling.
   Registers as a workspace.
   ============================================================ */

(function() {

  var _viewer = null;
  var _globeReady = false;

  /* Collapsible base category state */
  var _baseExpandedCats = {};

  window.toggleBaseCategory = function(key) {
    _baseExpandedCats[key] = !_baseExpandedCats[key];
    var content = document.getElementById('base-cat-' + key);
    var arrow = document.getElementById('base-cat-arrow-' + key);
    if (content) {
      content.style.display = _baseExpandedCats[key] ? 'block' : 'none';
    }
    if (arrow) {
      arrow.textContent = _baseExpandedCats[key] ? '\u25BE' : '\u25B8';
    }
  };

  registerWorkspace({
    id: 'globe',
    label: 'Globe',
    icon: '◎',

    init: function() {
      var container = $('ws-globe');
      container.innerHTML =
        '<div id="cesium-container" class="ws-full"></div>' +
        '<div id="globe-layer-panel"></div>' +
        '<div class="globe-stats" id="globe-stats"></div>' +
        '<div class="globe-info-panel" id="globe-info"></div>';

      try {
        _viewer = new Cesium.Viewer('cesium-container', {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          creditContainer: document.createElement('div'),

          baseLayer: new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
              url: 'https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
              credit: 'CartoDB',
              maximumLevel: 18,
            })
          ),

          terrain: undefined,
          skyBox: false,
          skyAtmosphere: false,

          contextOptions: {
            webgl: { alpha: false },
          },
        });

        // Dark styling
        _viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#040608');
        _viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0e14');
        _viewer.scene.globe.showGroundAtmosphere = false;
        _viewer.scene.fog.enabled = false;
        _viewer.scene.sun = undefined;
        _viewer.scene.moon = undefined;

        // Camera: start on North Atlantic, tilted
        _viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-30, 30, 18000000),
        });

        // Click handler
        var handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
        handler.setInputAction(function(click) {
          var picked = _viewer.scene.pick(click.position);
          if (Cesium.defined(picked) && picked.id) {
            onGlobeEntityClick(picked.id.id);
          } else {
            hideGlobeInfo();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _globeReady = true;

      } catch (e) {
        // CesiumJS not loaded — show fallback
        container.innerHTML =
          '<div class="ws-detail-empty" style="flex-direction:column">' +
            '<div style="font-size:48px;margin-bottom:16px;opacity:0.3">◎</div>' +
            '<div>Globe requires CesiumJS</div>' +
            '<div style="font-size:11px;margin-top:8px;color:var(--text-muted)">Run with a local server to load CesiumJS</div>' +
          '</div>';
      }
    },

    activate: function() {
      if (_viewer) {
        _viewer.resize();
      }
      renderLayerPanelInDOM();
      renderGlobeStats();
    },

    deactivate: function() {
      if (_viewer) {
        V.globe.cameraPosition = serializeCameraPos(_viewer);
      }
    },

    render: function() {
      if (!_globeReady || !_viewer) return;
      syncGlobeLayers(_viewer);
      renderLayerPanelInDOM();
      renderGlobeStats();
    },

    destroy: function() {
      if (_viewer) {
        _viewer.destroy();
        _viewer = null;
        _globeReady = false;
      }
    },
  });

  // --- Camera Serialization ---

  function serializeCameraPos(viewer) {
    var pos = viewer.camera.positionCartographic;
    return {
      lon: Cesium.Math.toDegrees(pos.longitude),
      lat: Cesium.Math.toDegrees(pos.latitude),
      height: pos.height,
      heading: viewer.camera.heading,
      pitch: viewer.camera.pitch,
    };
  }

  function restoreCameraPos(viewer, saved) {
    if (!saved) return;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(saved.lon, saved.lat, saved.height),
      orientation: {
        heading: saved.heading,
        pitch: saved.pitch,
      },
    });
  }

  // --- Globe Info Panel ---

  function onGlobeEntityClick(entityId) {
    var info = $('globe-info');
    if (!info) return;

    // Find what was clicked
    var parts = entityId.split('-');
    var type = parts[0];
    var id = parts.slice(1).join('-');

    var title = '', typeLabel = '', detail = '', action = '';

    if (type === 'threat') {
      var threat = getThreat(id);
      if (threat) {
        title = threat.orgName;
        typeLabel = threat.typeLabel + ' · THREAT LEVEL ' + threat.threatLevel;
        detail = 'Location: ' + threat.location.city + ', ' + threat.location.country +
          '<br>Theater: ' + threat.location.theater.name +
          '<br>Intel: ' + threat.intel + '%';
        action = '<button class="feed-action-btn" onclick="activateWorkspace(\'feed\')">VIEW IN FEED</button>';
      }
    } else if (type === 'op') {
      var op = getOp(id);
      if (op) {
        var statusLabels = { DETECTED: 'DETECTED', ANALYSIS: 'ANALYZING', OPTIONS_PRESENTED: 'AWAITING APPROVAL', APPROVED: 'APPROVED', ASSETS_IN_TRANSIT: 'IN TRANSIT', EXECUTING: 'EXECUTING', SUCCESS: 'SUCCESS', FAILURE: 'FAILURE' };
        title = op.codename;
        typeLabel = (op.operationType && OPERATION_TYPES[op.operationType] ? OPERATION_TYPES[op.operationType].shortLabel : op.category) + ' · ' + (statusLabels[op.status] || op.status);
        detail = 'Location: ' + op.location.city + ', ' + op.location.country +
          '<br>Threat Level: ' + op.threatLevel +
          '<br>Status: ' + (statusLabels[op.status] || op.status);
        action = '<button class="feed-action-btn primary" onclick="viewOperationFromGlobe(\'' + op.id + '\')">VIEW OPERATION</button>';
      }
    } else if (type === 'base') {
      var base = getBase(id);
      if (base) {
        var baseTypeInfo = BASE_TYPES[base.type] || {};
        var assetsHere = getAssetsAtBase(base.id);
        title = base.name;
        typeLabel = (baseTypeInfo.label || base.type) + ' · ' + base.country;
        detail = '<div class="globe-info-detail-grid">' +
          '<span class="globe-info-key">LOCATION</span><span class="globe-info-val">' + base.city + ', ' + base.country + '</span>' +
          '<span class="globe-info-key">ASSETS</span><span class="globe-info-val">' + assetsHere.length + ' stationed</span>' +
          '</div>';
        if (assetsHere.length > 0) {
          /* Summary line: count per category */
          var catGroups = {};
          for (var bi = 0; bi < assetsHere.length; bi++) {
            var cat = assetsHere[bi].category;
            if (!catGroups[cat]) catGroups[cat] = [];
            catGroups[cat].push(assetsHere[bi]);
          }
          var summaryParts = [];
          for (var sCat in catGroups) {
            var sCatInfo = ASSET_CATEGORIES[sCat] || {};
            summaryParts.push('<span style="color:' + (sCatInfo.color || 'var(--text)') + '">' + catGroups[sCat].length + ' ' + (sCatInfo.shortLabel || sCat) + '</span>');
          }
          detail += '<div style="font-size:10px;margin-top:4px">' + summaryParts.join(' &middot; ') + '</div>';

          /* Collapsible category groups */
          for (var gCat in catGroups) {
            var catKey = base.id + '-' + gCat;
            var isExpanded = _baseExpandedCats[catKey];
            var catInfo = ASSET_CATEGORIES[gCat] || {};

            detail += '<div style="margin-top:6px">';
            detail += '<div onclick="toggleBaseCategory(\'' + catKey + '\')" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid var(--border);user-select:none">';
            detail += '<span id="base-cat-arrow-' + catKey + '" style="font-size:8px;color:var(--text-muted);width:10px">' + (isExpanded ? '\u25BE' : '\u25B8') + '</span>';
            detail += '<span style="color:' + (catInfo.color || 'var(--text)') + ';font-family:var(--font-mono);font-size:9px;font-weight:600">' + (catInfo.shortLabel || gCat) + '</span>';
            detail += '<span style="font-size:9px;color:var(--text-dim)">' + catGroups[gCat].length + ' unit' + (catGroups[gCat].length > 1 ? 's' : '') + '</span>';
            detail += '</div>';

            detail += '<div id="base-cat-' + catKey + '" style="display:' + (isExpanded ? 'block' : 'none') + '">';
            for (var ai = 0; ai < catGroups[gCat].length; ai++) {
              var bAsset = catGroups[gCat][ai];
              var bDen = DENIABILITY_DISPLAY[bAsset.deniability] || DENIABILITY_DISPLAY.OVERT;
              detail += '<div style="display:flex;align-items:center;gap:6px;padding:2px 0 2px 16px;font-size:10px"' +
                ' data-tip="' + (bAsset.designation || bAsset.name) + ' &middot; ' + (bAsset.personnel || '?') + ' personnel &middot; ' + (bAsset.platform || '?') + '"' +
                ' data-tip-align="right">' +
                '<span style="color:var(--text);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + bAsset.name + '</span>' +
                '<span style="font-family:var(--font-mono);font-size:8px;color:' + bDen.color + '">' + bDen.label + '</span>' +
              '</div>';
            }
            detail += '</div></div>';
          }
        }
        action = '';
      }
    } else if (type === 'asset') {
      var asset = getAsset(id);
      if (asset) {
        var assetCat = ASSET_CATEGORIES[asset.category] || {};
        var homeBase = getBase(asset.homeBaseId);
        var readinessColor = asset.readiness === 'TIER_1' ? 'var(--red)' : asset.readiness === 'TIER_2' ? 'var(--amber)' : 'var(--green)';
        title = asset.name;
        typeLabel = (asset.designation || (assetCat.label || asset.category)) + ' · ' + asset.status;
        detail = '<div class="globe-info-detail-grid">' +
          '<span class="globe-info-key">PLATFORM</span><span class="globe-info-val">' + (asset.platform || '—') + '</span>' +
          '<span class="globe-info-key">PERSONNEL</span><span class="globe-info-val">' + (asset.personnel ? asset.personnel.toLocaleString() : '—') + '</span>' +
          '<span class="globe-info-key">READINESS</span><span class="globe-info-val" style="color:' + readinessColor + '">' + (asset.readiness || 'FULL').replace('_', ' ') + '</span>' +
          '<span class="globe-info-key">HOME BASE</span><span class="globe-info-val">' + (homeBase ? homeBase.name : '—') + '</span>' +
          '<span class="globe-info-key">SPEED</span><span class="globe-info-val">' + (asset.speed > 0 ? asset.speed + ' km/h' : 'REMOTE') + '</span>' +
          '<span class="globe-info-key">STATUS</span><span class="globe-info-val">' + asset.status + '</span>' +
          '</div>';
        if (asset.description) {
          detail += '<div class="globe-info-desc">' + asset.description + '</div>';
        }
        if (asset.isMobileBase) {
          detail += '<div style="margin-top:4px;font-family:var(--font-mono);font-size:9px;color:var(--accent)">MOBILE BASE — Carrier Strike Group</div>';
          detail += '<div style="font-size:10px;margin-top:2px;color:var(--text-dim)">Position: ' + asset.currentLat.toFixed(2) + '°, ' + asset.currentLon.toFixed(2) + '°</div>';
        }
        if (asset.assignedOpId) {
          var assignedOp = getOp(asset.assignedOpId);
          if (assignedOp) detail += '<div style="margin-top:4px;font-family:var(--font-mono);font-size:9px;color:var(--accent)">ASSIGNED: ' + assignedOp.codename + '</div>';
        }
        action = asset.assignedOpId ? '<button class="feed-action-btn primary" onclick="viewOperationFromGlobe(\'' + asset.assignedOpId + '\')">VIEW OPERATION</button>' : '';
      }
    }

    if (title) {
      info.innerHTML =
        '<div class="globe-info-title">' + title + '</div>' +
        '<div class="globe-info-type">' + typeLabel + '</div>' +
        '<div class="globe-info-detail">' + detail + '</div>' +
        '<div class="globe-info-actions">' + action + '</div>';
      info.classList.add('visible');
    }
  }

  function hideGlobeInfo() {
    var info = $('globe-info');
    if (info) info.classList.remove('visible');
  }

  // --- Layer Panel DOM ---

  function renderLayerPanelInDOM() {
    var panelEl = $('globe-layer-panel');
    if (panelEl) panelEl.innerHTML = renderLayerPanel();
  }

  // --- Globe Stats Overlay ---

  function renderGlobeStats() {
    var el = $('globe-stats');
    if (!el) return;

    var threatCount = V.threats.filter(function(t) { return t.status === 'ACTIVE'; }).length;
    var opCount = getActiveOpsCount();

    el.innerHTML =
      '<div class="globe-stat-chip">' +
        '<div class="stat-dot" style="background:var(--red)"></div>' +
        threatCount + ' ACTIVE THREATS' +
      '</div>' +
      '<div class="globe-stat-chip">' +
        '<div class="stat-dot" style="background:var(--green)"></div>' +
        opCount + ' OPERATIONS' +
      '</div>';
  }

  // --- Layer toggle re-render ---
  hook('globe:layer:toggle', function() {
    if (V.ui.activeWorkspace === 'globe') {
      renderLayerPanelInDOM();
      if (_viewer) syncGlobeLayers(_viewer);
    }
  });

  // --- View operation from globe ---
  window.viewOperationFromGlobe = function(opId) {
    activateWorkspace('operations');
    setTimeout(function() {
      selectOperation(opId);
    }, 50);
  };

  // --- Fly to location ---
  window.globeFlyTo = function(lat, lon) {
    activateWorkspace('globe');
    if (!_viewer) return;
    _viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000000),
      duration: 1.5,
    });
  };

  // --- Restore camera on load ---
  hook('game:load', function() {
    if (_viewer && V.globe.cameraPosition) {
      restoreCameraPos(_viewer, V.globe.cameraPosition);
    }
  });

})();
