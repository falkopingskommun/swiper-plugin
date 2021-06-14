import ol_control_Swipe from 'ol-ext/control/Swipe';
import Origo from 'Origo';
import SwiperLegend from './swiperLegend';
import ol_interaction_Clip from 'ol-ext/interaction/Clip';

const olFeature = Origo.ol.Feature;
const olCollection = Origo.ol.Collection;
const olOverlay = Origo.ol.Overlay;

let activeBackgroundLayer = null;
let allLayers;

export function setActiveBackgroundLayer(layer) {
  activeBackgroundLayer = layer;
}

export function checkIsMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
}

const Swiper = function Swiper({circleRadius}) {
  //Basics
  let viewer;
  let map;
  let target;
  let touchMode;

  //Plugin specific
  let buttonsContainer;
  let swiperControl;
  let swiperButton;
  let circleButton;

  let isSwiperVisible = false;
  let isCircleVisible = false;
  let swiperLegendButton;
  let swiperLegend;
  let circleLayer;
  let circleRadiusOption = circleRadius;

  let tileLayer;
  let vectorLayers;

  //Dom-nodes (not sure if needed, might clean later)
  let buttonsContainerEl;
  let swiperButtonEl;
  let swiperLegendButtonEl;
  let circleButtonEl;

  function toggleLayer(layer, boolean) {
    if (layer) {
      layer.map(tile => {
        tile.setVisible(boolean);
      });
    }
    // Maybe we need this later
    // tileLayer.on('change:visible', event => { });
    // swiperControl.addLayer(tileLayer, true);
    //   layer1.setVisible(true);
    // })
  }

  function showMenuButtons() {
    swiperButtonEl.classList.remove('hidden');
    circleButtonEl.classList.remove('hidden');
    swiperLegendButtonEl.classList.remove('hidden');

    swiperButtonEl.classList.add('active');
    circleButtonEl.classList.add('active');
    swiperLegendButtonEl.classList.add('active');
  }

  function hideMenuButtons() {
    circleButtonEl.classList.remove('active');
    circleButtonEl.classList.add('hidden');

    swiperLegendButtonEl.classList.remove('active');
    swiperLegendButtonEl.classList.add('hidden');
  }

  function enableSwiper() {
    showMenuButtons();
    if (checkIsMobile()) {
      swiperControl = new ol_control_Swipe({
        layers: allLayers,
        rightLayer: activeBackgroundLayer,
        className: 'ol-swipe',
        position: 0,
        orientation: 'horizontal',
      });
    } else {
      swiperControl = new ol_control_Swipe({
        layers: allLayers,
        rightLayer: activeBackgroundLayer,
        className: 'ol-swipe',
        position: 0,
        orientation: 'vertical',
      });
    }

   toggleLayer(tileLayer, true);

    map.addControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(true);
    setSwiperLegendVisible(true);
  }

  function clearMapLayers() {
    map.getLayers().forEach(layer => {
      //   if (layer.get('name') && layer.get('name') === 'vector') {
      if (layer) {
        console.log('layer name: ' + layer.get('name'));
        map.removeLayer(layer);
      }
    });
  }

  function disableSwiper() {
    map.removeControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(false);
    setSwiperLegendVisible(false);
  }

  function disableCircle() {
    map.removeInteraction(circleLayer);
    setCircleVisible(false);
  }

  function setSwiperLegendVisible(state) {
    isSwiperVisible = state;
  }

  function setCircleVisible(state) {
    isCircleVisible = state;
  }

  function showCircle() {
    map.addInteraction(circleLayer);
    setCircleVisible(true);
  }

  function showSwiperLayer() {
    map.addControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(true);
    setSwiperLegendVisible(true);
  }

  function setSwiperLayers() {
    allLayers = viewer.getLayers();
    console.log('allLayers: ' + allLayers);
    tileLayer = allLayers.filter(l => l instanceof Origo.ol.layer.Tile);
    vectorLayers = allLayers.filter(l => l instanceof Origo.ol.layer.Vector);
  }

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      //   swiperLayers = new Collection([], { unique: true });
      swiperButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow',
        click() {
          if (!isSwiperVisible) {
            enableSwiper();
          } else {
            disableSwiper();
            disableCircle();
            hideMenuButtons();
          }
        },
        icon: '#fa-expand',
        tooltipText: 'Swipe between layers',
        tooltipPlacement: 'east',
      });
      circleButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          if (!isCircleVisible) {
            disableSwiper();
            showCircle();
          } else {
            disableCircle();
            enableSwiper();
          }
        },
        icon: '#fa-circle-o',
        tooltipText: 'Circle between layers',
        tooltipPlacement: 'east',
      });

      swiperLegend = SwiperLegend({});

      swiperLegendButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          if (!isSwiperVisible) {
            disableCircle();
            showSwiperLayer();
          } else {
            disableSwiper();
            disableCircle();
          }
        },
        icon: '#fa-chevron-right',
        tooltipText: 'Change left layer',
        tooltipPlacement: 'east',
      });

      buttonsContainer = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column',
      });
    },
    onAdd(evt) {
      console.log('Running on add');
      viewer = evt.target.api();
      setSwiperLayers();
      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getMapTools().getId()}`;
      map = viewer.getMap();
      this.addComponents([swiperButton, circleButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();
      circleLayer = new ol_interaction_Clip({
        radius: circleRadiusOption ? circleRadiusOption : 100,
        layers: allLayers
      });
    },
    render() {
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
      swiperLegend.render();
      buttonsContainerEl.classList.add('active');
      this.dispatch('render');
    },
  });
};

export default Swiper;
