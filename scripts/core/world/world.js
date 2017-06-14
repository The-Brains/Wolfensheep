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
                var surface = height * width;
                progressCallback(`${extraProgressName} world-filling`, 0, surface);

                _.times(height, function(h) {
                    _.times(width, function(w) {
                        var loc = new Location(w, h);
                        if (param) {
                            setTile(loc, param);
                        } else {
                            myself.getWorldStatus(loc);
                        }

                        progressCallback(`${extraProgressName} world-filling`,
                            h * width + (w + 1), surface);
                    });
                });

                progressCallback(`${extraProgressName} world-filling`, surface, surface);
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
                        var totalSurface = height * width;
                        progressCallback('filling world with a biome', 0, totalSurface);
                        _.times(height, function(h) {
                            _.times(width, function(w) {
                                var loc = new Location(w, h);
                                if (loc.distance(center) <= radius) {
                                    var key = loc.serialize();
                                    tiles[key].setStatus(paramType, paramOption);
                                }
                                progressCallback('filling world with a biome', (h + 1) * width + (w + 1), totalSurface);
                            });
                        });
                        progressCallback('filling world with a biome', totalSurface, totalSurface);
                    };

                    insertParamInWorld(
                        new Location(terrainItem.centerX, terrainItem.centerY),
                        terrainItem.radius,
                        paramType,
                        paramOption,
                        progressCallback,
                    );

                    return Promise.resolve();
                });

            }

            var initializeWorldWithBiomes = function(progressCallback = _.noop) {
                return Promise.resolve()
                .then(() => {
                    var surface = width * height;

                    // default values
                    var param = {};
                    var counter = 0;
                    var totalCounter = _.size(Parameters);
                    var totalPossibleTerrains = 0;
                    progressCallback('setup default tile', 0, 1);
                    _.forEach(Parameters, (paramOptions, paramType) => {
                        param[paramType] = paramOptions[0];
                        counter++;
                        totalPossibleTerrains = totalPossibleTerrains + (_.size(paramOptions) - 1);
                        progressCallback('setup default tile', counter, totalCounter);
                    });
                    progressCallback('setup default tile', totalCounter, totalCounter);

                    initializeWorld(param, progressCallback, 'Filling with default tile');

                    // generate biomes
                    var terrains = {};
                    var counter = 0;
                    var biomesQuantity = 0;
                    progressCallback('creating biomes regions', counter, totalPossibleTerrains);
                    _.forEach(Parameters, (paramOptions, paramType) => {
                        _.forEach(paramOptions, (paramOption, key) => {
                            if(key !== 0) {
                                if (!terrains[paramType]) {
                                    terrains[paramType] = {};
                                }

                                var quantity = generator.getInt(0, 1 + Math.ceil(surface / 1000.0));
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
                                progressCallback('creating biomes regions', counter, totalPossibleTerrains);
                            }
                        });
                    });
                    progressCallback('creating biomes regions', totalPossibleTerrains, totalPossibleTerrains);

                    // draw biomes
                    var workingCopy = _.cloneDeep(terrains);
                    var counter = 0;
                    var startCounter = 0;
                    var finishedCounter = 0;
                    var biomeFillingPromise = [];
                    while(!_.isEmpty(workingCopy)) {
                        var currentParamTypeKey = getRandomKey(generator, workingCopy);

                        var currentParamOptions = workingCopy[currentParamTypeKey];

                        var currentParamOptionKey = getRandomKey(generator, currentParamOptions);
                        var currentParamOption = currentParamOptions[currentParamOptionKey];

                        if (_.isEmpty(currentParamOption.terrains)) {
                            delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                            if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                delete workingCopy[currentParamTypeKey];
                            }
                        } else {
                            var terrainIndex = getRandomKey(
                                generator,
                                currentParamOption.terrains
                            );

                            var terrainItem = _.pullAt(currentParamOption.terrains, [terrainIndex])[0];
                            startCounter++;
                            biomeFillingPromise.push(
                                drawTerrain(
                                    terrainItem,
                                    currentParamTypeKey,
                                    currentParamOptionKey,
                                    progressCallback,
                                    extraTitle
                                )
                            );

                            if (_.isEmpty(workingCopy[currentParamTypeKey][currentParamOptionKey]
                                .terrains)) {
                                delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                                if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                    delete workingCopy[currentParamTypeKey];
                                }
                            }
                        }
                    }

                    return Promise.all(biomeFillingPromise);
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
                    if (withBiomes && false) {
                        return initializeWorldWithBiomes(progressCallback);
                    } else {
                        return Promise.resolve()
                        .then(() => {
                            initializeWorld(null, progressCallback);
                            return Promise.resolve();
                        });
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
