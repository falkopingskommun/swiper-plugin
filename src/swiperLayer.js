export default class SwiperLayer {
    constructor(layer, visibleRight, visibleLeft) {
        this.layer = layer;
        this.layerName = layer.get('name');
        this.right = visibleRight;
        this.left = visibleLeft;
    }

    getLayer() {
        return this.layer;
    }

    getName() {
        return this.layerName;
    }

    inUse() {
        return this.right || this.left;
    }

    setAsShown(visibleLeft = true) {
        this.left = visibleLeft;
        this.right = false;
    }

    setAsShownOnRight(shown = true) {
        this.right = shown;
        this.left = false;
    }
};
