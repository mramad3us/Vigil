/* ============================================================
   VIGIL — workspaces/globe/layers.js
   Data layers: threats, operations, bases, assets. Toggle-able.
   ============================================================ */

var GLOBE_LAYERS = {
  conflicts: {
    label: 'Regional Conflicts',
    color: '#ff2020',
    visible: true,
    tip: 'Active regional conflicts and war zones',
  },
  threats: {
    label: 'Active Threats',
    color: '#e04040',
    visible: true,
    tip: 'Known threat organizations and hostile actors',
  },
  operations: {
    label: 'Active Operations',
    color: '#3dcc70',
    visible: true,
    tip: 'Current operations across all phases',
  },
  bases: {
    label: 'US Bases',
    color: '#4a8fd4',
    visible: true,
    tip: 'Military installations, naval stations, CIA stations, DIA facilities',
  },
  assets: {
    label: 'Deployed Assets',
    color: '#e0a030',
    visible: true,
    tip: 'In-transit and deployed military/intel assets',
  },
};

function toggleGlobeLayer(layerId) {
  if (!GLOBE_LAYERS[layerId]) return;
  GLOBE_LAYERS[layerId].visible = !GLOBE_LAYERS[layerId].visible;
  fire('globe:layer:toggle', { layer: layerId, visible: GLOBE_LAYERS[layerId].visible });
}

function syncGlobeLayers(viewer) {
  if (!viewer) return;

  // Sync conflicts
  if (GLOBE_LAYERS.conflicts.visible) {
    syncConflictMarkers(viewer);
  } else {
    removePrefixMarkers(viewer, 'conflict-');
    removePrefixMarkers(viewer, 'conflictzone-');
  }

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

// --- Assets (in-transit, deployed, and mobile bases always) ---

function syncAssetMarkers(viewer) {
  if (!V.assets) return;
  var activeIds = new Set();

  for (var i = 0; i < V.assets.length; i++) {
    var a = V.assets[i];
    var isActive = a.status === 'IN_TRANSIT' || a.status === 'RETURNING' || a.status === 'DEPLOYED' || a.status === 'COLLECTING';
    // Always show mobile bases (CSGs)
    if (!isActive && !(a.isMobileBase && a.status === 'STATIONED')) continue;

    var markerId = 'asset-' + a.id;
    activeIds.add(markerId);

    var catInfo = ASSET_CATEGORIES[a.category] || {};
    var color = catInfo.color || '#e0a030';

    var markerSize = a.isMobileBase ? 7 : 5;

    if (!hasGlobeMarker(markerId)) {
      addGlobeMarker(viewer, markerId, {
        lat: a.currentLat,
        lon: a.currentLon,
        color: color,
        size: markerSize,
        outlineWidth: a.isMobileBase ? 4 : 3,
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

  // Build polyline from transit path if available, otherwise great circle
  var points = [];
  if (asset._transitPath && asset._transitPath.length > 1) {
    // Multi-segment maritime path — add sub-segments per leg for smoothness
    for (var leg = 0; leg < asset._transitPath.length - 1; leg++) {
      var from = asset._transitPath[leg];
      var to = asset._transitPath[leg + 1];
      var subSegs = 5;
      for (var s = 0; s <= subSegs; s++) {
        if (leg > 0 && s === 0) continue; // avoid duplicate points
        var f = s / subSegs;
        var pt = interpolateGreatCircle(from.lat, from.lon, to.lat, to.lon, f);
        points.push(pt.lon, pt.lat, 0);
      }
    }
  } else {
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
  }

  // Remove existing arc to update it
  if (hasGlobeMarker(arcId)) {
    removeGlobeMarker(viewer, arcId);
  }

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

// --- Conflicts ---

function syncConflictMarkers(viewer) {
  if (!V.conflicts) return;
  var activeIds = new Set();
  var zoneIds = new Set();

  var activeConflicts = typeof getActiveConflicts === 'function' ? getActiveConflicts() : [];

  for (var i = 0; i < activeConflicts.length; i++) {
    var c = activeConflicts[i];
    if (!c.hotZone) continue;

    var markerId = 'conflict-' + c.id;
    var zoneId = 'conflictzone-' + c.id;
    activeIds.add(markerId);
    zoneIds.add(zoneId);

    // Warning marker — large, bright red
    if (!hasGlobeMarker(markerId)) {
      addGlobeMarker(viewer, markerId, {
        lat: c.hotZone.lat,
        lon: c.hotZone.lon,
        color: '#ff2020',
        size: 12,
        outlineWidth: 6,
        label: '⚠ ' + c.typeLabel.toUpperCase(),
        labelColor: '#ff4040',
      });
    }

    // Danger zone circle — pulsing red ellipse around hot zone
    if (!_globeEntities[zoneId]) {
      var radiusMeters = (c.hotZone.radiusKm || 200) * 1000;
      var entity = viewer.entities.add({
        id: zoneId,
        position: Cesium.Cartesian3.fromDegrees(c.hotZone.lon, c.hotZone.lat),
        ellipse: {
          semiMajorAxis: radiusMeters,
          semiMinorAxis: radiusMeters,
          material: Cesium.Color.fromCssColorString('#ff202018'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ff2020a0'),
          outlineWidth: 2,
          height: 0,
        },
      });
      _globeEntities[zoneId] = entity;
    }
  }

  removeStaleMarkers(viewer, 'conflict-', activeIds);
  removeStaleMarkers(viewer, 'conflictzone-', zoneIds);
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
    var tipAttr = layer.tip ? ' data-tip="' + layer.tip + '" data-tip-align="left"' : '';
    html += '<div class="globe-layer-row' + disabledClass + '" onclick="toggleGlobeLayer(\'' + lid + '\')"' + tipAttr + '>' +
      '<div class="globe-layer-dot" style="background:' + layer.color + '"></div>' +
      '<span class="globe-layer-label">' + layer.label + '</span>' +
      '</div>';
  }

  html += '</div>';
  return html;
}
