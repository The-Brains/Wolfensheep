define(
    ['lodash', '../random.js', '../../util/world-parameters.js'],
    function(_, Generator, Parameters) {
        var WorldStatus = function(location, generator, parameters) {
            var myself = this;
            this.location = location;
            this.generator = generator;

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
        };

        return WorldStatus;
    }
);
