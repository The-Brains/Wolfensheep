define(
    [
        'chai',
        'lodash',
        './test-wrapper.js',
        '../core/agent/dna-random-gene.js',
        '../core/localization/location.js',
        '../core/agent/agent.js',
        '../core/world/world-status.js',
    ],
    function(chai, _, testWrapper, objectDNA, Location, Agent, WorldStatus) {
        var expect = chai.expect;
        var mainName = 'core-agent-agent';

        testWrapper.execTest(mainName, 'should have speeds', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));

            expect(_.size(agent.speeds)).to.be.equal(WorldStatus.getAllPossibleType().length);
            expect(agent.getSpeed(WorldStatus.getAllPossibleType()[0])).to.exists;
            expect(_.isNumber(agent.getSpeed(WorldStatus.getAllPossibleType()[0]))).to.be.true;
        });

        testWrapper.execTest(mainName, 'should have hunger settings', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));

            // test for number and integer
            expect(_.isNumber(agent.deathByHunger)).to.be.true;
            expect(agent.deathByHunger).to.be.a('number');
            expect(agent.deathByHunger % 1).to.be.equal(0);

            expect(agent.deathByHunger).to.be.at.least(0);

            expect(_.isNumber(agent.hungry)).to.be.true;
            expect(agent.hungry).to.be.a('number');
            expect(agent.hungry % 1).to.be.equal(0);

            expect(agent.hungry).to.be.at.least(0);

            expect(agent.deathByHunger).to.be.above(agent.hungry);

            expect(_.isNumber(agent.hungerRate)).to.be.true;
            expect(agent.hungry).to.be.above(0);

            expect(_.isNumber(agent.hungerMove)).to.be.true;
            expect(agent.hungerMove).to.be.at.least(0);
            expect(agent.hungerMove).to.be.below(1);
        });

        testWrapper.execTest(mainName, 'should die while moving', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));

            expect(agent.isPlant()).to.be.false;

            var moveQuantity = 0;
            while(agent.alive) {
                var location = new Location(
                    0,
                    agent.location.getY()
                        + agent.getSpeed(WorldStatus.getAllPossibleType()[0])
                );
                moveQuantity += 1;
                agent.cycle(location);
            }

            expect(agent.location.getX()).to.be.equal(0);
            expect(agent.location.getY()).to.be.above(0);
            expect(agent.alive).to.be.false;
            expect(agent.hungry).to.be.at.least(agent.deathByHunger);

            // you do not want agent which would die right away
            expect(moveQuantity).to.be.at.least(10);
        });

        testWrapper.execTest(mainName, 'should not move as a plant', function() {
            var dna = new objectDNA('1234 seed'); // this seed generate a plant agent
            var agent = new Agent(dna, new Location(0, 0));

            expect(agent.isPlant()).to.be.true;
            expect(agent.getSpeed(WorldStatus.getAllPossibleType()[0])).to.equal(0);

            var cycleQuantity = 0;
            while(agent.alive) {
                cycleQuantity += 3;
                agent.cycle();
                agent.cycle();
                agent.cycle();
            }

            expect(agent.location.getX()).to.be.equal(0);
            expect(agent.location.getY()).to.be.equal(0);
            expect(agent.alive).to.be.false;
            expect(agent.hungry).to.be.at.least(agent.deathByHunger);

            // you do not want agent which would die right away
            expect(cycleQuantity).to.be.at.least(10);
        });
    }
);
