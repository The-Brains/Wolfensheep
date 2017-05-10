define(
    ['chai', './test-wrapper.js' ,'../core/localization/location.js'],
    function(chai, testWrapper, Location) {
        var expect = chai.expect;
        var mainName = 'core-localization-location';

        testWrapper.execTest(mainName, 'get should return correct values', function() {
            var loc = new Location(10, 30);
            expect(loc.getX()).to.equal(10);
            expect(loc.getY()).to.equal(30);
        });
    }
);
