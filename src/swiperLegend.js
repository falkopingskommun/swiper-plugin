import Origo from 'Origo';
import { setActiveBackgroundLayer } from './swiper';

const addStyle = () => {
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
  .legend-layer-container {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 0 8px #888;
    font-size: 12px;
    font-weight: normal;
    position: absolute;
    left: 100px;
    top: 20px;
    max-width: 300px;
    width: 180px;
    z-index: 1;
    cursor: move;
    opacity: 0.9;
  }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
  .legend-layer-header {
    margin: 10px 0 5px 0;
    padding: 0;
    font-weight: bold;
    text-align: center;
    font-size: 14px;
 }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
  .legend-close-button {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    fill: #4a4a4a;
    background-color: #eeeeee;
    content: url('data:image/svg+xml;utf8,<svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5L105 105M5 105L105 5" stroke="rgb(74, 74, 74)" stroke-width="20" stroke-linecap="round"/></svg>');
    opacity: 0.9;
    cursor: pointer;
    margin: 2px;
    height: 10px;
    padding: 10px;
 }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
  .legend-list {
    display: block;
    padding: 0 !important;
    margin: 0 !important;
    cursor: default;
    border-radius: 5px;
  }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
   .legend-list-item {
      display: block;
      margin: 0 !important;
      padding: 10px 15px !important;
      cursor: pointer;
      text-decoration: underline;
    }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
     .legend-list-item:hover {
        background-color: #eeeeee;
    }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
    .legend-list-item:last-child:hover {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
    .o-map .ol-control {
      position: absolute;
      bottom: 30px;
    }`);
  document.styleSheets[document.styleSheets.length - 1].insertRule(`
    div.ol-swipe.ol-unselectable.ol-control button {
      background-color: #eeeeee;
      cursor: move;
      opacity: 0.5;
    }`);
};

addStyle();

const SwiperLegend = function SwiperLegend(options = {}) {
  //Basics
  let viewer;
  let map;
  let target;
  let isVisible = false;
  let touchMode;

  //Plugin specific
  let legendLayerContainer;
  let headerContainerEl;
  let contentContainerEl;

  let allBackgroundLayers;

  function setSwiperLegendVisible(state) {
    isVisible = state;
    if (isVisible) {
      legendLayerContainer.classList.remove('hidden');
    } else {
      legendLayerContainer.classList.add('hidden');
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

      document.ontouchstart = closeDragElement;
      document.ontouchmove = elementDrag;
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
    allBackgroundLayers.forEach(element => {
      const legendLayersListItem = document.createElement('li');
      legendLayersListItem.innerHTML = element.get('title');
      legendLayersListItem.id = element.get('id');
      legendLayersListItem.className = 'legend-list-item';
      contentContainerEl.appendChild(legendLayersListItem);

      legendLayersListItem.addEventListener('click', () => {
        setActiveBackgroundLayer(element.get('id'));
        console.log('legendLayersListItem: ' + element.get('id'));
      });
    });
  }

  return Origo.ui.Component({
    name: 'swiperLegend',
    onInit() {},
    onAdd(evt) {
      setActiveBackgroundLayer(evt);
      viewer = evt.target;
      touchMode = 'ontouchstart' in document.documentElement;
      target = `${viewer.getMain().getId()}`;
      map = viewer.getMap();

      allBackgroundLayers = viewer.getLayersByProperty('group', 'background');
      console.log('backgroundLayers: ' + allBackgroundLayers);
    },
    render() {
      legendLayerContainer = document.createElement('div');
      legendLayerContainer.className = 'legend-layer-container';
      legendLayerContainer.classList.add('legend-layer-container', 'hidden');
      legendLayerContainer.id = 'legendLayerContainer';
      document.getElementById(target).appendChild(legendLayerContainer);

      contentContainerEl = document.createElement('ul');
      contentContainerEl.className = 'legend-list';

      headerContainerEl = document.createElement('div');
      headerContainerEl.className = 'legend-layer-header';
      headerContainerEl.innerHTML = 'Ortofoto';
      headerContainerEl.id = `${legendLayerContainer.id}-draggable`;

      const legendCloseButton = document.createElement('div');
      legendCloseButton.className = 'legend-close-button';

      legendCloseButton.addEventListener('click', () => {
        setSwiperLegendVisible(false);
      });

      headerContainerEl.appendChild(legendCloseButton);
      legendLayerContainer.appendChild(headerContainerEl);
      legendLayerContainer.appendChild(contentContainerEl);

      makeElementDraggable(legendLayerContainer);
      renderLayersList();
      this.dispatch('render');
    },
    setSwiperLegendVisible
  });
};

export default SwiperLegend;
