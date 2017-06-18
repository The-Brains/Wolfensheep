define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
        '../../util/array.js',
        '../localization/location.js',
        '../agent/agent.js',
        './world-status.js',
    ],
    function(_, Generator, Parameters, ArrayUtil, Location, Agent, WorldStatus) {
        var World = function(seed, width, height) {
            var myself = this;
            var tiles = ArrayUtil.makeTwoDimensional(width, height);
            var generator = new Generator(seed);
            var agentsByID = {};
            var agentsByLocation = {};
            var agentUpdateCallback = _.noop;
            var tileUpdateCallback = _.noop;
            var agentCounterCallback = _.noop;
            var agentIndex = 0;
            var worldGenerated = false;

            this.getWidth = function() {
                return width;
            };

            this.getHeight = function() {
                return height;
            };

            var setTile = function(location, param) {
                var key = location.serialize();
                tiles[location.getX()][location.getY()] = new WorldStatus(location, `${seed}+${key}`, param);
            }

            var initializeWorld = function(param = null, progressCallback = _.noop,
                    extraProgressName = '')
            {
                return Promise.resolve()
                .then(() => {
                    var surface = height * width;
                    var counter = 0;
                    progressCallback(`${extraProgressName} world-filling`, counter, surface);

                    _.times(height, function(h) {
                        _.times(width, function(w) {
                            var loc = new Location(w, h);
                            if (param) {
                                setTile(loc, param);
                            } else {
                                myself.getWorldStatus(loc);
                            }

                            progressCallback(`${extraProgressName} world-filling`,
                                counter, surface);
                            counter++;
                        });
                    });

                    progressCallback(`${extraProgressName} world-filling`,
                                surface, surface);

                    return Promise.resolve();
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
                    var center = new Location(terrainItem.centerX, terrainItem.centerY);
                    var radius = terrainItem.radius;
                    var totalSurface = height * width;
                    var counter = 0;

                    progressCallback('filling world with a biome', 0, totalSurface);
                    _.times(height, function(h) {
                        _.times(width, function(w) {
                            var loc = new Location(w, h);
                            if (loc.distance(center) <= radius) {
                                tiles[loc.getX()][loc.getY()].setStatus(paramType, paramOption);
                            }

                            counter++;
                            progressCallback('filling world with a biome', counter, totalSurface);
                        });
                    });

                    return Promise.resolve();
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
                        return Promise.resolve()
                        .then(() => {
                            var counter = 0;
                            var totalCounter = _.size(Parameters);
                            progressCallback('setup default tile', 0, 1);
                            _.forEach(Parameters, (paramOptions, paramType) => {
                                defaultParam[paramType] = paramOptions[0];
                                totalPossibleTerrains = totalPossibleTerrains + (_.size(paramOptions) - 1);

                                counter++;
                                progressCallback('setup default tile', counter, totalCounter);
                            });

                            return Promise.resolve();
                        });
                    }

                    return setDefaultLand()
                    .then(() => {
                        return initializeWorld(defaultParam, progressCallback, 'Filling with default tile')
                    })
                    .then(() => {
                        // generate biomes
                        var generateBiomes = function() {
                            return Promise.resolve()
                            .then(() => {
                                var counter = 0;

                                progressCallback('creating biomes regions', counter,
                                    totalPossibleTerrains);

                                _.forEach(Parameters, (paramOptions, paramType) => {
                                    _.forEach(paramOptions, (paramOption, key) => {
                                        if(key !== 0) {
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
                                        }
                                    });
                                });
                            });
                        }

                        return generateBiomes();
                    })
                    .then(() => {
                        var drawBiomes = function() {
                            // draw biomes
                            var workingCopy = _.cloneDeep(terrains);
                            var counter = 0;
                            progressCallback('Painting all biomes',
                                                counter, biomesQuantity);

                            var treatTerrain = function() {
                                return Promise.resolve()
                                .then(() => {
                                    var currentParamTypeKey = getRandomKey(generator, workingCopy);
                                    var currentParamOptions = workingCopy[currentParamTypeKey];
                                    var currentParamOptionKey = getRandomKey(generator, currentParamOptions);
                                    var currentParamOption = currentParamOptions[currentParamOptionKey];

                                    if (_.isEmpty(currentParamOption.terrains)) {
                                        delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                                        if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                            delete workingCopy[currentParamTypeKey];
                                        }

                                        if (counter < biomesQuantity) {
                                            return treatTerrain();
                                        } else {
                                            Promise.resolve();
                                        }
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

                                        return drawTerrain(
                                            terrainItem,
                                            currentParamTypeKey,
                                            currentParamOptionKey,
                                            progressCallback)
                                        .then(() => {
                                            counter++;
                                            progressCallback('Painting all biomes',
                                                counter, biomesQuantity);
                                            if (counter < biomesQuantity) {
                                                return treatTerrain();
                                            } else {
                                                Promise.resolve();
                                            }
                                        });
                                    }
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

                if(_.isNil(tiles[location.getX()][location.getY()])) {
                    // world piece need to be defined in function of its neighbors.
                    var locationSeed = `${seed}+${key}`;
                    tiles[location.getX()][location.getY()] = new WorldStatus(location, locationSeed);
                }

                return tiles[location.getX()][location.getY()];
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

            this.addNewAgent = function(location = null, agent = null, agentID = null) {
                if (!location) {
                    location = new Location(
                        generator.getInt(0, width),
                        generator.getInt(0, height)
                    );
                }

                if (_.isNil(agent)) {
                    agent = Agent.createNewAgent(generator, location);
                }

                agent.setID(agentID ? agentID : agentIndex);
                if (!agentID) {
                    agentIndex++;
                }
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

            this.toJson = function() {
                var tileSerialized =  ArrayUtil.makeTwoDimensional(width, height);
                for(var w = 0 ; w < width ; w ++) {
                    for (var h = 0 ; h < height ; h++ ) {
                        tileSerialized[w][h] = myself.getWorldStatus(new Location(w, h)).toJson();
                    }
                }
                return {
                    seed: seed,
                    width: width,
                    height: height,
                    agentIndex: agentIndex,
                    worldGenerated: worldGenerated,
                    tiles: tileSerialized,
                    generatorGeneration: generator.getGeneration(),
                    agents: _.map(agentsByID, (agent) => {
                        return agent.toJson();
                    }),
                };
            }

            this.parseFromJson = function(json) {
                seed = json.seed;
                generator = new Generator(json.seed);
                generator.advanceGeneration(json.generatorGeneration);

                width = json.width;
                height = json.height;

                tiles = ArrayUtil.makeTwoDimensional(width, height);
                for(var w = 0 ; w < width ; w ++) {
                    for (var h = 0 ; h < height ; h++ ) {
                        tiles[w][h] = WorldStatus.parseFromJson(json.tiles[w][h]);
                    }
                }

                agentsByID = {};
                agentsByLocation = {};

                _.forEach(json.agents, (agentJson) => {
                    var agent = Agent.parseFromJson(agentJson);
                    myself.addNewAgent(agent.getLocation(), agent, agent.getID());
                });

                agentIndex = json.agentIndex;
                worldGenerated = json.worldGenerated;
            }
        };

        World.parseFromJson = function(json) {
            var world = new World();
            world.parseFromJson(json);
            return world;
        }

        return World;
    }
);
