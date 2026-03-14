/* ============================================================
   VIGIL — workspaces/globe/layers.js
   Data layers: threats, operations. Toggle-able.
   ============================================================ */

var GLOBE_LAYERS = {
  threats: {
    label: 'Active Threats',
    color: '#e04040',
    visible: true,
  },
  operations: {
    label: 'Active Operations',
    color: '#3dcc70',
    visible: true,
  },
};

function toggleGlobeLayer(layerId) {
  if (!GLOBE_LAYERS[layerId]) return;
  GLOBE_LAYERS[layerId].visible = !GLOBE_LAYERS[layerId].visible;
  fire('globe:layer:toggle', { layer: layerId, visible: GLOBE_LAYERS[layerId].visible });
}

function syncGlobeLayers(viewer) {
  if (!viewer) return;

  // Sync threats
  if (GLOBE_LAYERS.threats.visible) {
    syncThreatMarkers(viewer);
  } else {
    removeThreatMarkers(viewer);
  }

  // Sync operations
  if (GLOBE_LAYERS.operations.visible) {
    syncOperationMarkers(viewer);
  } else {
    removeOperationMarkers(viewer);
  }
}

function syncThreatMarkers(viewer) {
  var activeIds = new Set();

  for (var i = 0; i < V.threats.length; i++) {
    var t = V.threats[i];
    if (t.status !== 'ACTIVE' || !t.location) continue;
    var markerId = 'threat-' + t.id;
    activeIds.add(markerId);

    if (!hasGlobeMarker(markerId)) {
      addGlobeMarker(viewer, markerId, {
        lat: t.location.lat,
        lon: t.location.lon,
        color: '#e04040',
        size: 4 + t.threatLevel * 1.5,
        outlineWidth: 4,
        label: t.orgName,
      });
    }
  }

  // Remove stale markers
  for (var id in _globeEntities) {
    if (id.indexOf('threat-') === 0 && !activeIds.has(id)) {
      removeGlobeMarker(viewer, id);
    }
  }
}

function removeThreatMarkers(viewer) {
  for (var id in _globeEntities) {
    if (id.indexOf('threat-') === 0) {
      removeGlobeMarker(viewer, id);
    }
  }
}

function syncOperationMarkers(viewer) {
  var activeIds = new Set();

  for (var i = 0; i < V.operations.length; i++) {
    var op = V.operations[i];
    if (!op.geo) continue;
    var status = op.status;
    if (status === 'ARCHIVED' || status === 'EXPIRED') continue;

    var markerId = 'op-' + op.id;
    activeIds.add(markerId);

    var color = '#4a8fd4';
    if (status === 'EXECUTING') color = '#3dcc70';
    else if (status === 'SUCCESS') color = '#3dcc70';
    else if (status === 'FAILURE') color = '#e04040';

    if (!hasGlobeMarker(markerId)) {
      addGlobeMarker(viewer, markerId, {
        lat: op.geo.lat,
        lon: op.geo.lon,
        color: color,
        size: 5,
        outlineWidth: 3,
        label: op.codename,
      });
    } else {
      updateGlobeMarker(viewer, markerId, { color: color });
    }
  }

  // Remove stale
  for (var id in _globeEntities) {
    if (id.indexOf('op-') === 0 && !activeIds.has(id)) {
      removeGlobeMarker(viewer, id);
    }
  }
}

function removeOperationMarkers(viewer) {
  for (var id in _globeEntities) {
    if (id.indexOf('op-') === 0) {
      removeGlobeMarker(viewer, id);
    }
  }
}

function renderLayerPanel() {
  var html = '<div class="globe-layers-panel">' +
    '<div class="globe-layers-title">DATA LAYERS</div>';

  for (var lid in GLOBE_LAYERS) {
    var layer = GLOBE_LAYERS[lid];
    var disabledClass = layer.visible ? '' : ' disabled';
    html += '<div class="globe-layer-row' + disabledClass + '" onclick="toggleGlobeLayer(\'' + lid + '\')">' +
      '<div class="globe-layer-dot" style="background:' + layer.color + '"></div>' +
      '<span class="globe-layer-label">' + layer.label + '</span>' +
      '</div>';
  }

  html += '</div>';
  return html;
}
