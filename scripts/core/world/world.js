define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
        '../localization/location.js',
        '../agent/agent.js',
        './world-status.js',
    ],
    function(_, Generator, Parameters, Location, Agent, WorldStatus) {
        var World = function(seed, width, height) {
            var myself = this;
            var tiles = {};
            var generator = new Generator(seed);
            var agentsByID = {};
            var agentsByLocation = {};
            var agentUpdateCallback = _.noop;
            var tileUpdateCallback = _.noop;
            var agentCounterCallback = _.noop;
            var agentIndex = 0;
            var worldGenerated = false;

            this.seed = seed;

            this.getWidth = function() {
                return width;
            };

            this.getHeight = function() {
                return height;
            };

            var setTile = function(location, param) {
                var key = location.serialize();
                tiles[key] = new WorldStatus(location, `${seed}+${key}`, param);
            }

            var initializeWorld = function(param = null, progressCallback = _.noop,
                    extraProgressName = '')
            {
                return new Promise((resolve, reject) => {
                    var surface = height * width;
                    progressCallback(`${extraProgressName} world-filling`, 0, surface);
                    var counter = 0;

                    _.times(height, function(h) {
                        _.times(width, function(w) {
                            setTimeout(() => {
                                var loc = new Location(w, h);
                                if (param) {
                                    setTile(loc, param);
                                } else {
                                    myself.getWorldStatus(loc);
                                }

                                progressCallback(`${extraProgressName} world-filling`,
                                    counter, surface);
                                counter++;
                            }, 10);
                        });
                    });

                    var isItDone = function() {
                        setTimeout(() => {
                            if (counter < surface) {
                                isItDone();
                            }
                            progressCallback(`${extraProgressName} world-filling`, surface, surface);
                            resolve();
                        }, 10);
                    }

                    isItDone();
                });
            };

            var getRandomKey = function(generator, object) {
                var keys = _.keys(object);
                var index = generator.getInt(0, _.size(keys));
                return keys[index];
            }

            var drawTerrain = function(terrainItem, paramType, paramOption, progressCallback = _.noop) {
                return Promise.resolve()
                .then(() => {
                    var insertParamInWorld = (center, radius, paramType, paramOption, progressCallback = _.noop) => {
                        return new Promise((resolve, reject) => {
                            var totalSurface = height * width;
                            var counter = 0;
                            progressCallback('filling world with a biome', 0, totalSurface);
                            _.times(height, function(h) {
                                _.times(width, function(w) {
                                    setTimeout(() => {
                                        var loc = new Location(w, h);
                                        if (loc.distance(center) <= radius) {
                                            var key = loc.serialize();
                                            tiles[key].setStatus(paramType, paramOption);
                                        }

                                        counter++;
                                        progressCallback('filling world with a biome', counter, totalSurface);
                                    });
                                });
                            });

                            var isItDone = function() {
                                setTimeout(() => {
                                    if (counter < totalSurface) {
                                        isItDone();
                                    }

                                    progressCallback('filling world with a biome', totalSurface, totalSurface);

                                    resolve();
                                }, 10);
                            }

                            isItDone();
                        });
                    };

                    return insertParamInWorld(
                        new Location(terrainItem.centerX, terrainItem.centerY),
                        terrainItem.radius,
                        paramType,
                        paramOption,
                        progressCallback,
                    );
                });

            }

            var initializeWorldWithBiomes = function(progressCallback = _.noop) {
                var defaultParam = {};
                var totalPossibleTerrains = 0;
                var terrains = {};
                var biomesQuantity = 0;

                return Promise.resolve()
                .then(() => {
                    var surface = width * height;

                    // default values
                    var setDefaultLand = function() {
                        return new Promise((resolve, reject) => {
                            var counter = 0;
                            var totalCounter = _.size(Parameters);
                            progressCallback('setup default tile', 0, 1);
                            _.forEach(Parameters, (paramOptions, paramType) => {
                                setTimeout(() => {
                                    defaultParam[paramType] = paramOptions[0];
                                    totalPossibleTerrains = totalPossibleTerrains + (_.size(paramOptions) - 1);

                                    counter++;
                                    progressCallback('setup default tile', counter, totalCounter);
                                }, 1)
                            });

                            var isItDone = function() {
                                setTimeout(() => {
                                    if (counter < totalCounter) {
                                        isItDone();
                                    }
                                    progressCallback('setup default tile', totalCounter, totalCounter);
                                    resolve();
                                }, 10);
                            }

                            isItDone();
                        });
                    }

                    return setDefaultLand()
                    .then(() => {
                        return initializeWorld(defaultParam, progressCallback, 'Filling with default tile')
                    })
                    .then(() => {
                        // generate biomes
                        var generateBiomes = function() {
                            return new Promise((resolve, reject) => {
                                var counter = 0;

                                progressCallback('creating biomes regions', counter,
                                    totalPossibleTerrains);

                                _.forEach(Parameters, (paramOptions, paramType) => {
                                    _.forEach(paramOptions, (paramOption, key) => {
                                        if(key !== 0) {
                                            setTimeout(() => {
                                                if (!terrains[paramType]) {
                                                    terrains[paramType] = {};
                                                }

                                                var quantity = generator.getInt(0, 1 +
                                                    Math.ceil(surface / 1000.0));
                                                terrains[paramType][paramOption] = {
                                                    quantity: quantity,
                                                    terrains: [],
                                                };

                                                _.times(quantity, () => {
                                                    var item = {
                                                        centerX: generator.getInt(0, width),
                                                        centerY: generator.getInt(0, height),
                                                        radius: generator.getInt(1, Math.ceil(surface / 500)),
                                                    };
                                                    terrains[paramType][paramOption].terrains.push(item);
                                                });

                                                biomesQuantity = biomesQuantity + quantity;

                                                counter++;
                                                progressCallback('creating biomes regions', counter,
                                                    totalPossibleTerrains);
                                            }, 1);
                                        }
                                    });
                                });

                                var isItDone = function() {
                                    setTimeout(() => {
                                        if (counter < totalPossibleTerrains) {
                                            isItDone();
                                        }
                                        progressCallback('creating biomes regions',
                                            totalPossibleTerrains, totalPossibleTerrains);
                                        resolve();
                                    }, 10);
                                }

                                isItDone();
                            });
                        }

                        return generateBiomes();
                    })
                    .then(() => {
                        var drawBiomes = function() {
                            // draw biomes
                            var workingCopy = _.cloneDeep(terrains);
                            var counter = 0;
                            var startCounter = 0;
                            var finishedCounter = 0;
                            var biomeFillingPromise = [];

                            var treatTerrain = function() {
                                progressCallback('Painting all biomes',
                                    counter, biomesQuantity);
                                return Promise.resolve()
                                .then(() => {
                                    return new Promise((resolve, reject) => {
                                        setTimeout(() => {
                                            var currentParamTypeKey = getRandomKey(generator, workingCopy);

                                            var currentParamOptions = workingCopy[currentParamTypeKey];

                                            var currentParamOptionKey = getRandomKey(generator, currentParamOptions);
                                            var currentParamOption = currentParamOptions[currentParamOptionKey];

                                            if (_.isEmpty(currentParamOption.terrains)) {
                                                delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                                                if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                                    delete workingCopy[currentParamTypeKey];
                                                }
                                                resolve();
                                            } else {
                                                var terrainIndex = getRandomKey(
                                                    generator,
                                                    currentParamOption.terrains
                                                );

                                                var terrainItem = _.pullAt(currentParamOption.terrains, [terrainIndex])[0];

                                                if (_.isEmpty(workingCopy[currentParamTypeKey][currentParamOptionKey]
                                                    .terrains)) {
                                                    delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                                                    if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                                        delete workingCopy[currentParamTypeKey];
                                                    }
                                                }

                                                startCounter++;

                                                drawTerrain(
                                                    terrainItem,
                                                    currentParamTypeKey,
                                                    currentParamOptionKey,
                                                    progressCallback)
                                                .then(() => {
                                                    counter++;
                                                    progressCallback('Painting all biomes',
                                                        counter, biomesQuantity);
                                                    resolve();
                                                });
                                            }
                                        }, 1);
                                    });
                                })
                                .then(() => {
                                    if (counter < biomesQuantity) {
                                        return treatTerrain();
                                    }
                                    return Promise.resolve();
                                });
                            }

                            return treatTerrain();
                        }

                        return drawBiomes();
                    });
                });
            }

            this.getWorldStatus = function(location) {
                if (location.getX() < 0
                    || location.getY() < 0
                    || location.getX() >= width
                    || location.getY() >= height
                ) {
                    throw new Error('Location outside of world');
                }

                var key = location.serialize();

                if(!_.has(tiles, key)) {
                    // world piece need to be defined in function of its neighbors.
                    var locationSeed = `${seed}+${key}`;
                    tiles[key] = new WorldStatus(location, locationSeed);
                }

                return tiles[key];
            };

            this.getAllTiles = function() {
                return tiles;
            }

            var subUpdateAgentPerLocation = function(agent, newLocation, oldLocation) {
                if (oldLocation && agentsByLocation[oldLocation.serialize()]) {
                    delete agentsByLocation[oldLocation.serialize()][agent.getID()];
                    if (_.size(agentsByLocation[oldLocation.serialize()]) === 0) {
                        delete agentsByLocation[oldLocation.serialize()];
                    }
                }

                if (newLocation) {
                    if (!agentsByLocation[newLocation.serialize()]) {
                        agentsByLocation[newLocation.serialize()] = {};
                    }
                    agentsByLocation[newLocation.serialize()][agent.getID()] = agent;
                }
            }

            this.updateAgentPerLocation = function(agent, newLocation, oldLocation = null) {
                subUpdateAgentPerLocation(agent, newLocation, oldLocation);
                subUpdateAgentPerLocation(
                    agent,
                    newLocation ? newLocation.getRoundedLocation() : null,
                    oldLocation ? oldLocation.getRoundedLocation() : null,
                );
                agentUpdateCallback(agent, newLocation, oldLocation);
                agentCounterCallback(this.getAgentQuantity());
            }

            this.removeAgent = function(agent, location) {
                delete agentsByID[agent.getID()];
                myself.updateAgentPerLocation(agent, null, location);
            }

            this.addNewAgent = function(location = null, agent = null) {
                if (!location) {
                    location = new Location(
                        generator.getInt(0, width),
                        generator.getInt(0, height)
                    );
                }

                if (_.isNil(agent)) {
                    agent = Agent.createNewAgent(generator, location);
                }

                agent.setID(agentIndex);
                agentIndex++;
                agent.setWorld(myself);

                agentsByID[agent.getID()] = agent;
                myself.updateAgentPerLocation(agent, agent.getLocation());

                return agent;
            }

            this.getAgent = function(id) {
                return agentsByID[id];
            }

            this.getAgentQuantity = function() {
                return _.size(agentsByID);
            }

            this.getAllAgents = function() {
                return _.map(agentsByID, function(agent) {
                    return agent;
                });
            }

            this.getAgentsAt = function(location) {
                return agentsByLocation[location.serialize()]
                    ? agentsByLocation[location.serialize()]
                    : {};
            }

            this.setAgentCallback = function(cb) {
                agentUpdateCallback = cb;
            }

            this.setTileCallback = function(cb) {
                tileUpdateCallback = cb;
            }

            this.setAgentCounterCallback = function(cb) {
                agentCounterCallback = cb;
            }

            this.getClosestAgents = function(mainAgent, radius = null, limit = null) {
                return Promise.resolve()
                .then(() => {
                    var center = mainAgent.getLocation();
                        var sortedAgent = _.map(agentsByID, (agent, id) => {
                            var location = agent.getLocation();
                            var distance = center.distance(location);
                            if (!_.isNil(radius) && distance > radius || id == mainAgent.getID()) {
                                return null;
                            }
                            return {
                                agent: agent,
                                distance: distance,
                                location: location,
                            };
                        });
                        sortedAgent = _.compact(sortedAgent);
                        sortedAgent = _.sortBy(sortedAgent, ['distance']);
                        if (!_.isNil(limit)) {
                            sortedAgent = _.take(sortedAgent, limit);
                        }
                        return Promise.resolve(sortedAgent);
                });
            }

            this.cycle = function() {
                if (!worldGenerated) {
                    return Promise.reject('the world needs to be generated !');
                }
                return Promise.all(_.map(_.shuffle(agentsByID), (agent) => {
                    return agent.cycle(null, true);
                }));
            }

            this.generateWorld = function(progressCallback = _.noop, withBiomes = true) {
                return Promise.resolve()
                .then(() => {
                    if (withBiomes) {
                        return initializeWorldWithBiomes(progressCallback);
                    } else {
                        return initializeWorld(null, progressCallback);
                    }
                })
                .then(() => {
                    worldGenerated = true;
                    return Promise.resolve();
                });
            }
        };

        return World;
    }
);
