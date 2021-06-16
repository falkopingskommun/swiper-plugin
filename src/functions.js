export function checkIsMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
}

// Maybe we can use this later, otherwise delete
function clearMapLayers() {
  map.getLayers().forEach(layer => {
    //   if (layer.get('name') && layer.get('name') === 'vector') {
    if (layer) {
      console.log('layer name: ' + layer.get('name'));
      map.removeLayer(layer);
    }
  });
}
// Maybe we can use this later, otherwise delete
const turnOffAllVisibleLayers = function turnOffAllLayers() {
  const visibleLayers = viewer.getLayers().filter(layer => layer.get('visible') === true);
  // const visibleLayers = viewer.getLayersByProperty('visible', true);
  visibleLayers.forEach(el => {
    el.setVisible(false);
    console.log('Layer invisible: ' + el.get('name'));
  });
};

function toggleLayer(layer, boolean) {
  if (layer) {
    layer.map(tile => {
      if (tile) return tile.setVisible(boolean);
    });
  }
}
