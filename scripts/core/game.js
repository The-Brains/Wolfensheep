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
                    worldSeed = worldSeed + generator.getChar(
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_=+~;:"<>,./?|'
                    );
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

            this.cycle = function() {
                world.cycle();
            }

            initializeWorld();
        };

    return Game;
});
