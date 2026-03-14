/* ============================================================
   VIGIL — workspaces/globe/layers.js
   Data layers: threats, operations, bases, assets. Toggle-able.
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
  bases: {
    label: 'US Bases',
    color: '#4a8fd4',
    visible: true,
  },
  assets: {
    label: 'Deployed Assets',
    color: '#e0a030',
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
    removePrefixMarkers(viewer, 'threat-');
  }

  // Sync operations
  if (GLOBE_LAYERS.operations.visible) {
    syncOperationMarkers(viewer);
  } else {
    removePrefixMarkers(viewer, 'op-');
  }

  // Sync bases
  if (GLOBE_LAYERS.bases.visible) {
    syncBaseMarkers(viewer);
  } else {
    removePrefixMarkers(viewer, 'base-');
  }

  // Sync assets
  if (GLOBE_LAYERS.assets.visible) {
    syncAssetMarkers(viewer);
  } else {
    removePrefixMarkers(viewer, 'asset-');
    removePrefixMarkers(viewer, 'arc-');
  }
}

// --- Threats ---

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

  removeStaleMarkers(viewer, 'threat-', activeIds);
}

// --- Operations ---

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
    if (status === 'EXECUTING' || status === 'ASSETS_IN_TRANSIT') color = '#3dcc70';
    else if (status === 'SUCCESS') color = '#3dcc70';
    else if (status === 'FAILURE') color = '#e04040';
    else if (status === 'OPTIONS_PRESENTED') color = '#e0a030';

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

  removeStaleMarkers(viewer, 'op-', activeIds);
}

// --- Bases ---

function syncBaseMarkers(viewer) {
  if (!BASES) return;

  for (var i = 0; i < BASES.length; i++) {
    var b = BASES[i];
    var markerId = 'base-' + b.id;

    if (!hasGlobeMarker(markerId)) {
      var typeInfo = BASE_TYPES[b.type] || {};
      addGlobeMarker(viewer, markerId, {
        lat: b.lat,
        lon: b.lon,
        color: typeInfo.color || '#4a8fd4',
        size: 4,
        outlineWidth: 2,
        label: b.name,
      });
    }
  }
}

// --- Assets (in-transit only, not stationed) ---

function syncAssetMarkers(viewer) {
  if (!V.assets) return;
  var activeIds = new Set();

  for (var i = 0; i < V.assets.length; i++) {
    var a = V.assets[i];
    if (a.status !== 'IN_TRANSIT' && a.status !== 'RETURNING' && a.status !== 'DEPLOYED') continue;

    var markerId = 'asset-' + a.id;
    activeIds.add(markerId);

    var catInfo = ASSET_CATEGORIES[a.category] || {};
    var color = catInfo.color || '#e0a030';

    if (!hasGlobeMarker(markerId)) {
      addGlobeMarker(viewer, markerId, {
        lat: a.currentLat,
        lon: a.currentLon,
        color: color,
        size: 5,
        outlineWidth: 3,
        label: a.name,
      });
    } else {
      updateGlobeMarker(viewer, markerId, {
        lat: a.currentLat,
        lon: a.currentLon,
        color: color,
      });
    }

    // Transit arc
    if ((a.status === 'IN_TRANSIT' || a.status === 'RETURNING') && a.originLat != null && a.destinationLat != null) {
      syncTransitArc(viewer, a);
    }
  }

  removeStaleMarkers(viewer, 'asset-', activeIds);
  // Clean up arcs for assets that are no longer in transit
  cleanupArcs(viewer, activeIds);
}

// --- Transit Arc ---

function syncTransitArc(viewer, asset) {
  var arcId = 'arc-' + asset.id;

  // Build a series of points along the great circle
  var points = [];
  var segments = 40;
  for (var i = 0; i <= segments; i++) {
    var frac = i / segments;
    var pt = interpolateGreatCircle(
      asset.originLat, asset.originLon,
      asset.destinationLat, asset.destinationLon,
      frac
    );
    points.push(pt.lon, pt.lat, 0);
  }

  if (!hasGlobeMarker(arcId)) {
    // Create polyline entity
    var positions = Cesium.Cartesian3.fromDegreesArrayHeights(points);
    var entity = viewer.entities.add({
      id: arcId,
      polyline: {
        positions: positions,
        width: 1.5,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#e0a03080'),
          dashLength: 8,
        }),
        clampToGround: false,
      },
    });
    _globeEntities[arcId] = entity;
  }
}

function cleanupArcs(viewer, activeAssetIds) {
  for (var id in _globeEntities) {
    if (id.indexOf('arc-') === 0) {
      var assetId = 'asset-' + id.substring(4);
      if (!activeAssetIds.has(assetId)) {
        removeGlobeMarker(viewer, id);
      }
    }
  }
}

// --- Helpers ---

function removePrefixMarkers(viewer, prefix) {
  for (var id in _globeEntities) {
    if (id.indexOf(prefix) === 0) {
      removeGlobeMarker(viewer, id);
    }
  }
}

function removeStaleMarkers(viewer, prefix, activeIds) {
  for (var id in _globeEntities) {
    if (id.indexOf(prefix) === 0 && !activeIds.has(id)) {
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
