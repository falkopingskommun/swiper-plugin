import Origo from 'Origo';
import ol_control_Swipe from 'ol-ext/control/Swipe';
import ol_interaction_Clip from 'ol-ext/interaction/Clip';
import SwiperLayer from './swiperLayer';
import SwiperLegend from './swiperLegend';
import { checkIsMobile } from './functions';

const Swiper = function Swiper({ circleRadius = 50,
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

  let buttonsContainer;
  let swiperControl;
  let circleControl;

  let isSwiperToolsOpen = false;
  let isSwiperVisible = false;
  let isCircleVisible = false;

  let swiperEnabledLayers;
  let otherLayers; // this are other layers

  // tool options
  let circleRadiusOption = circleRadius;
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
    let visibleRightKey = keys.find(lk => _swLayers[lk].getLayer().get('visible'));
    if (visibleRightKey) {
      _visibleRightLayer = _swLayers[visibleRightKey].getLayer();
      _swLayers[visibleRightKey].setAsShownOnRight();
      console.log('right layer', _visibleRightLayer.get('name'))
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
    if (!circleControl) {
      findLayerToSwipe();
      console.log('cirle - layer', _visibleLeftLayer.get('name'))
      circleControl = new ol_interaction_Clip({
        radius: circleRadiusOption || 100,
      });
      showLayerOnController(circleControl, _visibleLeftLayer);
    }
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
  
    if (_swLayers[layerId].inUse()) {
      console.log('the layer ', layerId, 'is in use');
      return false;
    }

    const toBeSwiperLayer = _swLayers[layerId].getLayer();
    _visibleLeftLayer = toBeSwiperLayer;
    console.log('new left side - layer:', _swLayers[layerId].getName());
    
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

  function caseRightAndLeftShowSameLayer(currentLayerId, currentVisibility) {
    // set hidden layer as notShown
    if (_swLayers[currentLayerId]) {
      _swLayers[currentLayerId].setAsShown(false);
    }

    // Get the visible layer
    const keys = Object.keys(_swLayers);
    const keyInUse = keys.find((key) => key != currentLayerId && _swLayers[key].inUse());
    console.log('layer in use:', keyInUse);
    const swRightLayer = _swLayers[keyInUse];
    const theRightLayer = swRightLayer.getLayer();

    // get the right layer (if it is a swiperLayer) or first unused layer
    let newLeftKey = keys.find((key) => key == currentLayerId ||
                                      (key != keyInUse && !_swLayers[key].inUse()));
    if (!newLeftKey) {
      // there is no other layer to pick => making right and left the same
      console.log("there is no other layer to pick => disabling tool");
      disableCircle();
      disableSwiper();
      
      disableVisibilityEvent();
      theRightLayer.setVisible(false);
      theRightLayer.setVisible(true);
      enableVisibilityEvent();
      return;
    }
    console.log("change left layer to:", newLeftKey);
    resetSwiperLayer(newLeftKey);
    console.log("left layer shown:", newLeftKey);
    
    disableVisibilityEvent();
    swRightLayer.setAsShownOnRight(true);
    if (swiperControl) {
      swiperControl.addLayer(theRightLayer, true);
    } else if (circleControl) {
      disableCircle();
      enableCircle();
    }
    theRightLayer.setVisible(true);
    _visibleRightLayer = theRightLayer;
    enableVisibilityEvent();

    swiperLegend.resetLayerList(_swLayers);
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

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      swiperMainButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow no-round-icon',
        click() {
          if (isSwiperToolsOpen) {
            disableCircle();
            disableSwiper();
            hideMenuButtons();
            swiperLegend.setSwiperLegendVisible(false);
            unBindLayersListener();
          } else {
            bindLayersListener();
            showMenuButtons();
          }
          isSwiperToolsOpen = !isSwiperToolsOpen;
        },
        icon: '#fa-columns',
        tooltipText: swiperTooltip,
        tooltipPlacement: 'east',
      });
      swiperButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          disableCircle();
          if (!isSwiperVisible) {
            enableSwiper();
          } else {
            disableSwiper();
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
            disableCircle();
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
