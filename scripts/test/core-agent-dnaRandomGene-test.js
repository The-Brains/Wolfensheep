define(
    ['chai', 'testWrapper', '../core/agent/dna-random-gene.js'],
    function(chai, testWrapper, classDNA) {
        var expect = chai.expect;
        var mainName = 'core-agent-dnaRandomGene';

        testWrapper.execTest(mainName, 'should generate DNA', function() {
            var dna = new classDNA('nice seed');
            expect(dna.getDNA().length).to.equal(('nice seed').length);
        });

        testWrapper.execTest(mainName, 'should serialize and deserialize', function() {
            var expected = new classDNA('cool seed');
            var returned = classDNA.deserialize(expected.serialize());
            expect(returned.getDNA()).to.contain(expected.getDNA());
            expect(returned.getDNA().length).to.equal(('cool seed').length);
            expect(expected.getDNA().length).to.equal(('cool seed').length);
        });

        testWrapper.execTest(mainName, 'should json/parse json', function() {
            var expected = new classDNA('cool seed');
            var expectedJson = expected.toJson();
            var expectedDna = expected.getDNA();
            var expectedSpeedSeed = expected.getSpeedSeed();

            var result = classDNA.parseFromJson(expected.toJson())
            var resultJson = result.toJson();
            var resultDna = result.getDNA();
            var resultSpeedSeed = result.getSpeedSeed();

            expect(expectedJson).to.eql(resultJson);
            expect(expectedDna).to.equal(resultDna);
            expect(expectedSpeedSeed).to.equal(resultSpeedSeed);

        });
    }
);
