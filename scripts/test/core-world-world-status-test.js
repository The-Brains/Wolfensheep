define(
    [
        'chai',
        'testWrapper',
        '../core/world/world-status.js',
        '../core/localization/location.js',
    ],
    function(chai, testWrapper, WorldStatus, Location) {
        var expect = chai.expect;
        var mainName = 'core-world-world-status';

        testWrapper.execTest(mainName, 'should generate all type of terrain', function() {
            var terrains = WorldStatus.getAllPossibleType();
            expect(terrains.length).to.equal(675);
        });
    }
);
