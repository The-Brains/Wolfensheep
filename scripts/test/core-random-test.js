define(
    ['chai', 'testWrapper' ,'../core/random.js'],
    function(chai, testWrapper, Random) {
        var expect = chai.expect;
        var mainName = 'core-random';

        testWrapper.execTest(mainName, 'should be stable for int', function() {
            var r1 = new Random('my-test-seed');
            var expected = r1.get32Int();

            var r2 = new Random('my-test-seed');
            var returned = r2.get32Int();

            expect(expected).to.equal(returned);
        });

        testWrapper.execTest(mainName, 'should be stable for float', function() {
            var r1 = new Random('my-test-seed');
            var expected = r1.getFloat();

            var r2 = new Random('my-test-seed');
            var returned = r2.getFloat();

            expect(expected).to.equal(returned);
        });

        testWrapper.execTest(mainName, 'should return int in range', function() {
            var r = new Random();
            for(var i = 0; i < 100 ; i ++) {
                var returned = r.getInt(3, 10);

                // this test if it is an integer
                expect(returned).to.be.a('number');
                expect(returned % 1).to.be.equal(0);

                expect(returned).to.be.at.least(3);
                expect(returned).to.be.below(10);
            }
        });

        testWrapper.execTest(mainName, 'should return float in range', function() {
            var r = new Random();
            for(var i = 0; i < 100 ; i ++) {
                var returned = r.getFloatInRange(3, 10);

                expect(returned).to.be.at.least(3);
                expect(returned).to.be.below(10);
            }
        });
    }
);
