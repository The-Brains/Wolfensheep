define(
    ['chai', 'testWrapper', '../core/localization/location.js'],
    function(chai, testWrapper, Location) {
        var expect = chai.expect;
        var mainName = 'core-localization-location';

        testWrapper.execTest(mainName, 'get should return correct values', function() {
            var loc = new Location(10, 30);
            expect(loc.getX()).to.equal(10);
            expect(loc.getY()).to.equal(30);
        });

        testWrapper.execTest(mainName, 'should serialize and deserialize', function() {
            var expected = new Location(10, 30);
            var returned = Location.deserialize(expected.serialize());
            expect(returned.getX()).to.equal(expected.getX());
            expect(returned.getY()).to.equal(expected.getY());
        });

        testWrapper.execTest(mainName, 'should equals', function() {
            var loc1 = new Location(10, 30);
            var loc2 = new Location(10, 30);
            expect(loc1.equals(loc2)).to.be.true;
            expect(loc2.equals(loc1)).to.be.true;

            var loc3 = new Location(5, 5);
            expect(loc1.equals(loc3)).to.be.false;
            expect(loc3.equals(loc1)).to.be.false;
        });

        testWrapper.execTest(mainName, 'should compute distance', function() {
            var loc1 = new Location(1, 30);
            var loc2 = new Location(1, 20);
            expect(loc1.distance(loc2)).to.equal(10);
            expect(loc2.distance(loc1)).to.equal(10);
        });
    }
);
