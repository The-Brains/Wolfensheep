define(
    ['lodash', '../random.js', '../../util/world-parameters.js'],
    function(_, Generator, Parameters) {
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

                var key = location.getX() + '-' + location.getY();

                if(!_.has(this.world, key)) {
                    var myself = this;
                    var param = {};
                    _.each(Parameters, function(p, key) {
                        param[key] = p[myself.generator.getInt(0, p.length)];
                    });
                    this.world[key] = param;
                }

                return this.world[key];
            }
        };

        return World;
    }
);
