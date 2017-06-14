define([
        'jquery',
        'lodash',
        './core/game.js',
        './graphics/worldview.js',
    ], function($, _, Game, WorldView) {
        var game = null;

        var generateWorld = function() {
            return Promise.resolve()
            .then(() => {
                var width = _.parseInt($('.input-world-width').val());
                var height = _.parseInt($('.input-world-height').val());
                var seed = $('.input-world-seed').val();

                if (!_.isNumber(width)
                    || width <= 0
                    || !_.isNumber(height)
                    || height <= 0
                    || seed === ''
                ) {
                    throw 'You cannot create world without width, height, and seed';
                }

                game = new Game(seed, width, height);
                $('.world-creation-form').addClass('is-hidden');

                game.getWorld().setAgentCounterCallback((agentQuantity) => {
                    $('.agent_quantity').text(game.getWorld().getAgentQuantity());
                });

                $('.world-generation-progress').removeClass('is-hidden');
                setTimeout(() => {
                    return game.initialize((processName, progress, total) => {
                        console.log(`${processName}: ${progress}/${total}`);
                        $('.world-generation-progress').append($('<div>', {
                            text: `${processName}: ${progress}/${total}`
                        }));
                    })
                    .then((game) => {
                        $('.world-generation-progress').addClass('is-hidden');
                        var worldView = new WorldView(game, document.getElementById('canvas'))
                        worldView.start();

                        setInterval(() => {
                            game.cycle();
                        }, 1000);

                        $('.input-button-add-agent').attr('disabled', null);
                        $('.CanvasArea').removeClass('is-hidden');
                        return Promise.resolve();
                    });
                }, 10);
            });
        };

        $('.input-world-generate').on('click', function() {
            $('.input-world-generate').attr('disabled', 'disabled');
            setTimeout(()=>{
                generateWorld()
                .then(() => {
                    console.log('done generating game');
                })
            }, 10);
        });

        $('.input-button-add-agent').on('click', function() {
            var agent = game.getWorld().addNewAgent();
        })

        console.log('App started.');
});
