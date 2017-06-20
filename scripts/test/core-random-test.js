define(
    ['chai', 'testWrapper', 'lodash', '../core/random.js'],
    function(chai, testWrapper, _, Random) {
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

        testWrapper.execTest(mainName, 'should return any from array', function() {
            var r = new Random();
            var input = [1, 2, 3, 4, 5];

            for(var i = 0 ; i < 100; i ++) {
                var picked = r.anyFrom(input);
                expect(input).to.include(picked);
            }
        });

        testWrapper.execTest(mainName, 'should return any from object', function() {
            var r = new Random();
            var input = {
                'one': 1,
                'two': 2,
                '3': 'three',
            };

            for(var i = 0 ; i < 100; i ++) {
                var picked = r.anyFrom(input);
                expect(_.values(input)).to.include(picked);
            }
        });

        testWrapper.execTest(mainName, 'should shuffle array', function() {
            var r = new Random();
            var input = [1,2,3,4,5,6];
            var output = r.shuffledForEach(input, (value, key) => {
                expect(_.values(input)).to.include(value);
            });
            expect(output).to.not.eql(input);
            expect(output.sort()).to.eql(input.sort());
        });

        testWrapper.execTest(mainName, 'should shuffle hash', function() {
            var r = new Random();
            var input = {
                'one': 1,
                'two': 2,
                'three': 3,
            };
            var output = r.shuffledForEach(input, (value, key) => {
                expect(value).to.equal(input[_.findKey(input, v => v === value)]);
                expect(_.keys(input)).to.include(key);
                expect(_.values(input)).to.include(value);
            });
            expect(output).to.eql(input);
        });
    }
);
