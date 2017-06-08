define([
        'threejs',
        'dobuki',
        './imagestore.js',
        '../core/localization/location.js',
    ],
    function(THREE, DOK, ImageStore, Location) {
        var AgentsView = function (cameraHandler, spriteRenderer, cellSize, game) {
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
                    agentsCache: {},
                },
                function (x, y) {
                    if(this.options.agentsCache[x+"-"+y] === undefined) {
                        this.options.agentsCache[x+"-"+y] = game.getWorld().getAgentsAt(new Location(x,y));
                    }
                    var agents = this.options.agentsCache[x+"-"+y];
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

            this.update = update;
        }

        return AgentsView;
});
