# swiper

## To use the plugin

In the Origo project index.html import swiper component
Declare circleRadius to the size of the circle layer.

```html
<!--Add in header-->
<link href="plugins/swiper.css" rel="stylesheet" />

<!--Add in body-->
<script src="plugins/swiper.js"></script>
<script type="text/javascript">
  const origo = Origo('index.json');
  origo.on('load', function (viewer) {
    const swiper = Swiper({ circleRadius: 100 });
    viewer.addComponent(swiper);
  });
</script>
```

In the Origo project index.json set `isSwiperLayer = true` to any layer you wish the swiper plugin have access to show in the second view.

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

To have a better control (and the swiper layers do not interfeer with the legend) we recomend to duplicate the swiper layer in the config file and add the following changes

```json
{
    "group": "none",
    "name": "originalName__swiper",
    "visible": false,
    "isSwiperLayer": true
},
```

These settings will make the layer different from the ones used/displayed in the legend (`group:none`). The layer should be not visible by default and the name should be similar but have the double underscore with an additional name to differenciate the layers.

Note. If you are using the suggestion above, it is also recommended that the duplicated layers should be set above the layers, so when displaying them they will be on top. (If you put them at the end of your json file they will be hidden when trying to display them).

## Swiper settings

- `circleRadius`: used for the Clip (circle) plugin, the default is 50 (meters)
- `circleZIndex`: default 1. Used to force the layer in the Clip (circle) to always be on top of any other layers. The default `1` will make the circle to be on top, adjust accordingly in case any layer has an already zIndex.
- `initialLayer`: indicate the name of the layer which should be picked when first enabling the tool. Default value is null and will pick the first swiper layer.
- `initialControl`: [null|swipe|clip] chooose between the two tools to be enable on when swiper is enabled. Default value is null.
- `backgroundGroup`: name of the background group layers, the default 'background'. Needed when handing edge cases such as when the user is trying to show the same layer on both sides
- `showLayerListOnStart`: default `false`. Indicates if the layer list should be open when the starting Swiper.
- `tooltips`: object which contains the tooltip text for the existing buttons
  - `swiper`: the main button to show the overlay options
  - `swipeBetweenLayers`: enables the split screen
  - `circleSwipe`: shows the circle overlay option, toggles between the two effects
  - `layerList`: shows the list of swiper enabled layers

## Limitations

The Swiper tools (the clip and the swipe) do not support showing the same layer as the already visible layer. In the case the user selects the same layer, the tool will close and simply show the visible layers.

## Plugins used:

1. [ol-ext/interaction/Clip](http://viglino.github.io/ol-ext/examples/interaction/map.interaction.clip.html). This is to show a circle and a different map layer in it.
2. [ol-ext/contol/Swipe](http://viglino.github.io/ol-ext/examples/control/map.control.swipe.html). This is to split the map view in two. Boths sides will show different layers. Note that the same layer can not be shown in both sides, this is a limitation no the tool, but it also does not make sense to show the same layer on both sides.
