# swiper

## To use the plugin

In the Origo project index.html import swiper component
Declare circleRadius to the size of the circle layer.

```html
<script src="plugins/swiper.js"></script>
<script type="text/javascript">
  const origo = Origo('index.json');
  origo.on('load', function (viewer) {
    const swiper = Swiper({ circleRadius: 100 });
    origo.addComponent(swiper);
  });
</script>
```

In the Origo project index.json set `isSwiperLayer = true` to any background layer
you wish the swiper plugin have access to show in the second view.

```json
{
    "attribution": "&copy Lantmäteriet geodatasamverkan",
    "format": "image/png",
    "group": "background",
    "name": "SIG:topowebbkartan_nedtonad",
    "source": "basemap",
    "title": "Karta, grå",
    "type": "WMTS",
    "style": "karta_gra",
    "visible": true,
    "isSwiperLayer": true
},
```

## Swiper settings

- `circleRadius`: used for the Clip (circle) plugin, the default is 50 (meters)
- `tooltips`: object which contains the tooltip text for the existing buttons
  - `swiper`: the main button to show the overlay options
  - `swipeBetweenLayers`: enables the split screen
  - `circleSwipe`: shows the circle overlay option, toggles between the two effects
  - `layerList`: shows the list of swiper enabled layers

## Plugins used:

1. [ol-ext/interaction/Clip](http://viglino.github.io/ol-ext/examples/interaction/map.interaction.clip.html). This is to show a circle and a different map layer in it.
2. [ol-ext/contol/Swipe](http://viglino.github.io/ol-ext/examples/control/map.control.swipe.html). This is to split the map view in two. Boths sides will show different layers. Note that the same layer can not be shown in both sides, this is a limitation no the tool, but it also does not make sense to show the same layer on both sides.
