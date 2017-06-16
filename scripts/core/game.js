define([
        './random.js',
        './world/world.js',
    ], function(Generator, World) {
        var WORLD_SEED_LENGTH = 128;

        var Game = function(seed, width, height) {
            var myself = this;
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

            this.toJson = function() {
                return {
                    seed: seed,
                    width: width,
                    height: height,
                    world: world.toJson(),
                    generatorGeneration: generator.getGeneration(),
                };
            }

            this.parseFromJson = function(json) {
                seed = json.seed;
                generator = new Generator(json.seed);
                generator.advanceGeneration(json.generatorGeneration);

                width = json.width;
                height = json.height;

                world = World.parseFromJson(json.world);
            }

            /**
            * This is a promise.
            */
            this.cycle = function() {
                return world.cycle();
            }

            if (!_.isNil(width) && !_.isNil(height)) {
                initializeWorld();
            }
        };

        Game.parseFromJson = function(json) {
            var game = new Game();
            game.parseFromJson(json);
            return game;
        }

        return Game;
});
