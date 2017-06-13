define([
        'lodash',
        '../random.js',
        '../../util/world-parameters.js',
        '../localization/location.js',
        '../agent/agent.js',
        './world-status.js',
        '../../util/find-get-param.js',
    ],
    function(_, Generator, Parameters, Location, Agent, WorldStatus, FindGetParam) {
        var World = function(seed, width, height) {
            var myself = this;
            var tiles = {};
            var generator = new Generator(seed);
            var agentsByID = {};
            var agentsByLocation = {};
            var agentUpdateCallback = _.noop;
            var tileUpdateCallback = _.noop;
            var agentIndex = 0;

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

            var initializeRow = function(rowIndex, param = null) {
                _.times(width, function(w) {
                    var loc = new Location(w, rowIndex);
                    if (param) {
                        setTile(loc, param);
                    } else {
                        myself.getWorldStatus(loc);
                    }
                });
            };

            var initializeWorld = function(param = null) {
                _.times(height, function(h) {
                    initializeRow(h, param);
                });
            };

            var getRandomKey = function(generator, object) {
                var keys = _.keys(object);
                var index = generator.getInt(0, _.size(keys));
                return keys[index];
            }

            var drawTerrain = function(terrainItem, paramType, paramOption) {
                var insertParamInWorld = (center, radius, paramType, paramOption) => {
                    _.times(height, function(h) {
                        _.times(width, function(w) {
                            var loc = new Location(w, h);
                            if (loc.distance(center) <= radius) {
                                var key = loc.serialize();
                                tiles[key].setStatus(paramType, paramOption);
                            }
                        });
                    });
                };

                insertParamInWorld(
                    new Location(terrainItem.centerX, terrainItem.centerY),
                    terrainItem.radius,
                    paramType,
                    paramOption
                );
            }

            var initializeWorldWithBiomes = function() {
                var surface = width * height;

                // default values
                var param = {};
                _.forEach(Parameters, (paramOptions, paramType) => {
                    param[paramType] = paramOptions[0];
                });
                initializeWorld(param);

                // generate biomes
                var terrains = {};
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
                        }
                    });
                });

                // draw biomes
                var workingCopy = _.cloneDeep(terrains);
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
                        drawTerrain(terrainItem, currentParamTypeKey, currentParamOptionKey);

                        if (_.isEmpty(workingCopy[currentParamTypeKey][currentParamOptionKey]
                            .terrains)) {
                            delete workingCopy[currentParamTypeKey][currentParamOptionKey];
                            if (_.isEmpty(workingCopy[currentParamTypeKey])) {
                                delete workingCopy[currentParamTypeKey];
                            }
                        }
                    }
                }
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
            }

            this.removeAgent = function(agent, location) {
                delete agentsByID[agent.getID()];
                myself.updateAgentPerLocation(agent, null, location);
                agentUpdateCallback(agent, null, location);
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
                agentUpdateCallback(agent, agent.getLocation(), null);

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

            this.getClosestAgents = function(mainAgent, radius = null, limit = null) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
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
                        return resolve(sortedAgent);
                    });
                });
            }

            this.cycle = function() {
                return Promise.all(_.map(_.shuffle(agentsByID), (agent) => {
                    return agent.cycle(null, true);
                }));
            }

            if (FindGetParam('with-biomes')) {
                initializeWorldWithBiomes();
            } else {
                initializeWorld();
            }
        };

        return World;
    }
);
