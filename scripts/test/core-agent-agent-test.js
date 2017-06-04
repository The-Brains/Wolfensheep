define(
    [
        'chai',
        'lodash',
        'testWrapper',
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

            expect(agent.getSpeed(WorldStatus.getAllPossibleType()[0])).to.exists;
            expect(_.isNumber(agent.getSpeed(WorldStatus.getAllPossibleType()[0]))).to.be.true;
        });

        testWrapper.execTest(mainName, 'should have hunger settings', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));
            var data = agent.getData().food;

            // test for number and integer
            expect(_.isNumber(data.deathByHunger)).to.be.true;
            expect(data.deathByHunger).to.be.a('number');
            expect(data.deathByHunger % 1).to.be.equal(0);

            expect(data.deathByHunger).to.be.at.least(0);

            expect(_.isNumber(data.hungry)).to.be.true;
            expect(data.hungry).to.be.a('number');
            expect(data.hungry % 1).to.be.equal(0);

            expect(data.hungry).to.be.at.least(0);

            expect(data.deathByHunger).to.be.above(data.hungry);

            expect(_.isNumber(data.hungerRate)).to.be.true;
            expect(data.hungerRate).to.be.above(0);

            expect(_.isNumber(data.hungerMove)).to.be.true;
            expect(data.hungerMove).to.be.at.least(0);
            expect(data.hungerMove).to.be.below(1);
        });

        testWrapper.execTest(mainName, 'should have sleep settings', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));
            var data = agent.getData().energy;

            // test for number and integer
            expect(_.isNumber(data.deathByExhaustion)).to.be.true;
            expect(data.deathByExhaustion).to.be.a('number');
            expect(data.deathByExhaustion % 1).to.be.equal(0);

            expect(data.deathByExhaustion).to.be.at.least(0);

            expect(_.isNumber(data.tired)).to.be.true;
            expect(data.tired).to.be.a('number');
            expect(data.tired % 1).to.be.equal(0);

            expect(data.tired).to.be.at.least(0);

            expect(data.deathByExhaustion).to.be.above(data.tired);

            expect(_.isNumber(data.exhaustionRate)).to.be.true;
            expect(data.exhaustionRate).to.be.above(0);

            expect(_.isNumber(data.exhaustionMove)).to.be.true;
            expect(data.exhaustionMove).to.be.at.least(0);
            expect(data.exhaustionMove).to.be.below(1);
        });

        testWrapper.execTest(mainName, 'should have traits settings', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));
            var data = agent.getData().playful;

            // test for number and integer
            // curiosity
            expect(_.isNumber(data.curiosity)).to.be.true;
            expect(data.curiosity).to.be.a('number');
            expect(data.curiosity % 1).to.be.equal(0);
            expect(data.curiosity).to.be.at.least(0);
            expect(data.curiosity).to.be.below(90);

            expect(_.isNumber(data.looseCuriosityWithAgeCoef)).to.be.true;
            expect(data.looseCuriosityWithAgeCoef).to.be.above(0);
            expect(data.looseCuriosityWithAgeCoef).to.be.below(1);

            // playful
            expect(_.isNumber(data.playful)).to.be.true;
            expect(data.playful).to.be.a('number');
            expect(data.playful % 1).to.be.equal(0);
            expect(data.playful).to.be.at.least(0);
            expect(data.playful).to.be.below(90);

            expect(_.isNumber(data.loosePlayfulWithAgeCoef)).to.be.true;
            expect(data.loosePlayfulWithAgeCoef).to.be.above(0);
            expect(data.loosePlayfulWithAgeCoef).to.be.below(1);
        });

        testWrapper.execTest(mainName, 'should die while moving', function() {
            var dna = new objectDNA('test seed');
            var agent = new Agent(dna, new Location(0, 0));

            expect(agent.isPlant()).to.be.false;

            var moveQuantity = 0;
            while(agent.getData().alive) {
                var location = new Location(
                    0,
                    agent.getLocation().getY()
                        + agent.getSpeed(WorldStatus.getAllPossibleType()[0])
                );
                moveQuantity += 1;
                agent.cycle(location);
                expect(agent.getCurrentGoal().name === 'looking for food'
                    || agent.getCurrentGoal().name === 'dead').to.be.true;
                if (moveQuantity > 1000) {
                    break;
                }
            }

            expect(agent.getLocation().getX()).to.be.equal(0);
            expect(agent.getLocation().getY()).to.be.above(0);
            expect(agent.getData().alive).to.be.false;
            expect(agent.getData().food.hungry).to.be.at.least(agent.getData().food.deathByHunger);

            // you do not want agent which would die right away
            expect(moveQuantity).to.be.at.least(10);
        });

        testWrapper.execTest(mainName, 'should not move as a plant', function() {
            var dna = new objectDNA('1234 seed'); // this seed generate a plant agent
            var agent = new Agent(dna, new Location(0, 0));

            expect(agent.isPlant()).to.be.true;
            var speed = agent.getSpeed(WorldStatus.getAllPossibleType()[0]);
            expect(agent.getSpeed(WorldStatus.getAllPossibleType()[0])).to.equal(0);

            var cycleQuantity = 0;
            while(agent.getData().alive) {
                cycleQuantity += 3;
                agent.cycle();
                agent.cycle();
                agent.cycle();

                if (cycleQuantity > 1000) {
                    break;
                }
            }

            expect(agent.getLocation().getX()).to.be.equal(0);
            expect(agent.getLocation().getY()).to.be.equal(0);
            expect(agent.getData().alive).to.be.false;
            expect(agent.getData().food.hungry).to.be.at.least(agent.getData().food.deathByHunger);

            // you do not want agent which would die right away
            expect(cycleQuantity).to.be.at.least(10);
        });

        // TODO: Check that reproduction value are being created properly
        // TOOD: Check that reproduction works.
    }
);
