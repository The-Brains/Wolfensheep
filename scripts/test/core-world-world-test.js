define(
    [
        'chai',
        './test-wrapper.js',
        '../core/world/world.js',
        '../core/localization/location.js',
    ],
    function(chai, testWrapper, World, Location) {
        var expect = chai.expect;
        var mainName = 'core-world-world';

        testWrapper.execTest(mainName, 'should generate parameters', function() {
            var world = new World('cool seed', 20, 20);
            var env = world.getWorldStatus(new Location(5, 5)).getParameters();
            expect(env).to.have.property('humidity');
            expect(env).to.have.property('temperature');
            expect(env).to.have.property('ground');
            expect(env).to.have.property('wind');
            expect(env).to.have.property('cloud');
        });
    }
);
