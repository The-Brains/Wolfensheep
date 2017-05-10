define(
    ['chai', './test-wrapper.js' ,'../core/agent/dna.js'],
    function(chai, testWrapper, classDNA) {
        var expect = chai.expect;
        var mainName = 'core-agent-dna';

        testWrapper.execTest(mainName, 'should fail with wrong key', function() {
            var dna = new classDNA();
            expect(dna.setGene.bind(dna,'plop', 'plop')).to.throw(Error);
        });

        testWrapper.execTest(mainName, 'test failing test', function() {
            var dna = new classDNA();
            expect(dna.setGene.bind(dna,'plop', 'plop')).to.not.throw(Error);
        });

        testWrapper.execTest(mainName, 'set and get key', function() {
            var dna = new classDNA();
            dna.setGene('numberOfLegs', 5);
            expect(dna.getGene('numberOfLegs')).to.equal(5);
        });
    }
);
