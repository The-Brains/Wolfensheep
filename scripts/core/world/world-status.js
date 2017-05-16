define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
    ],
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

        WorldStatus.allPossibleTerrains = null;
        WorldStatus.getAllPossibleType = function() {
            if (!WorldStatus.allPossibleTerrains) {
                var allKeys = _.keys(Parameters);
                var innerLoop = function(optionIndex, results, current) {
                    var optionKey = allKeys[optionIndex];
                    var vals = Parameters[optionKey];

                    for(var i = 0 ; i < vals.length ; i++) {
                        current[optionKey] = vals[i];

                        if (optionIndex + 1 < allKeys.length) {
                            innerLoop(optionIndex + 1, results, current);
                        } else {
                            var res = JSON.parse(JSON.stringify(current));
                            results.push(res);
                        }
                    }

                    return results;
                };

                var allParamSet = innerLoop(0, [], {});
                return _.map(allParamSet, function(p) {
                    return new WorldStatus(null, null, p);
                });
            }
            return WorldStatus.allPossibleTerrains;
        }

        return WorldStatus;
    }
);
