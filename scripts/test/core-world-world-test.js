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
    }
);
