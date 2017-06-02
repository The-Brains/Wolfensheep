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
            var agents = [];

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

            this.addNewAgent = function(location = null) {
                if (!location) {
                    location = new Location(
                        generator.getInt(0, width),
                        generator.getInt(0, height)
                    );
                }

                var agent = Agent.createNewAgent(generator, location);
                agent.setID(_.size(agents));

                agents.push(agent);
                return agent;
            }

            this.getAgent = function(id) {
                return agents[id];
            }

            this.getAgentQuantity = function() {
                return _.size(agents);
            }

            this.getAllAgents = function() {
                return agents;
            }

            initializeWorld();
        };

        return World;
    }
);
