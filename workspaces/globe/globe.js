/* ============================================================
   VIGIL — workspaces/globe/globe.js
   CesiumJS viewer init, camera, dark styling.
   Registers as a workspace.
   ============================================================ */

(function() {

  var _viewer = null;
  var _globeReady = false;

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
        title = op.codename;
        typeLabel = op.category + ' · ' + op.status;
        detail = 'Location: ' + op.location.city + ', ' + op.location.country +
          '<br>Threat Level: ' + op.threatLevel +
          '<br>Status: ' + op.status;
        action = '<button class="feed-action-btn primary" onclick="viewOperationFromGlobe(\'' + op.id + '\')">VIEW OPERATION</button>';
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
