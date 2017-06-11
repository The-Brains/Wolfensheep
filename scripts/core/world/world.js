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

            this.seed = seed;

            this.getWidth = function() {
                return width;
            };

            this.getHeight = function() {
                return height;
            };

            var initializeRow = function(rowIndex) {
                _.times(width, function(w) {
                    myself.getWorldStatus(new Location(w, rowIndex));
                })
            };

            var initializeWorld = function() {
                _.times(height, function(h) {
                    initializeRow(h);
                })
            };

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
                    newLocation
                        ? new Location(
                            _.round(newLocation.getX()),
                            _.round(newLocation.getY()))
                        : null,
                    oldLocation
                        ? new Location(
                            _.round(oldLocation.getX()),
                            _.round(oldLocation.getY()))
                        : null,
                );
                agentUpdateCallback(agent, newLocation, oldLocation);
            }

            this.removeAgent = function(agent, location) {
                delete agentsByID[agent.getID()];
                myself.updateAgentPerLocation(agent, null, location);
                agentUpdateCallback(agent, null, location);
            }

            this.addNewAgent = function(location = null) {
                if (!location) {
                    location = new Location(
                        generator.getInt(0, width),
                        generator.getInt(0, height)
                    );
                }

                var agent = Agent.createNewAgent(generator, location);
                agent.setID(_.size(agentsByID));
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

            this.cycle = function() {
                _.forEach(agentsByID, (agent) => {
                    agent.cycle(null, true);
                });
            }

            initializeWorld();
        };

        return World;
    }
);
