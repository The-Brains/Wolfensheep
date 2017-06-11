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

        testWrapper.execTest(mainName, 'should get point to target at distance (1)', function() {
            var loc1 = new Location(1, 0);
            var loc2 = new Location(1, 50);
            var expected = new Location(1, 10);
            expect(loc1.getLocationAwayToward(10, loc2).serialize())
                .to.equal(expected.serialize());
        });

        testWrapper.execTest(mainName, 'should get point to target at distance (2)', function() {
            var loc1 = new Location(1, 50);
            var loc2 = new Location(1, 0);
            var expected = new Location(1, 40);
            expect(loc1.getLocationAwayToward(10, loc2).serialize())
                .to.equal(expected.serialize());
        });

        testWrapper.execTest(mainName, 'should get point to target at distance (3)', function() {
            var loc1 = new Location(50, 1);
            var loc2 = new Location(0, 1);
            var expected = new Location(40, 1);
            expect(loc1.getLocationAwayToward(10, loc2).serialize())
                .to.equal(expected.serialize());
        });

        testWrapper.execTest(mainName, 'should get point to target at distance (4)', function() {
            var loc1 = new Location(0, 1);
            var loc2 = new Location(50, 1);
            var expected = new Location(10, 1);
            expect(loc1.getLocationAwayToward(10, loc2).serialize())
                .to.equal(expected.serialize());
        });

        testWrapper.execTest(mainName, 'should get point to target at distance (5)', function() {
            var loc1 = new Location(0, 0);
            var loc2 = new Location(50, 50);
            var expected = new Location(25, 25);
            expect(loc1.getLocationAwayToward(25 * Math.sqrt(2), loc2).serialize())
                .to.equal(expected.serialize());
        });

        testWrapper.execTest(mainName, 'should get point to target at distance (6)', function() {
            var loc1 = new Location(50, 50);
            var loc2 = new Location(0, 0);
            var expected = new Location(25, 25);
            expect(loc1.getLocationAwayToward(25 * Math.sqrt(2), loc2).serialize())
                .to.equal(expected.serialize());
        });
    }
);
