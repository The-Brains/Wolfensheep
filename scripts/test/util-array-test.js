define(
    ['chai', 'testWrapper', '../util/array.js'],
    function(chai, testWrapper, ArrayUtil) {
        var expect = chai.expect;
        var mainName = 'util-array';

        testWrapper.execTest(mainName, 'should create 2 dimensional array', function() {
            var arr = ArrayUtil.makeTwoDimensional(3, 4);
            expect(arr.length).to.equal(3);
            for(var i = 0 ; i < 3 ; i ++) {
                expect(arr[i].length).to.equal(4);
            }
        });
    }
);
