import Origo from 'Origo';
import ol_control_Swipe from 'ol-ext/control/Swipe';
import ol_interaction_Clip from 'ol-ext/interaction/Clip';
import SwiperLegend from './swiperLegend';
import { checkIsMobile } from './functions';

let oneSwiperLayer;

export function setOneSwiperLayer(swiperLayer) {
  oneSwiperLayer = swiperLayer;
  console.log('oneSwiperLayer: ' + oneSwiperLayer);
}

const Swiper = function Swiper({ circleRadius }) {
  let viewer;
  let map;
  let target;
  let touchMode;

  let buttonsContainer;
  let swiperControl;
  let circleControl;

  let swiperButton;
  let circleButton;

  let isSwiperVisible = false;
  let isCircleVisible = false;

  let isSwiperLayer;
  let circleRadiusOption = circleRadius;
  let activeMapLayer;

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

    swiperControl = new ol_control_Swipe({
      layer: isSwiperLayer,
      rightLayer: oneSwiperLayer | activeMapLayer,
      orientation: checkIsMobile() ? 'horizontal' : 'vertical',
    });
    // toggleLayer(isSwiperLayer, true);
    // oneSwiperLayer.setVisible(true);
    swiperControl.removeLayer(isSwiperLayer, false);
    swiperControl.addLayer(isSwiperLayer, false);
    map.addControl(swiperControl);

    setSwiperVisible(true);
  }

  function enableCircle() {
    map.addInteraction(circleControl);
    setCircleVisible(true);
  }

  function disableSwiper() {
    map.removeControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(false);
    setSwiperVisible(false);
  }

  function disableCircle() {
    map.removeInteraction(circleControl);
    setCircleVisible(false);
  }

  function setSwiperVisible(state) {
    isSwiperVisible = state;
  }

  function setCircleVisible(state) {
    isCircleVisible = state;
  }

  // get swiperlayers from config file in origo
  function setSwiperLayer(viewer) {
    isSwiperLayer = viewer.getLayers().filter(layer => layer.get('isSwiperLayer') === true);
  }

  return Origo.ui.Component({
    name: 'swiper',
    onInit() {
      //   isSwiperLayer = new Collection([], { unique: true });   // Maybe we can use this later, otherwise delete
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

      swiperLegend = SwiperLegend({});

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
    },
    onAdd(evt) {
      viewer = evt.target.api();
      map = viewer.getMap();
      activeMapLayer = map;
      setSwiperLayer(viewer);

      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getMapTools().getId()}`;
      this.addComponents([swiperButton, circleButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();

      circleControl = new ol_interaction_Clip({
        radius: circleRadiusOption | 100,
        layer: isSwiperLayer
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
      this.dispatch('render');
    },
  });
};

export default Swiper;
