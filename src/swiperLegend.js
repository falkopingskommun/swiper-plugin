import ol_control_Swipe from 'ol-ext/control/Swipe';
import Origo from 'Origo';
import { checkIsMobile } from './swiper';

const Collection = Origo.ol.Collection;
const TileLayer = Origo.ol.TileLayer;
const Element = Origo.ui.Element;

const SwiperLegend = function SwiperLegend(options = {}) {
  //Basics
  let viewer;
  let map;
  let target;
  let isVisible = false;
  let touchMode;

  //Plugin specific
  let windowContainerEl;
  let headerContainerEl;
  let contentContainerEl;

  let backgroundLayers;

  function setSwiperLegendVisible(state) {
    isVisible = state;
    if (isVisible) {
      windowContainerEl.classList.remove('hidden');
    } else {
      windowContainerEl.classList.add('hidden');
    }
  }

  function makeElementDraggable(elm) {
    const elmnt = elm;
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
  
    function elementDrag(e) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
      elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
    }
  
    function closeDragElement() {
      /* stop moving when mouse button or touch is released: */
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchend = null;
    }

    function dragMouseDown(e) {
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    if (document.getElementById(`${elmnt.id}-draggable`)) {
      /* if present, the header is where you move the DIV from: */
      document.getElementById(`${elmnt.id}-draggable`).onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV: */
      elmnt.onmousedown = dragMouseDown;
    }
  }

  function renderLayersList() {
    backgroundLayers.forEach(element => {
      const domElem = document.createElement('li');
      domElem.innerHTML = element.get('title');
      domElem.id = element.get('id');
      domElem.classList.add('swiper-content-list-item');
      contentContainerEl.appendChild(domElem);
    });
  }

  return Origo.ui.Component({
    name: 'swiperLegend',
    onInit() {},
    onAdd(evt) {
      console.log(evt);
      viewer = evt.target;
      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getId()}`;
      map = viewer.getMap();
      console.log(viewer.getLayers());
      backgroundLayers = viewer.getLayersByProperty('group', 'background');
      console.log('backgroundLayers', backgroundLayers);
    },
    render() {
      windowContainerEl = document.createElement('div');
      windowContainerEl.classList.add('swiper-window-container', 'hidden');
      windowContainerEl.id = 'swiperwindowcontainer';
      document.getElementById(target).appendChild(windowContainerEl);

      headerContainerEl = document.createElement('div');
      contentContainerEl = document.createElement('ul');

      headerContainerEl.classList.add('swiper-header');
      headerContainerEl.innerHTML = 'Ortofoto';
      headerContainerEl.id = `${windowContainerEl.id}-draggable`;

      contentContainerEl.classList.add('swiper-content');

      windowContainerEl.appendChild(headerContainerEl);
      windowContainerEl.appendChild(contentContainerEl);

      // //Make an html fragment of Swiper toggle button, add to DOM and sets DOM-node in module for easy access
      // const swiperButtonHtmlFragment = Origo.ui.dom.html(swiperButton.render());
      // buttonsContainerEl.appendChild(swiperButtonHtmlFragment);
      // swiperButtonEl = document.getElementById(swiperButton.getId());
      //
      // //Make an html fragment of mode toggle button, add to DOM and sets DOM-node in module for easy access
      // const modeButtonHtmlFragment = Origo.ui.dom.html(modeButton.render());
      // buttonsContainerEl.appendChild(modeButtonHtmlFragment);
      // modeButtonEl = document.getElementById(modeButton.getId());
      console.log(windowContainerEl);
      makeElementDraggable(windowContainerEl);
      renderLayersList();
      this.dispatch('render');
    },
    setSwiperLegendVisible
  });
};

export default SwiperLegend;
