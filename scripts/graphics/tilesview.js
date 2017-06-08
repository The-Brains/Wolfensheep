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

            var collection = new DOK.Collection({
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
                    imageCache: {},
                },
                function (x, y) {
                    if (this.options.tiles) {
                        var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                        var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                        var key = tileX + "-" + tileY;

                        if (this.options.imageCache[key]===undefined) {
                            var tile = collection.options.tiles[key];
                            this.options.imageCache[key] = tile ? ImageStore.getImageFromTile(tile) : null;
                        }
                        var img = this.options.imageCache[key];

                        if (img !== null) {
                            return DOK.SpriteObject.create(
                                x * cellSize, y * cellSize, 0,//c!==0?0:-64,
                                cellSize, cellSize,
                                DOK.Camera.quaternions.southQuaternionArray,
                                1,
                                img
                            );
                        }
                    }
                    return null;
                }
            );

            function update() {
                collection.options.tiles = game.getWorld().getAllTiles();
                collection.forEach(spriteRenderer.display);
            }

            function clearCache(x,y) {
                var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                var key = tileX + "-" + tileY;
                delete collection.options.imageCache[key];
            }

            game.getWorld().setTileCallback(function(tileStatus) {
                var location = tileStatus.getLocation();
                clearCache(location.getX(), location.getY());
            });

            this.update = update;
        };

        return TilesView;
});