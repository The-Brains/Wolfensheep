define(
    [
        'chai',
        'lodash',
        'testWrapper',
        '../core/world/world.js',
        '../core/localization/location.js',
    ],
    function(chai, _, testWrapper, World, Location) {
        var expect = chai.expect;
        var mainName = 'core-world-world';

        testWrapper.execTest(mainName, 'should generate all tiles', function() {
            var world = new World('cool seed', 20, 20);
            expect(_.size(world.getAllTiles())).to.equal(20 * 20);
        });

        testWrapper.execTest(mainName, 'should generate parameters', function() {
            var world = new World('cool seed', 20, 20);
            var env = world.getWorldStatus(new Location(5, 5)).getParameters();
            expect(env).to.have.property('humidity');
            expect(env).to.have.property('temperature');
            expect(env).to.have.property('ground');
            expect(env).to.have.property('wind');
            expect(env).to.have.property('cloud');
        });

        testWrapper.execTest(mainName, 'should serialize', function() {
            var world = new World('cool seed', 20, 20);
            var env = world.getWorldStatus(new Location(5, 5));

            expect(env.serialize()).to.be
                .equal('{"humidity":"humid","temperature":"hot","ground":"rock","wind":"quiet","cloud":"overcast"}');
        });

        testWrapper.execTest(mainName, 'should add agents', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated = world.addNewAgent();
            expect(agentCreated.getID()).to.equal(0);
            var agentFetched = world.getAgent(0);
            expect(agentFetched.serialize()).to.equal(agentCreated.serialize());
        });

        testWrapper.execTest(mainName, 'should add several agents', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated1 = world.addNewAgent();
            expect(agentCreated1.getID()).to.equal(0);

            var agentCreated2 = world.addNewAgent();
            expect(agentCreated2.getID()).to.equal(1);
        });

        testWrapper.execTest(mainName, 'should fetch agent with location', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated1 = world.addNewAgent();
            expect(agentCreated1.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated1.getLocation())[0].getID()).to.equal(0);

            var agentCreated2 = world.addNewAgent();
            expect(agentCreated2.getID()).to.equal(1);
            expect(world.getAgentsAt(agentCreated2.getLocation())[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());
        });

        testWrapper.execTest(mainName, 'should fetch agent with location after moving', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated2 = world.addNewAgent();
            expect(agentCreated2.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated2.getLocation())[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());

            var oldLoc = agentCreated2.getLocation();
            var loc = new Location(1, 1);
            return agentCreated2.cycle(loc)
            .then(() => {
                expect(_.size(world.getAgentsAt(loc))).to.equal(1);
                expect(world.getAgentsAt(loc)[agentCreated2.getID()].getID())
                    .to.equal(agentCreated2.getID());
                expect(_.size(world.getAgentsAt(oldLoc))).to.equal(0);
            });
        });

        testWrapper.execTest(mainName, 'should fetch agent with location after moving with float location', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated2 = world.addNewAgent();
            expect(agentCreated2.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated2.getLocation())[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());

            var oldLoc = agentCreated2.getLocation();
            var loc = new Location(1.34, 1.12);
            return agentCreated2.cycle(loc)
            .then(() => {
                expect(_.size(world.getAgentsAt(loc))).to.equal(1);
                expect(_.size(world.getAgentsAt(new Location(1, 1)))).to.equal(1);
                expect(world.getAgentsAt(loc)[agentCreated2.getID()].getID())
                    .to.equal(agentCreated2.getID());
                expect(_.size(world.getAgentsAt(oldLoc))).to.equal(0);
            });
        });

        testWrapper.execTest(mainName, 'should remove agent when they die', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated1 = world.addNewAgent();
            expect(agentCreated1.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated1.getLocation())[0].getID()).to.equal(0);

            agentCreated1.kill('test');
            expect(_.size(world.getAgentsAt(agentCreated1.getLocation()))).to.equal(0);
            expect(_.size(world.getAllAgents())).to.equal(0);
        });

        testWrapper.execTest(mainName, 'should call callback when agent create', function() {
            var world = new World('cool seed', 20, 20);

            var birthLocation = new Location(5, 5);
            world.setAgentCallback(function(agent, newLocation, oldLocation) {
                expect(agent.getID()).to.equal(0);
                expect(oldLocation).to.not.exists;
                expect(newLocation.serialize()).to.equal(birthLocation.serialize());
            });
            var agentCreated = world.addNewAgent(birthLocation);
        });

        testWrapper.execTest(mainName, 'should call callback when agent move', function() {
            var world = new World('cool seed', 20, 20);

            var birthLocation = new Location(5, 5);
            var agentCreated = world.addNewAgent(birthLocation);

            var moveLocation = new Location(10, 10);
            world.setAgentCallback(function(agent, newLocation, oldLocation) {
                expect(agent.getID()).to.equal(0);
                expect(oldLocation.serialize()).to.equal(birthLocation.serialize());
                expect(newLocation.serialize()).to.equal(moveLocation.serialize());
            });
            return agentCreated.cycle(moveLocation);
        });

        testWrapper.execTest(mainName, 'should call callback when agent die', function() {
            var world = new World('cool seed', 20, 20);

            var birthLocation = new Location(5, 5);
            var agentCreated = world.addNewAgent(birthLocation);

            world.setAgentCallback(function(agent, newLocation, oldLocation) {
                expect(agent.getID()).to.equal(0);
                expect(oldLocation.serialize()).to.equal(birthLocation.serialize());
                expect(newLocation).to.not.exists;
            });
            agentCreated.kill('test');
        });

        testWrapper.execTest(mainName, 'should return agent sorted per distance', function() {
            var world = new World('cool seed', 20, 20);

            var birthLocation1 = new Location(0, 0);
            var agentCreated1 = world.addNewAgent(birthLocation1);

            var birthLocation2 = new Location(5, 5);
            var agentCreated2 = world.addNewAgent(birthLocation2);

            var birthLocation3 = new Location(0, 10);
            var agentCreated3 = world.addNewAgent(birthLocation3);

            var birthLocation4 = new Location(10, 0);
            var agentCreated4 = world.addNewAgent(birthLocation4);

            return world.getClosestAgents(agentCreated1)
            .then((agents) => {
                expect(_.size(agents)).to.equal(3);
                expect(agents[0].location.serialize()).to.equal(birthLocation2.serialize());
                expect(agents[1].distance).to.equal(10);
                expect(agents[2].distance).to.equal(10);
            });
        });

        testWrapper.execTest(mainName, 'should return agent at location after cycle(null,true)', function() {
            var world = new World('cool seed', 20, 20);
            var agent = world.addNewAgent();

            return agent.cycle(null, true).then(() => {
                expect(_.size(world.getAgentsAt(agent.getLocation()))).to.equal(1);
            });
        });

        testWrapper.execTest(mainName, 'should not find agents any other place after cycle(null,true)', function() {
            var world = new World('cool seed', 20, 20);
            var agent = world.addNewAgent();

            return agent.cycle(null, true).then(() => {
                var loc = agent.getLocation();
                for(var y=0;y<20;y++) {
                    for(var x=0;x<20;x++) {
                        if(x!==loc.getRoundedX() || y!==loc.getRoundedY()) {
                            expect(_.size(world.getAgentsAt(new Location(x,y)))).to.equal(0);
                        }
                    }
                }
            });
        });
    }
);
