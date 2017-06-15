define([
        './random.js',
        './world/world.js',
    ], function(Generator, World) {
        var WORLD_SEED_LENGTH = 128;

        var Game = function(seed, width, height) {
            var myself = this;
            var seed = seed;
            var generator = new Generator(seed);
            var world = null;

            var initializeWorld = function() {
                var worldSeed = '';
                _.times(WORLD_SEED_LENGTH, function() {
                    worldSeed = worldSeed + generator.getChar();
                });

                world = new World(worldSeed, width, height);
            };

            this.getWorld = function() {
                return world;
            }

            this.getWidth = function() {
                return width;
            }

            this.getHeight = function() {
                return height;
            }

            this.initialize = function(progressCallback = _.noop, withBiomes = true) {
                return world.generateWorld(progressCallback, withBiomes)
                .then(() => {
                    return myself;
                });
            }

            /**
            * This is a promise.
            */
            this.cycle = function() {
                return world.cycle();
            }

            initializeWorld();
        };

    return Game;
});
