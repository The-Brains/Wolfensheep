define([
        'threejs',
        'dobuki',
        './imagestore.js',
    ],
    function(THREE, DOK, ImageStore) {
        var AgentsView = function (cameraHandler, spriteRenderer, cellSize, game) {
            var worldWidth = game.getWidth();
            var worldHeight = game.getHeight();

            var collection = new DOK.Collection(
                {
                    agents: null,
                },
                function (agent) {
                    var img = ImageStore.getImageFromAgent(agent);
                    var x = agent.getLocation().getX();
                    var y = agent.getLocation().getY();

                    var spriteObj = DOK.SpriteObject.create().init(
                        x * cellSize, y * cellSize, cellSize,
                        cellSize*3, cellSize*3,
                        null,
                        1,
                        img
                    );
                    spriteObj.type = 'face';
                    return spriteObj;
                },
                function (callback) {
                    var agents = this.options.agents;
                    if (agents) {
                        for (var i=0; i<agents.length; i++) {
                            var sprite = this.getSprite(agents[i]);
                            callback(sprite);
                        }
                    }
                }
            );

            function update() {
                collection.options.agents = game.getWorld().getAllAgents();
                collection.forEach(spriteRenderer.display);
            }

            this.update = update;
        }

        return AgentsView;
});