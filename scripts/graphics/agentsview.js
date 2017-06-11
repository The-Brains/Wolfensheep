define([
        'threejs',
        'dobuki',
        './imagestore.js',
        '../core/localization/location.js',
    ],
    function(THREE, DOK, ImageStore, Location) {
        return function (cameraHandler, spriteRenderer, cellSize, game) {
            var range = 100;
            var worldWidth = game.getWidth();
            var worldHeight = game.getHeight();

            var tempArray = [];

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
                    agentsCache: DOK.Utils.makeArray(worldHeight, worldWidth),
                },
                function (x, y) {
                    var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                    var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                    if(this.options.agentsCache[tileY][tileX] === undefined) {
                        this.options.agentsCache[tileY][tileX] = game.getWorld().getAgentsAt(new Location(tileX,tileY));
                    }
                    var agents = this.options.agentsCache[tileY][tileX];
                    tempArray.length = 0;
                    for(var a in agents) {
                        var agent = agents[a];
                        var img = ImageStore.getImageFromAgent(agent);

                        var spriteObj = DOK.SpriteObject.create(
                            x * cellSize, y * cellSize, cellSize,
                            cellSize*3, cellSize*3,
                            null,
                            1,
                            img
                        );
                        spriteObj.type = 'face';
                        tempArray.push(spriteObj);
                    }

                    return tempArray;
                }
            );

            function update() {
                collection.forEach(spriteRenderer.display);
            }

            function clearCache(x,y) {
                var tileX = ((x % worldWidth) + worldWidth) % worldWidth;
                var tileY = ((y % worldHeight) + worldHeight) % worldHeight;
                delete collection.options.agentsCache[tileY][tileX];
            }

            game.getWorld().setAgentCallback(function(agent, locationFrom, locationTo) {
                if(locationFrom)
                    clearCache(locationFrom.getRoundedX(), locationFrom.getRoundedY());
                if(locationTo)
                    clearCache(locationTo.getRoundedX(), locationTo.getRoundedY());
            });

            this.update = update;
        };
});
