# swiper

To start project


Import swiper in project Origo index file:
origo\index.html


<script src="plugins/swiper.js"></script>
<script type="text/javascript">
	//Init origo
	const origo = Origo("index.json");
    	origo.on("load", function (viewer) {
    		const swiper = Swiper();
    		origo.addComponent(swiper);
    	});
</script>