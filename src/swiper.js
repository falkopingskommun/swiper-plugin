import ol_control_Swipe from 'ol-ext/control/Swipe';
import Origo from 'Origo';
import SwiperLegend from './swiperLegend';

const Collection = Origo.ol.Collection;
const TileLayer = Origo.ol.TileLayer;

const SPLIT_MODE = 'split';
const CIRCLE_MODE = 'circle';

export function checkIsMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
}

const Swiper = function Swiper(options = {}) {
  //Basics
  let viewer;
  let map;
  let target;
  let isActive = false;
  let touchMode;

  //Plugin specific
  let buttonsContainer;
  let swiperLayers;
  let swiperLayerNames = options ? options.layers : undefined; // Används inte nu, borde få till detta senare.
  let swiperButton;
  let modeButton;
  let legendButton;
  let mode = SPLIT_MODE;
  let swiperControl;

  let swiperLegendVisible = false;
  let swiperLegendButton;
  let swiperLegend;
  
  let tileLayer;
  let vectorLayers;

  //Dom-nodes (not sure if needed, might clean later)
  let buttonsContainerEl;
  let swiperButtonEl;
  let modeButtonEl;
  let swiperLegendButtonEl;

  function setActive(state) {
    isActive = state;
  }

  function toggleSwiper() {
    const detail = {
      name: 'swiper',
      active: !isActive,
    };
    viewer.dispatch('toggleClickInteraction', detail);
  }

  // vectorLayers & tileLayer
  function toggleLayer(layer, boolean) {
    layer.map(tile => {
      tile.setVisible(boolean);
    });
  }

  function enableSwiper() {
    //Do some stuffs with the buttons so they are active and visible
    swiperButtonEl.classList.add('active');
    modeButtonEl.classList.remove('hidden');
    swiperLegendButtonEl.classList.remove('hidden');

    if (checkIsMobile()) {
      swiperControl = new ol_control_Swipe({
        layers: vectorLayers,
        rightLayer: null,
        className: 'ol-swipe',
        position: 0,
        orientation: 'horizontal',
      });
    } else {
      swiperControl = new ol_control_Swipe({
        layers: vectorLayers,
        rightLayer: tileLayer,
        className: 'ol-swipe',
        position: 0,
        orientation: 'vertical',
      });
    }
    toggleLayer(vectorLayers, true);
    // vectorLayers.on('change:visible', event => { });
    map.addControl(swiperControl);
    swiperControl.addLayer(layer1);
    swiperControl.addLayer(layer2, true);
    layer1.on('change:visible', (event) => {
      console.log('Changing visible of layer one. LEFT', event)
      layer1.setVisible(true);
      console.log(viewer.getLayers())
    })


    swiperControl.addLayer(layer1, true);

    setActive(true);
    console.log('Enable');
  }

  function disableSwiper() {
    //Do some stuffs with the buttons so they are inactive and hidden
    swiperButtonEl.classList.remove('active');
    swiperLegendButtonEl.classList.remove('active');
    modeButtonEl.classList.add('hidden');
    swiperLegendButtonEl.classList.add('hidden');
    map.removeControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(false);
    toggleLayer(vectorLayers, false);
    setActive(false);
    console.log('Disable');
  }

  function setMode(newMode) {
    mode = newMode;
  }

  function toggleMode() {
    console.log('Toggling mode');
    if (mode === SPLIT_MODE) {
      console.log('setting circle mode');
      modeButtonEl.classList.add('active');
      setMode(CIRCLE_MODE);
    } else {
      console.log('setting split mode');
      modeButtonEl.classList.remove('active');
      setMode(SPLIT_MODE);
    }
  }

  function setSwiperLegendVisible(state) {
    swiperLegendVisible = state;
  }

  function toggleSwiperLegend() {
    if (swiperLegendVisible) {
      console.log('Making swiper legend hidden');
      swiperLegendButtonEl.classList.remove('active');
      swiperLegend.setSwiperLegendVisible(false);
      setSwiperLegendVisible(false);
    } else {
      console.log('Activating swiper legend');
      swiperLegendButtonEl.classList.add('active');
      swiperLegend.setSwiperLegendVisible(true);
      setSwiperLegendVisible(true);
    }
  }

  function setSwiperLayers() {
    const allLayers = viewer.getLayers();
    console.log('allLayers: ' + allLayers);
    tileLayer = allLayers.filter(l => l instanceof Origo.ol.layer.Tile);
    //  ortoPhoto = allLayers.filter(l => l instanceof Origo.ol.layer.OrtoPhoto);
    vectorLayers = allLayers.filter(l => l instanceof Origo.ol.layer.Vector);
  }

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      swiperLayers = new Collection([], { unique: true });
      swiperButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow',
        click() {
          toggleSwiper();
        },
        icon: '#fa-expand',
        tooltipText: 'Swipe layer',
        tooltipPlacement: 'east',
      });
      modeButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          toggleMode();
        },
        icon: '#fa-circle-o',
        tooltipText: 'Mode',
        tooltipPlacement: 'east',
      });

      //Swiper legend
      swiperLegend = SwiperLegend({
        layerClickHandler: layerId => {
          console.log(layerId);
        },
      });

      swiperLegendButton = Origo.ui.Button({
        cls: 'o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden',
        click() {
          toggleSwiperLegend();
        },
        icon: '#fa-chevron-right',
        tooltipText: 'Swiper legend',
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
      this.addComponents([swiperButton, modeButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();
      viewer.on('toggleClickInteraction', detail => {
        if (detail.name === 'swiper' && detail.active) {
          enableSwiper();
        } else {
          disableSwiper();
        }
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
      const modeButtonHtmlFragment = Origo.ui.dom.html(modeButton.render());
      buttonsContainerEl.appendChild(modeButtonHtmlFragment);
      modeButtonEl = document.getElementById(modeButton.getId());

      //Make an html fragment of mode toggle button, add to DOM and sets DOM-node in module for easy access
      const swiperLegendButtonHtmlFragment = Origo.ui.dom.html(swiperLegendButton.render());
      buttonsContainerEl.appendChild(swiperLegendButtonHtmlFragment);
      swiperLegendButtonEl = document.getElementById(swiperLegendButton.getId());
      swiperLegendButton.dispatch('render');
      swiperLegend.render();
      this.dispatch('render');
    },
  });
};

export default Swiper;
