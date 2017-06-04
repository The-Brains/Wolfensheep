define([
        'threejs',
        'dobuki',
        './imagestore.js',
    ],
    function(THREE, DOK, ImageStore) {
        var TilesView = function (cameraHandler, spriteRenderer, cellSize, game) {
            var range = 100;
            var worldWidth = game.getWidth();
            var worldHeight = game.getHeight();

            var collection = new DOK.Collection(
                {
                    type: "grid",
                    get x() {
                        return cameraHandler.getCamPos().x - Math.floor(range / 2);
                    },
                    get y() {
                        return cameraHandler.getCamPos().y - Math.floor(range / 2);
                    },
                    width: range,
                    height: range,
                    tiles: null,
                },
                function (x, y) {
                    if (this.options.tiles) {
                        var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                        var tileY = ((y % worldHeight) + worldHeight) % worldHeight;

                        var tile = this.options.tiles[tileX + "-" + tileY];
                        if (tile) {
                            var status = tile.status;

                            var img = ImageStore.getImageFromTileStatus(status);

                            return DOK.SpriteObject.create().init(
                                x * cellSize, y * cellSize, 0,//c!==0?0:-64,
                                cellSize, cellSize,
                                DOK.Camera.quaternions.southQuaternionArray,
                                1,
                                img
                            );
                        }
                    }
                }
            );

            function update() {
                collection.options.tiles = game.getWorld().getAllTiles();
                collection.forEach(spriteRenderer.display);
            }

            this.update = update;
        }

        return TilesView;
});