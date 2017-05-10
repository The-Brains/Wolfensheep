define(
    ['chai', './test-wrapper.js' ,'../core/agent/dna-random-gene.js'],
    function(chai, testWrapper, classDNA) {
        var expect = chai.expect;
        var mainName = 'core-agent-dnaRandomGene';

        testWrapper.execTest(mainName, 'should generate DNA', function() {
            var dna = new classDNA('nice seed');
            expect(dna.getDNA().length).to.equal(512);
        });

        testWrapper.execTest(mainName, 'should serialize and deserialize', function() {
            var expected = new classDNA('cool seed');
            var returned = classDNA.deserialize(expected.serialize());
            expect(returned.getDNA()).to.contain(expected.getDNA());
            expect(returned.getDNA().length).to.equal(512);
            expect(expected.getDNA().length).to.equal(512);
        });
    }
);
