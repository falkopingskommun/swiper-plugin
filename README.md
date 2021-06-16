# swiper

To start project

For now 2021-06-16
USE BRANCH SWIPER IN ORIGO PROJECT 

In the Origo project index.html import swiper component
Declare circleRadius to the size of the circle layer.

<script src="plugins/swiper.js"></script>
<script type="text/javascript">
	const origo = Origo("index.json");
    	  origo.on("load", function (viewer) {
    		const swiper = Swiper({circleRadius: 100});
    		origo.addComponent(swiper);
    	});
</script>


In the Origo project index.json declare isSwiperLayer = true

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
