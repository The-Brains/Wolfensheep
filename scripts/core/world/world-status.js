define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
        '../localization/location.js',
    ],
    function(_, Generator, Parameters, Location) {
        var WorldStatus = function(location, locationSeed, parameters) {
            var location = location;
            var generator = new Generator(locationSeed);
            var serialized = null;

            var status = {};
            if (parameters) {
                _.forEach(Parameters, function(p, key) {
                    status[key] = parameters[key];
                });
            } else {
                _.each(Parameters, function(p, key) {
                    status[key] = p[generator.getInt(0, p.length)];
                });
            }

            this.getParameter = function(parameterKey) {
                return status[parameterKey];
            };

            this.getLocation = function() {
                return location;
            };

            this.getParameters = function() {
                return status;
            };

            this.allowedNeighbors = function() {
                // TODO: Generate a list of possible WorldStatus combination
                // the goal is to create "biomes"
            }

            this.toJson = function() {
                return {
                    location: location.toJson(),
                    seed: locationSeed,
                    status: status,
                    generatorGeneration: generator.getGeneration(),
                }
            }

            this.setGeneratorGeneration = function(step) {
                generator.advanceGeneration(step);
            }

            this.serialize = function() {
                return JSON.stringify(this.toJson());
            }

            this.setStatus = function(paramType, newParam) {
                status[paramType] = newParam;
            }

            this.consolidate = function(overridGenerator = null) {
                var statusCopy = _.cloneDeep(status);

                _.forEach(statusCopy, (paramOption, paramType) => {
                    if(_.isArray(paramOption)) {
                        status[paramType] = overridGenerator
                            ? overridGenerator.anyFrom(paramOption)
                            : generator.anyFrom(paramOption);
                    }
                });
            }

            this.addStatusOption = function(paramType, extraParam) {
                if (!_.isArray(status[paramType])) {
                    status[paramType] = [extraParam];
                } else {
                    status[paramType] = _.concat(status[paramType], extraParam);
                }
            }
        };

        WorldStatus.parseFromJson = function(json) {
            var worldStatus = new WorldStatus(
                Location.parseFromJson(json.location),
                json.seed,
                json.status
            );
            worldStatus.setGeneratorGeneration(json.generatorGeneration);

            return worldStatus;
        }

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
                WorldStatus.allPossibleTerrains = _.map(allParamSet, function(p) {
                    return new WorldStatus(null, null, p);
                });
            }
            return WorldStatus.allPossibleTerrains;
        }

        return WorldStatus;
    }
);
