/* ============================================================
   VIGIL — workspaces/globe/markers.js
   Entity management: create, update, remove globe markers.
   Diff-based — entities persist and update, not recreated.
   ============================================================ */

var _globeEntities = {};

function addGlobeMarker(viewer, id, opts) {
  if (!viewer || _globeEntities[id]) return;

  var entity = viewer.entities.add({
    id: id,
    position: Cesium.Cartesian3.fromDegrees(opts.lon, opts.lat),
    point: {
      pixelSize: opts.size || 6,
      color: Cesium.Color.fromCssColorString(opts.color || '#e04040'),
      outlineColor: Cesium.Color.fromCssColorString((opts.color || '#e04040') + '40'),
      outlineWidth: opts.outlineWidth || 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: opts.label ? {
      text: opts.label,
      font: '10px Rajdhani, sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#b0b8c4'),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -14),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scale: 1.0,
    } : undefined,
  });

  _globeEntities[id] = entity;
  return entity;
}

function removeGlobeMarker(viewer, id) {
  if (!viewer) return;
  var entity = _globeEntities[id];
  if (entity) {
    viewer.entities.remove(entity);
    delete _globeEntities[id];
  }
}

function updateGlobeMarker(viewer, id, opts) {
  var entity = _globeEntities[id];
  if (!entity) return;

  if (opts.lon !== undefined && opts.lat !== undefined) {
    entity.position = Cesium.Cartesian3.fromDegrees(opts.lon, opts.lat);
  }
  if (opts.color && entity.point) {
    entity.point.color = Cesium.Color.fromCssColorString(opts.color);
    entity.point.outlineColor = Cesium.Color.fromCssColorString(opts.color + '40');
  }
  if (opts.label !== undefined && entity.label) {
    entity.label.text = opts.label;
  }
}

function clearAllMarkers(viewer) {
  if (!viewer) return;
  for (var id in _globeEntities) {
    viewer.entities.remove(_globeEntities[id]);
  }
  _globeEntities = {};
}

function hasGlobeMarker(id) {
  return !!_globeEntities[id];
}
