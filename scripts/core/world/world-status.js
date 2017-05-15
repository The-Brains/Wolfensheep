define(
    ['lodash', '../random.js', '../../util/world-parameters.js'],
    function(_, Generator, Parameters) {
        var WorldStatus = function(location, locationSeed, parameters) {
            var myself = this;
            this.location = location;
            this.generator = new Generator(locationSeed);
            this.serialized = null;

            this.status = {};
            if (parameters) {
                _.forEach(Parameters, function(p, key) {
                    myself.status[key] = parameters[key];
                });
            } else {
                _.each(Parameters, function(p, key) {
                    myself.status[key] = p[myself.generator.getInt(0, p.length)];
                });
            }

            this.getParameter = function(parameterKey) {
                return this.status[parameterKey];
            };

            this.getLocation = function() {
                return this.location;
            };

            this.getParameters = function() {
                return this.status;
            };

            this.allowedNeighbors = function() {
                // TODO: Generate a list of possible WorldStatus combination
                // the goal is to create "biomes"
            }

            this.serialize = function() {
                if (!this.serialized) {
                    var result = '';
                    _.forEach(this.status, function(value, key) {
                        result += `${key}:${value},`;
                    });
                    this.serialized = result;
                }

                return this.serialized;
            }
        };

        WorldStatus.getAllPossibleType = function() {
            // TODO
            // var possibility = [];

            // _.each(Parameters, function(p, key) {
            //     var parameters = {};

            //     myself.status[key] = p[myself.generator.getInt(0, p.length)];
            // });

            // Placehold to unlock the rest of the code.
            return [
                new WorldStatus(null, null, {
                    humidity: 'dry',
                    temperature: 'hot',
                    ground: 'sand',
                    wind: 'quiet',
                    cloud: 'overcast',
                }),
                new WorldStatus(null, null, {
                    humidity: 'humid',
                    temperature: 'freezing',
                    ground: 'rock',
                    wind: 'stormy',
                    cloud: 'rainy',
                })
            ]
        }

        return WorldStatus;
    }
);
