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
                .equal('{"humidity":"humid","temperature":"warm","ground":"rock","wind":"quiet","cloud":"clear"}');
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
            agentCreated2.cycle(loc);

            expect(_.size(world.getAgentsAt(loc))).to.equal(1);
            expect(world.getAgentsAt(loc)[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());
            expect(_.size(world.getAgentsAt(oldLoc))).to.equal(0);
        });

        testWrapper.execTest(mainName, 'should fetch agent with location after moving with float location', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated2 = world.addNewAgent();
            expect(agentCreated2.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated2.getLocation())[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());

            var oldLoc = agentCreated2.getLocation();
            var loc = new Location(1.34, 1.12);
            agentCreated2.cycle(loc);

            expect(_.size(world.getAgentsAt(loc))).to.equal(1);
            expect(_.size(world.getAgentsAt(new Location(1, 1)))).to.equal(1);
            expect(world.getAgentsAt(loc)[agentCreated2.getID()].getID())
                .to.equal(agentCreated2.getID());
            expect(_.size(world.getAgentsAt(oldLoc))).to.equal(0);
        });

        testWrapper.execTest(mainName, 'should remove agent when they die', function() {
            var world = new World('cool seed', 20, 20);

            var agentCreated1 = world.addNewAgent();
            expect(agentCreated1.getID()).to.equal(0);
            expect(world.getAgentsAt(agentCreated1.getLocation())[0].getID()).to.equal(0);

            agentCreated1.kill();
            expect(_.size(world.getAgentsAt(agentCreated1.getLocation()))).to.equal(0);
            expect(_.size(world.getAllAgents())).to.equal(0);
        });
    }
);
