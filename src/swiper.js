import ol_control_Swipe from "ol-ext/control/Swipe";
import Origo from "Origo";
import SwiperLegend from './swiperLegend';

const Collection = Origo.ol.Collection;
const TileLayer = Origo.ol.TileLayer;

const SPLIT_MODE = "split";
const CIRCLE_MODE = "circle";

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
      name: "swiper",
      active: !isActive,
    };
    viewer.dispatch("toggleClickInteraction", detail);
  }

  function enableSwiper() {
    //Do some stuffs with the buttons so they are active and visible
    swiperButtonEl.classList.add("active");
    modeButtonEl.classList.remove("hidden");
    swiperLegendButtonEl.classList.remove('hidden');

    //Get some layers
    const layer1 = swiperLayers[0];
    const layer2 = swiperLayers[3];
    layer1.setVisible(true);
    console.log(layer1)
    console.log(layer2)
    //Create and add the control
    swiperControl = new ol_control_Swipe({position: 0.8});
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
    console.log("Enable");
  }

  function disableSwiper() {
    //Do some stuffs with the buttons so they are inactive and hidden
    swiperButtonEl.classList.remove("active");
    swiperLegendButtonEl.classList.remove("active");
    modeButtonEl.classList.add("hidden");
    swiperLegendButtonEl.classList.add('hidden');
    map.removeControl(swiperControl);
    swiperLegend.setSwiperLegendVisible(false);
    setActive(false);
    console.log("Disable");
  }

  function setMode(newMode) {
    mode = newMode;
  }

  function toggleMode() {
    console.log("Toggling mode");
    if (mode === SPLIT_MODE) {
      console.log("setting circle mode");
      modeButtonEl.classList.add("active");
      setMode(CIRCLE_MODE);
    } else {
      console.log("setting split mode");
      modeButtonEl.classList.remove("active");
      setMode(SPLIT_MODE);
    }
  }

  function setSwiperLegendVisible(state) {
    swiperLegendVisible = state;
  }

  function toggleSwiperLegend() {
    console.log('Toggling swiper legend');
    
    if (swiperLegendVisible) {
      console.log("Making swiper legend hidden");
      swiperLegendButtonEl.classList.remove("active");
      swiperLegend.setSwiperLegendVisible(false)
      setSwiperLegendVisible(false);
    } else {
      console.log("Activating swiper legend");
      swiperLegendButtonEl.classList.add("active");
      swiperLegend.setSwiperLegendVisible(true);
      setSwiperLegendVisible(true);
    }
  }

  function setSwiperLayers() {
    const allLayers = viewer.getLayers();
    console.log(Origo.ol)
    const filteredLayers = allLayers.filter((l) => l instanceof Origo.ol.layer.Tile);
    swiperLayers = filteredLayers;
    console.log(swiperLayers);
  }

  return Origo.ui.Component({
    name: "swiper",
    onInit() {
      swiperLayers = new Collection([], { unique: true });
      swiperButton = Origo.ui.Button({
        cls:
          "o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow",
        click() {
          toggleSwiper();
        },
        icon: "#fa-map-marker",
        tooltipText: "Swipe",
        tooltipPlacement: "east",
      });
      modeButton = Origo.ui.Button({
        cls:
          "o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden",
        click() {
          toggleMode();
        },
        icon: "#fa-polygon-o",
        tooltipText: "Mode",
        tooltipPlacement: "east",
      });


      //Swiper legend
      swiperLegend = SwiperLegend({layerClickHandler: (layerId) => {
        console.log(layerId);
      }});

      swiperLegendButton = Origo.ui.Button({
        cls:
          "o-measure padding-small margin-bottom-smaller icon-smaller round light box-shadow hidden",
        click() {
          toggleSwiperLegend();
        },
        icon: "#fa-polygon-o",
        tooltipText: "Swiper legend",
        tooltipPlacement: "east",
      });


      buttonsContainer = Origo.ui.Element({
        tagName: "div",
        cls: "flex column",
      });
    },
    onAdd(evt) {
      console.log('Running on add')
      viewer = evt.target.api();
      setSwiperLayers();
      touchMode = "ontouchstart" in document.documentElement;
      target = `${viewer.getMain().getMapTools().getId()}`;
      map = viewer.getMap();
      this.addComponents([swiperButton, modeButton, swiperLegendButton]);
      viewer.addComponent(swiperLegend);
      this.render();
      viewer.on("toggleClickInteraction", (detail) => {
        if (detail.name === "swiper" && detail.active) {
          enableSwiper();
        } else {
          disableSwiper();
        }
      });
    },
    render() {
      //Make an html fragment of buttonsContainer, add to DOM and sets DOM-node in module for easy access
      const buttonsContainerHtmlFragment = Origo.ui.dom.html(
        buttonsContainer.render()
      );
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
      this.dispatch("render");
    },
  });
};

export default Swiper;
