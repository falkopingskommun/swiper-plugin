import Origo from 'Origo';
import ol_control_Swipe from 'ol-ext/control/Swipe';
import ol_interaction_Clip from 'ol-ext/interaction/Clip';
import SwiperLayer from './swiperLayer';
import SwiperLegend from './swiperLegend';
import { checkIsMobile } from './functions';

const Swiper = function Swiper({ circleRadius = 50,
                                 backgroundLayerGroups = ['background'] }) {
  let viewer;
  let map;
  let target;
  let touchMode;
  let _visibleLeftLayer;
  let _visibleRightLayer;
  let _layers = {};

  let buttonsContainer;
  let swiperControl;
  let circleControl;

  let swiperButton;
  let circleButton;

  let isSwiperVisible = false;
  let isCircleVisible = false;

  let swiperEnabledLayers;
  let circleRadiusOption = circleRadius;
  const backgroundGroups = backgroundLayerGroups;

  let swiperLegendButton;
  let swiperLegend;

  let buttonsContainerEl;
  let swiperButtonEl;
  let swiperLegendButtonEl;
  let circleButtonEl;

  function showMenuButtons() {
    swiperButtonEl.classList.remove('hidden');
    circleButtonEl.classList.remove('hidden');
    swiperLegendButtonEl.classList.remove('hidden');
  }

  function hideMenuButtons() {
    circleButtonEl.classList.add('hidden');
    swiperLegendButtonEl.classList.add('hidden');
  }

  function enableSwiper() {
    showMenuButtons();

    let isNew = true;
    if (!swiperControl) {
      swiperControl = new ol_control_Swipe({
        orientation: checkIsMobile() ? 'horizontal' : 'vertical',
      });
    } else {
      isNew = false;
      console.log("there is a swiper control already");
    }

    map.addControl(swiperControl);

    if (isNew) {
      // adding right side
      console.log('right side - layer', swiperEnabledLayers.length, 
                  swiperEnabledLayers.map(l => l.get('name')));
      swiperControl.addLayer(_visibleRightLayer, true);
      // left
      const activeLeftLayer = _visibleLeftLayer;
      console.log('left side - layer', activeLeftLayer.get('name'))
      showLayerOnController(swiperControl, activeLeftLayer);
      console.log("is new swiper control");
    }
    console.log("adding swiper to the control");

    setSwiperVisible(true);
  }

  function showLayerOnController(controller, layer, showLayer = true) {
    const layerId = layer.get('id');
    if (showLayer) {
      controller.addLayer(layer);
    } else {
      controller.removeLayer(layer);
    }
    
    layer.setVisible(showLayer);
    _layers[layerId].setAsShown(showLayer);
  }

  function enableCircle() {
    if (!circleControl) {
      console.log('cirle - layer', _visibleLeftLayer.get('name'))
      circleControl = new ol_interaction_Clip({
        radius: circleRadiusOption || 100,
      });
      showLayerOnController(circleControl, _visibleLeftLayer);
    }
    map.addInteraction(circleControl);
    setCircleVisible(true);
    console.info('enabling circle');
  }

  function disableSwiper() {
    map.removeControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(false);
    setSwiperVisible(false);
    _visibleLeftLayer.setVisible(false);
    swiperControl = null;
    console.info('disabling swiper');
  }

  function disableCircle() {
    map.removeInteraction(circleControl);
    setCircleVisible(false);
    circleControl = null;
    console.info('disabling circle');
  }

  function setSwiperVisible(state) {
    isSwiperVisible = state;
  }

  function setCircleVisible(state) {
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
  
    if (_layers[layerId].inUse()) {
      console.log('the layer ', layerId, 'is in use');
      return false;
    }

    const toBeSwiperLayer = _layers[layerId].getLayer();
    _visibleLeftLayer = toBeSwiperLayer;
    console.log('new left side - layer:', _layers[layerId].getName());
    
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

  function getSwiperLayers(layers) {
    layers.forEach(la => {
      _layers[la.get('id')] = new SwiperLayer(la, false, false);
    });
    return _layers;
  }

  function setupLayers(viewer) {
    const layers = findSwiperLayers(viewer);
    console.log('visible layers', layers.length, layers.map(l => l.get('name')))

    const swiperLayers = getSwiperLayers(layers);

    // setting right layer
    _visibleRightLayer = layers.find(l => l.get('visible'));
    if (!_visibleRightLayer) {
      // if none of the swiper layers is already visible => it must be another layer, 
      // find it and show that one on right hand side
      _visibleRightLayer = viewer.getLayers().filter(layer => !layer.get('isSwiperLayer'))
                                              .find(l => (backgroundGroups != null && backgroundGroups.find(l.get('group'))) 
                                                        && l.get('visible'));
    } else {
      swiperLayers[_visibleRightLayer.get('id')].setAsShownOnRight();
    }
    console.log('right layer', _visibleRightLayer.get('name'))

    // setting leftt layer
    _visibleLeftLayer = layers.find(l => !l.get('visible'));
    swiperLayers[_visibleLeftLayer.get('id')].setAsShown();
    _visibleLeftLayer.getLayerState().visible

    console.log('left layer', _visibleLeftLayer.get('name'))
  }

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      console.info('onInit - start');
      //   swiperEnabledLayers = new Collection([], { unique: true });   // Maybe we can use this later, otherwise delete
      swiperButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow',
        click() {
          if (!isSwiperVisible) {
            console.log("swipper click - is not visible yet");
            enableSwiper();
          } else {
            console.log("swipper click - is visible - removing it");
            disableSwiper();
            disableCircle();
            hideMenuButtons();
          }
        },
        icon: '#ic_compare_24px',
        tooltipText: 'Swipe between layers',
        tooltipPlacement: 'east',
      });
      circleButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          if (!isCircleVisible) {
            disableSwiper();
            enableCircle();
          } else {
            disableCircle();
            enableSwiper();
          }
        },
        icon: '#fa-circle-o',
        tooltipText: 'Circle between layers',
        tooltipPlacement: 'east',
      });

      swiperLegend = SwiperLegend({showLayer: resetSwiperLayer});

      swiperLegendButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          if (isSwiperVisible || isCircleVisible) {
            swiperLegend.setSwiperLegendVisible(true);
          }
        },
        icon: '#ic_layers_24px',
        tooltipText: 'Lager',
        tooltipPlacement: 'east',
      });

      buttonsContainer = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column',
      });
      console.info('onInit - end');
    },
    onAdd(evt) {
      console.info('onAdd - start');
      viewer = evt.target;
      map = viewer.getMap();

      // TODO:
      // 1. fetch all swiper layers
      // 2. Create a SwiperLayer class which will indicate layerName, visible, right, left, inUse (right or left?)
      // 3. Use the list<SwiperLayer> in the swiperLegend to populate it.
      // 4. Hook on any/all background layers for any change
      //    You hook up by listening on an event (shown in Markus chat)
      // 4.1 if change detected
      // 4.1.1 if it does not affect the left => just show it in the right, mark it as inUsed (right=true)
      //      and it should be disabled to select on the swiperLegend
      // 4.1.2 if affects left (is the same as left) => pick first in the SwiperLayer list which is not in Use and show it (mark it left=true)

      setupLayers(viewer);

      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getMapTools().getId()}`;
      this.addComponents([swiperButton, circleButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();

      console.info('onAdd - end');
    },
    render() {
      console.info('render - start');
      //Make an html fragment of buttonsContainer, add to DOM and sets DOM-node in module for easy access
      const buttonsContainerHtmlFragment = Origo.ui.dom.html(buttonsContainer.render());
      document.getElementById(target).appendChild(buttonsContainerHtmlFragment);
      buttonsContainerEl = document.getElementById(buttonsContainer.getId());

      //Make an html fragment of Swiper toggle button, add to DOM and sets DOM-node in module for easy access
      const swiperButtonHtmlFragment = Origo.ui.dom.html(swiperButton.render());
      buttonsContainerEl.appendChild(swiperButtonHtmlFragment);
      swiperButtonEl = document.getElementById(swiperButton.getId());

      //Make an html fragment of mode toggle button, add to DOM and sets DOM-node in module for easy access
      const modeButtonHtmlFragment = Origo.ui.dom.html(circleButton.render());
      buttonsContainerEl.appendChild(modeButtonHtmlFragment);
      circleButtonEl = document.getElementById(circleButton.getId());

      //Make an html fragment of mode toggle button, add to DOM and sets DOM-node in module for easy access
      const swiperLegendButtonHtmlFragment = Origo.ui.dom.html(swiperLegendButton.render());
      buttonsContainerEl.appendChild(swiperLegendButtonHtmlFragment);
      swiperLegendButtonEl = document.getElementById(swiperLegendButton.getId());

      swiperLegendButton.dispatch('render');
      swiperLegend.render(_layers);
      this.dispatch('render');
      console.info('render - end');
    },
  });
};

export default Swiper;
