define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
        './world-status.js',
    ],
    function(_, Generator, Parameters, WorldStatus) {
        var World = function(seed, width, height) {
            this.width = width;
            this.height = height;
            this.world = {};
            this.generator = new Generator(seed);

            this.getWidth = function() {
                return this.width;
            };

            this.getHeight = function() {
                return this.height;
            };

            this.getWorldStatus = function(location) {
                if (location.getX() < 0
                    || location.getY() < 0
                    || location.getX() >= this.width
                    || location.getY() >= this.height
                ) {
                    throw new Error('Location outside of world');
                }

                var key = location.serialize();

                if(!_.has(this.world, key)) {
                    // world piece need to be defined in function of its neighbors.
                    this.world[key] = new WorldStatus(location, this.generator);
                }

                return this.world[key];
            }
        };

        return World;
    }
);
