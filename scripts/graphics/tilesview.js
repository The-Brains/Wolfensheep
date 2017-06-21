define([
        'dobuki',
        './imagestore.js',
    ],
    function(DOK, ImageStore) {
        return function (cameraHandler, spriteRenderer, cellSize, game) {
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
                    imageCache: DOK.Utils.makeArray(worldHeight, worldWidth),
                },
                function (x, y) {
                    if (this.options.tiles) {
                        var imgInfo = getImgInfo(x,y);
                        var light = 1;
                        if(x===cameraHandler.getCamPos().x && y===cameraHandler.getCamPos().y) {
                            light = Math.random();
                        }
                        if (imgInfo !== null) {
                            return DOK.SpriteObject.create(
                                x * cellSize, y * cellSize, 0,//c!==0?0:-64,
                                cellSize, cellSize,
                                DOK.Camera.quaternions.southQuaternionArray,
                                imgInfo.img,
                                light,
                                imgInfo.wave
                            );
                        }
                    }
                    return null;
                }
            );

            function getImgInfo(x,y) {
                var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                if (collection.options.imageCache[tileY][tileX]===undefined) {
                    var tile = collection.options.tiles[tileX][tileY];
                    collection.options.imageCache[tileY][tileX] = tile
                        ? ImageStore.getImageInfoFromTile(tile) : null;
                }
                var imgInfo = collection.options.imageCache[tileY][tileX];
                return imgInfo;
            }

            function update() {
                collection.options.tiles = game.getWorld().getAllTiles();
                collection.forEach(spriteRenderer.display);
            }

            function clearCache(x,y) {
                var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                delete collection.options.imageCache[tileY][tileX];
            }

            game.getWorld().setTileCallback(function(tileStatus) {
                var location = tileStatus.getLocation();
                clearCache(location.getX(), location.getY());
            });

            this.update = update;
            this.getImgInfo  = getImgInfo;
        };
});
