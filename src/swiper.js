import Origo from 'Origo';
import ol_control_Swipe from 'ol-ext/control/Swipe';
import ol_interaction_Clip from 'ol-ext/interaction/Clip';
import SwiperLayer from './swiperLayer';
import SwiperLegend from './swiperLegend';
import { checkIsMobile } from './functions';

const Swiper = function Swiper({  circleRadius = 50,
                                  circleZIndex = 0,
                                  initialLayer = null,
                                  initialControl = null,
                                  backgroundGroup = 'background',
                                  tooltips = {
                                    swiper: 'Swiper',
                                    swipeBetweenLayers: 'Split view',
                                    circleSwipe: 'Circle layer overlay',
                                    layerList: 'Layer list'
                                  }
                                } = {}) {
  let viewer;
  let map;
  let target;
  let touchMode;
  let _visibleLeftLayer;
  let _visibleRightLayer;
  let _swLayers = {};
  let _switchingLayers = false;
  let _lastZIndex = 0;
  const defaultZIndex = circleZIndex || 1;

  let buttonsContainer;
  let swiperControl;
  let circleControl;

  let isSwiperToolsOpen = false;
  let isSwiperVisible = false;
  let isCircleVisible = false;

  let swiperEnabledLayers;
  let otherLayers; // this are other layers

  // tool options
  const circleRadiusOption = circleRadius;
  const defaultLayer = initialLayer || '';
  const defaultControl = initialControl;
  const backgroundGroupName = backgroundGroup;
  const swiperTooltip = tooltips.swiper;
  const swipeBetweenLayersTooltip = tooltips.swipeBetweenLayers;
  const circleSwipeTooltip = tooltips.circleSwipe;
  const layerListTooltip = tooltips.layerList;

  // tool buttons
  let swiperMainButton;
  let swiperButton;
  let circleButton;
  let swiperLegendButton;
  let swiperLegend;

  // tool button containers
  let buttonsContainerEl;
  let swiperMainButtonEl;
  let swiperButtonEl;
  let circleButtonEl;
  let swiperLegendButtonEl;

  function showMenuButtons() {
    swiperMainButtonEl.classList.add('active');
    swiperButtonEl.classList.remove('hidden');
    circleButtonEl.classList.remove('hidden');
    swiperLegendButtonEl.classList.remove('hidden');
  }

  function hideMenuButtons() {
    swiperMainButtonEl.classList.remove('active');
    swiperButtonEl.classList.add('hidden');
    circleButtonEl.classList.add('hidden');
    swiperLegendButtonEl.classList.add('hidden');
  }

  function findLayerToSwipe() {
    const keys = Object.keys(_swLayers);
    
    // setting right layer
    let visibleRightKeys = keys.filter(lk => _swLayers[lk].getLayer().get('visible'));
    if (visibleRightKeys.length > 0) {
      visibleRightKeys.forEach(visibleRightKey => {
        _visibleRightLayer = _swLayers[visibleRightKey].getLayer();
        _swLayers[visibleRightKey].setAsShownOnRight();
        console.log('right layer', _visibleRightLayer.get('name'))
      });
    }

    // setting left layer ... if old layer is in use => get a new one
    if (!_visibleLeftLayer || _swLayers[_visibleLeftLayer.get('id')].inUse()) {
      let visibleLeftKey = keys.find(lk => !_swLayers[lk].getLayer().get('visible'));
      _visibleLeftLayer = _swLayers[visibleLeftKey].getLayer();
      _swLayers[visibleLeftKey].setAsShown();
      console.log('left layer', _visibleLeftLayer.get('name'))
    }
  }

  function enableSwiper() {
    let isNew = true;
    if (!swiperControl) {
      swiperControl = new ol_control_Swipe({
        orientation: checkIsMobile() ? 'horizontal' : 'vertical',
      });
    } else {
      isNew = false;
    }

    map.addControl(swiperControl);

    if (isNew) {
      // adding right side
      findLayerToSwipe();
      // right
      if (_visibleRightLayer) {
        swiperControl.addLayer(_visibleRightLayer, true);
      }
      // left
      showLayerOnController(swiperControl, _visibleLeftLayer);
    }
    setSwiperVisible(true);

    swiperLegend.resetLayerList(_swLayers);
  }

  function enableCircle() {
    // if (!circleControl) {
      findLayerToSwipe();
      console.log('cirle - layer', _visibleLeftLayer.get('name'))
      circleControl = new ol_interaction_Clip({
        radius: circleRadiusOption || 100
      });
      showLayerOnController(circleControl, _visibleLeftLayer);
      _lastZIndex = _visibleLeftLayer.getZIndex();
      console.log('zIndex', _lastZIndex);
      _visibleLeftLayer.setZIndex(defaultZIndex);
    // }
    map.addInteraction(circleControl);
    setCircleVisible(true);
    
    swiperLegend.resetLayerList(_swLayers);
  }

  function showLayerOnController(controller, layer, showLayer = true) {
    if (!controller) {
      return;
    }

    disableVisibilityEvent();
    const layerId = layer.get('id');
    if (showLayer) {
      controller.removeLayer(layer);
      controller.addLayer(layer);
    } else {
      controller.removeLayer(layer);
    }
    
    layer.setVisible(showLayer);
    _swLayers[layerId].setAsShown(showLayer);
    enableVisibilityEvent();
    console.log(layerId, 'visibility', showLayer);
  }

  function disableSwiper() {
    if (!swiperControl) { 
      return;
    }

    map.removeControl(swiperControl);
    setSwiperVisible(false);
    
    showLayerOnController(swiperControl, _visibleLeftLayer, false);
    swiperControl = null;
    console.info('disabling swiper');
  }

  function disableCircle() {
    if (!circleControl) {
      return;
    }

    map.removeInteraction(circleControl);
    setCircleVisible(false);
    showLayerOnController(circleControl, _visibleLeftLayer, false);
    circleControl = null;
    _visibleLeftLayer.setZIndex(_lastZIndex);
    _lastZIndex = undefined;
    console.info('disabling circle');
  }

  function disableVisibilityEvent() {
    _switchingLayers = true;
  }
  function enableVisibilityEvent() {
    _switchingLayers = false;
  }
  function isVisibilityEventEnabled() {
    return !_switchingLayers;
  }

  function setSwiperVisible(state) {
    if (state) {
      swiperButtonEl.classList.add('active');
    } else {
      swiperButtonEl.classList.remove('active');
    }
    isSwiperVisible = state;
  }

  function setCircleVisible(state) {
    if (state) {
      circleButtonEl.classList.add('active');
    } else {
      circleButtonEl.classList.remove('active');
    }
    isCircleVisible = state;
  }

  // get swiperlayers from config file in origo
  function findSwiperLayers(viewer) {
    swiperEnabledLayers = viewer.getLayers().filter(layer => layer.get('isSwiperLayer'));
    return swiperEnabledLayers;
  }
  
  function resetSwiperLayer(layerId) {
    // remove old layer
    let oldLayer = _visibleLeftLayer;
    const oldZIndex = _lastZIndex;
  
    if (_swLayers[layerId].inUse()) {
      console.log('the layer ', layerId, 'is in use');
      return false;
    }

    const toBeSwiperLayer = _swLayers[layerId].getLayer();
    _visibleLeftLayer = toBeSwiperLayer;
    console.log('new left side - layer:', _swLayers[layerId].getName());
    
    if (circleControl) {
      // reset the zIndex is only needed for the circle controller
      oldLayer.setZIndex(oldZIndex);
      _lastZIndex = _visibleLeftLayer.getZIndex();
      _visibleLeftLayer.setZIndex(defaultZIndex);
    }

    // add new layer
    const selectedControl = swiperControl || circleControl;
    showLayerOnController(selectedControl, _visibleLeftLayer);
  
    if (oldLayer) {
      console.log('removing left side - layer', oldLayer.get('name'))
      showLayerOnController(selectedControl, oldLayer, false);
    }
    
    console.log('resetSwiperLayer - end');
    return true;
  }

  function areSwiperLayersCompromised(layerId, layerVisibility) {
    if (layerVisibility) { // turning on another layer, that is fine
      return false;
    }
    const givenLayers = viewer.getLayersByProperty('id', layerId);
    if (!givenLayers.length) {
      return false;
    }
    // if not a background layer => fine
    const backgroundGroup = backgroundGroupName;
    const layerGroup = givenLayers[0].get('group');
    if (layerGroup != backgroundGroup) {
      console.log('not background group')
      return false;
    }

    // turning off a layer, does that affect us?
    const keys = Object.keys(_swLayers);
    const layersInUse = keys.filter((key) => _swLayers[key].inUse());
    // if we have 2 on layers => we are good
    if (layersInUse.length == 2) {
      return false;
    }
    // ok, so we do not see all layers => lets see if there are at least 2 background layers on
    const visibleBackgroundLayers = viewer.getLayersByProperty('group', backgroundGroup);
    if (visibleBackgroundLayers.length == 2) {
      return false;
    }

    return true;
  }

  function caseRightAndLeftShowSameLayer(currentLayerId, currentVisibility) {
    // set hidden layer as notShown
    if (_swLayers[currentLayerId]) {
      _swLayers[currentLayerId].setAsShown(false);
    } else {
      console.log("layer triggered but in a SwiperLayer", currentLayerId, currentVisibility);
      if (!areSwiperLayersCompromised(currentLayerId, currentVisibility)) {
        console.log('it does not compromise the existing swiper layers')
        return;
      }
    }

    // Get the visible layer
    const keys = Object.keys(_swLayers);
    const keyInUse = keys.find((key) => key != currentLayerId && _swLayers[key].inUse());
    console.log('layer in use:', keyInUse);
    const swRightLayer = _swLayers[keyInUse];
    const theRightLayer = swRightLayer.getLayer();

    // no magic => disable controllers
    disableCircle();
    disableSwiper();
    
    disableVisibilityEvent();
    theRightLayer.setVisible(false);
    theRightLayer.setVisible(true);
    enableVisibilityEvent();
    
    closeSwiperTool();
    // swiperLegend.resetLayerList(_swLayers);
    return;
  }

  function caseRightChangesLayer(layerId1, visibility1,
                                layerId2, visibility2) {

    // just update the visibility on the _layers
    if (_swLayers[layerId1]) {
      _swLayers[layerId1].setAsShownOnRight(visibility1);
    }
    if (_swLayers[layerId2]) {
      _swLayers[layerId2].setAsShownOnRight(visibility2);
    }
    swiperLegend.resetLayerList(_swLayers);
  }

  let _switchOuterLayersTimeout = null;
  let _memorySwitch = null;
  function doesChangeAffectLayerVisibility(visibilityChangeEvent) {
    if (!isVisibilityEventEnabled()) {
      return;
    }

    const layerId = visibilityChangeEvent.target.get('id');
    const currentVisibility = !visibilityChangeEvent.oldValue;
    console.log(layerId, 'visibility:', currentVisibility, new Date(), visibilityChangeEvent);

    if (!_switchOuterLayersTimeout) {
      _memorySwitch = { layerId, currentVisibility};

      _switchOuterLayersTimeout = setTimeout( () => {
        console.log("why you no show stuff");
        caseRightAndLeftShowSameLayer(_memorySwitch.layerId, _memorySwitch.currentVisibility);
        _memorySwitch = null;
        _switchOuterLayersTimeout = null;
      }, 100);
    } else {
      clearTimeout(_switchOuterLayersTimeout);
      console.log("clearTimeout");
      caseRightChangesLayer(_memorySwitch.layerId, _memorySwitch.currentVisibility,
                            layerId, currentVisibility);
      _memorySwitch = null;
      _switchOuterLayersTimeout = null;
    }
  }

  function setSwiperLayers(layers) {
    layers.forEach(la => {
      const layerId = la.get('id');
      _swLayers[layerId] = new SwiperLayer(la, false, false);

      // setting the default layer
      if (la.get('name').toLowerCase() === defaultLayer.toLowerCase()) {
        console.log('default layer set:', defaultLayer);
        _visibleLeftLayer = la;
      }
    });
    return _swLayers;
  }

  function bindLayersListener() {
    const keys = Object.keys(_swLayers);
    keys.forEach(lk => {
      const layer = _swLayers[lk].getLayer();
      layer.on('change:visible', doesChangeAffectLayerVisibility);
    });

    // not swiper layers 
    if (!otherLayers) {
      otherLayers = viewer.getLayers().filter(layer => !layer.get('isSwiperLayer'));
    }
    otherLayers.forEach(la => {
      la.on('change:visible', doesChangeAffectLayerVisibility);
    });

  }

  function unBindLayersListener() {
    const keys = Object.keys(_swLayers);
    keys.forEach(lk => {
      const layer = _swLayers[lk].getLayer();
      layer.un('change:visible', doesChangeAffectLayerVisibility);
    });

    otherLayers.forEach(la => {
      la.un('change:visible', doesChangeAffectLayerVisibility);
    });
  }

  function setupLayers(viewer) {
    const layers = findSwiperLayers(viewer);
    if (layers.length <= 0) {
      return false;
    }

    console.log('Swiper defined layers', layers.length, layers.map(l => l.get('name')))

    setSwiperLayers(layers);
    return true;
  }

  function closeSwiperTool() {
    isSwiperToolsOpen = false;
    disableCircle();
    disableSwiper();
    hideMenuButtons();
    swiperLegend.setSwiperLegendVisible(false);
    unBindLayersListener();
  }

  function addSvgIcons() {
    const svgIcons = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <symbol id="fa-code" viewBox="0 0 512 512">
        <path d="m158 400l-14 14c-2 2-4 3-7 3-2 0-5-1-6-3l-134-133c-1-2-2-4-2-7 0-2 1-4 2-6l134-133c1-2 4-3 6-3 3 0 5 1 7 3l14 14c2 2 3 4 3 6 0 3-1 5-3 7l-112 112 112 113c2 1 3 4 3 6 0 3-1 5-3 7z m169-305l-107 369c0 2-2 4-4 5-2 2-5 2-7 1l-18-5c-2-1-4-2-5-4-1-2-2-5-1-7l107-369c0-3 2-4 4-6 2-1 5-1 7 0l18 4c2 1 4 3 5 5 1 2 2 4 1 7z m188 186l-134 133c-1 2-4 3-6 3-3 0-5-1-7-3l-14-14c-2-2-3-4-3-7 0-2 1-5 3-6l112-113-112-112c-2-2-3-4-3-7 0-2 1-4 3-6l14-14c2-2 4-3 7-3 2 0 5 1 6 3l134 133c1 2 2 4 2 6 0 3-1 5-2 7z"/>
      </symbol>
        
      <symbol id="fa-columns" viewBox="0 0 512 512">
        <path d="m64 439l174 0 0-329-183 0 0 320c0 2 1 4 3 6 1 2 4 3 6 3z m393-9l0-320-183 0 0 329 174 0c2 0 5-1 6-3 2-2 3-4 3-6z m37-348l0 348c0 12-5 23-14 32-9 9-19 13-32 13l-384 0c-13 0-23-4-32-13-9-9-14-20-14-32l0-348c0-12 5-23 14-32 9-9 19-13 32-13l384 0c13 0 23 4 32 13 9 9 14 20 14 32z"/>
      </symbol>
    </svg>
    `;
    const div = document.createElement('div');
    div.innerHTML = svgIcons;
    document.body.insertBefore(div, document.body.childNodes[0]);
  }

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      addSvgIcons();
      swiperMainButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow no-round-icon swiper-tool-button',
        click() {
          if (isSwiperToolsOpen) {
            closeSwiperTool();
          } else {
            bindLayersListener();
            showMenuButtons();
            if (defaultControl) {
              const controlName = defaultControl.toLowerCase();
              if (controlName === 'swipe') {
                enableSwiper();
              }
              if (controlName === 'clip') {
                enableCircle();
              }
            }
          }
          isSwiperToolsOpen = !isSwiperToolsOpen;
        },
        icon: '#fa-columns',
        tooltipText: swiperTooltip,
        tooltipPlacement: 'east',
      });
      swiperButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden swiper-button',
        click() {
          disableCircle();
          if (!isSwiperVisible) {
            enableSwiper();
          } else {
            // do nothing
            // disableSwiper();
          }
        },
        icon: '#fa-code',
        tooltipText: swipeBetweenLayersTooltip,
        tooltipPlacement: 'east',
      });
      circleButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          disableSwiper();
          if (!isCircleVisible) {
            enableCircle();
          } else {
            // do nothing
            // disableCircle();
          }
        },
        icon: '#fa-circle-o',
        tooltipText: circleSwipeTooltip,
        tooltipPlacement: 'east',
      });

      swiperLegend = SwiperLegend({showLayer: resetSwiperLayer});

      swiperLegendButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          swiperLegend.setSwiperLegendVisible(!swiperLegend.isVisible());
        },
        icon: '#ic_layers_24px',
        tooltipText: layerListTooltip,
        tooltipPlacement: 'east',
      });

      buttonsContainer = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column',
      });
    },
    onAdd(evt) {
      viewer = evt.target;
      map = viewer.getMap();

      // Action plan:
      // 1. fetch all swiper layers
      // 2. Create a SwiperLayer class which will indicate layerName, visible, right, left, inUse (right or left?)
      // 3. Use the list<SwiperLayer> in the swiperLegend to populate it.
      // 4. Hook on any/all background layers for any change
      //    You hook up by listening on an event (shown in Markus chat)
      // 4.1 if change detected
      // 4.1.1 if it does not affect the left => just show it in the right, mark it as inUsed (right=true)
      //      and it should be disabled to select on the swiperLegend
      // 4.1.2 if affects left (is the same as left) => pick first in the SwiperLayer list which is not in Use and show it (mark it left=true)

      const isSetup = setupLayers(viewer);
      if (!isSetup) {
        console.log('No swiper layers defined. Tool will not be added to the map.');
        return;
      }

      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getMapTools().getId()}`;
      this.addComponents([swiperMainButton, swiperButton, circleButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();
    },
    render() {
      // Make an html fragment of buttonsContainer, add to DOM and sets DOM-node in module for easy access
      const buttonsContainerHtmlFragment = Origo.ui.dom.html(buttonsContainer.render());
      document.getElementById(target).appendChild(buttonsContainerHtmlFragment);
      buttonsContainerEl = document.getElementById(buttonsContainer.getId());

      // Adding main Swiper toggle button
      const mainButtonHtmlFragment = Origo.ui.dom.html(swiperMainButton.render());
      buttonsContainerEl.appendChild(mainButtonHtmlFragment);
      swiperMainButtonEl = document.getElementById(swiperMainButton.getId());

      // Adding Swiper toggle button
      const swiperButtonHtmlFragment = Origo.ui.dom.html(swiperButton.render());
      buttonsContainerEl.appendChild(swiperButtonHtmlFragment);
      swiperButtonEl = document.getElementById(swiperButton.getId());

      // Adding Circle toogle button
      const modeButtonHtmlFragment = Origo.ui.dom.html(circleButton.render());
      buttonsContainerEl.appendChild(modeButtonHtmlFragment);
      circleButtonEl = document.getElementById(circleButton.getId());

      // Adding the layer list button
      const swiperLegendButtonHtmlFragment = Origo.ui.dom.html(swiperLegendButton.render());
      buttonsContainerEl.appendChild(swiperLegendButtonHtmlFragment);
      swiperLegendButtonEl = document.getElementById(swiperLegendButton.getId());

      swiperLegendButton.dispatch('render');
      swiperLegend.render(_swLayers);
      this.dispatch('render');
    },
  });
};

export default Swiper;
