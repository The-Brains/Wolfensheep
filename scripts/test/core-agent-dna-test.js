define(
    ['chai', './test-wrapper.js' ,'../core/agent/dna.js'],
    function(chai, testWrapper, classDNA) {
        var expect = chai.expect;

        testWrapper.execTest('core-agent-dna | it should fail with wrong key', function() {
            var dna = new classDNA();
            expect(dna.set.bind(dna,'plop', 'plop')).to.throw(Error);
        });
    }
);


