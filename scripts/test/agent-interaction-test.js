define(
    [
        'chai',
        'testWrapper',
        '../core/game.js',
    ],
    function(chai, testWrapper, Game) {
        var expect = chai.expect;
        var mainName = 'agent-interaction';

        testWrapper.execTest(mainName, 'should iterate over cycles', function() {
            var game = new Game('123', 5, 5);

            return game.initialize()
            .then(() => {
                var agent1 = game.getWorld().addNewAgent();
                var agent2 = game.getWorld().addNewAgent();
                var agent3 = game.getWorld().addNewAgent();
                var agent4 = game.getWorld().addNewAgent();

                var executeCycle = function() {
                    return game.cycle()
                    .then(() => {
                        if (agent1.isAlive()
                            || agent2.isAlive()
                            || agent3.isAlive()
                            || agent4.isAlive()
                        ) {
                            return executeCycle();
                        } else {
                            return Promise.resolve();
                        }
                    });
                };

                return executeCycle()
                .then(() => {
                    expect(agent1.isAlive()).to.be.false;
                    expect(agent2.isAlive()).to.be.false;
                    expect(agent3.isAlive()).to.be.false;
                    expect(agent4.isAlive()).to.be.false;
                    var world = game.getWorld();
                    expect(world.getAgentQuantity()).to.be.above(0);
                    var agents = world.getAllAgents();
                    expect(agents[0].getID()).to.at.least(4);
                });
            });
        });
    }
);
