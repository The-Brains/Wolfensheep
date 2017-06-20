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

            var setTile = function(x, y, param) {
                tiles[x][y] = new WorldStatus(new Location(x, y), `${seed}+${x}-${y}`, param);
            }

            var initializeWorld = function(param, progressCallback = _.noop,
                    extraProgressName = '') {
                var surface = height * width;
                var counter = 0;

                progressCallback(`${extraProgressName} world-filling`, counter, surface);
                for(var h = height - 1 ; h >= 0 ; h--) {
                    for(var w = width - 1 ; w >= 0 ; w--) {
                        setTile(w, h, param);

                        progressCallback(`${extraProgressName} world-filling`, counter, surface);
                        counter++;
                    };
                };
                progressCallback(`${extraProgressName} world-filling`, surface, surface);
            };

            var addTileOption = function(parameterName, parameterOption, center, radius,
                    progressCallback = _.noop) {
                var startHeight = center.getY() - radius;
                var endHeight = center.getY() + radius;

                var startWidth = center.getX() - radius;
                var endWidth = center.getX() + radius;

                var radiusSquared = radius * radius;

                var centerX = center.getX();
                var centerY = center.getY();

                var surface = (endHeight - startHeight) * (endWidth - startWidth);
                var counter = 0;

                progressCallback('Add option from one biome', counter, surface);
                for(var h = endHeight ; h >= startHeight ; h--) {
                    var yy = centerY - h;
                    yy = yy * yy;
                    for(var w = endWidth ; w >= startWidth ; w--) {
                        var xx = centerX - w;
                        xx = xx * xx;
                        if (xx + yy <= radiusSquared) {
                            tiles[w][h].addStatusOption(parameterName, parameterOption);
                        }

                        counter++;
                        progressCallback('Add option from one biome', counter, surface);
                    }
                }
                progressCallback('Add option from one biome', surface, surface);
            }

            var drawBiomes = function(terrains, progressCallback = _.noop) {
                var totalTerrainsQuantity = _.size(terrains);
                var counter = 0;

                progressCallback('Draw all biomes options', counter, totalTerrainsQuantity);
                for(var t = terrains.length - 1 ; t >= 0 ; t--) {
                    var terrain = terrains[t];
                    addTileOption(
                        terrain.parameterName,
                        terrain.parameterOption,
                        terrain.center,
                        terrain.radius,
                        progressCallback);

                    counter++;
                    progressCallback('Draw all biomes options', counter, totalTerrainsQuantity);
                }

                progressCallback('Draw all biomes options', totalTerrainsQuantity, totalTerrainsQuantity);
            }

            var consolidateTiles = function(progressCallback = _.noop) {
                var surface = height * width;
                var counter = 0;
                progressCallback(`Consolidate tiles`, counter, surface);

                for(var w = width - 1 ; w>=0 ; w--) {
                    var column = tiles[w];
                    for(var h = height - 1 ; h>=0 ; h--) {
                        column[h].consolidate(generator);
                        counter++;
                        progressCallback(`Consolidate tiles`, counter, surface);
                    }
                }
                progressCallback(`Consolidate tiles`, surface, surface);
            }

            var generateBiomeWorld = function(progressCallback = _.noop) {
                var defaultParam = {};
                var totalPossibleTerrains = 0;
                var biomesQuantity = 0;

                var surface = width * height;

                var counter = 0;
                var totalCounter = _.size(Parameters);
                progressCallback('setup default tile', 0, 1);
                _.forEach(Parameters, (paramOptions, paramType) => {
                    defaultParam[paramType] = paramOptions[0];
                    totalPossibleTerrains = totalPossibleTerrains + (_.size(paramOptions) - 1);

                    counter++;
                    progressCallback('setup default tile', counter, totalCounter);
                });

                initializeWorld(defaultParam, progressCallback, 'Filling with default tile');

                var counter = 0;
                progressCallback('creating biomes regions', counter,
                    totalPossibleTerrains);

                var minDimension = Math.min(width, height);
                var maxRadius = 1 + Math.ceil(minDimension / 10.0);
                var maxQuantity = 1 + Math.ceil(surface / 800.0 + 1000.0 / surface);
                var allBiomes = [];

                _.forEach(Parameters, (paramOptions, paramType) => {
                    _.forEach(paramOptions, (paramOption, key) => {
                        if(key !== 0) {
                            var quantity = generator.getInt(1, maxQuantity);

                            _.times(quantity, () => {
                                var radius = generator.getInt(1, maxRadius);
                                var item = {
                                    center: new Location(
                                        generator.getInt(radius, width - radius),
                                        generator.getInt(radius, height - radius)
                                    ),
                                    radius: radius,
                                    parameterName: paramType,
                                    parameterOption: paramOption,
                                };

                                allBiomes.push(item);
                            });

                            biomesQuantity = biomesQuantity + quantity;

                            counter++;
                            progressCallback('creating biomes regions', counter,
                                totalPossibleTerrains);
                        }
                    });
                });

                drawBiomes(allBiomes, progressCallback);
                consolidateTiles(progressCallback);
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

                var promises = [];
                generator.shuffledForEach(agentsByID, (agent, id) => {
                    promises.push(agent.cycle(null, true));
                });

                return Promise.all(promises);
            }

            this.generateWorld = function(progressCallback = _.noop) {
                return Promise.resolve()
                .then(() => {
                    generateBiomeWorld(progressCallback);
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
