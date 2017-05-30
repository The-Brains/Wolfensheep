define([
        'jquery',
        'lodash',
        './core/game.js',
        './graphics/worldview.js',
    ], function($, _, Game, WorldView) {
        var game = null;

        var generateWorld = function() {
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
            $('.input-button-add-agent').attr('disabled', null);

            var worldView = new WorldView(game, document.getElementById('canvas'))

            $('.CanvasArea').removeClass('is-hidden');

            worldView.start();

            // TODO: Pass the game object to the canvas generation part.
            // something like:
            // var frontEnd = new FrontEnd(game, function() {
            //      // callback when world is ready to show.
            //      $('.CanvasArea').removeClass('is-hidden');
            // });
        };

        $('.input-world-generate').on('click', function() {
            generateWorld();
        });

        $('.input-button-add-agent').on('click', function() {
            var agent = game.getWorld().addNewAgent();
            // console.log(agent.serialize());
            console.log(game.getWorld().getAgentQuantity());
        })

        console.log('App started.');
});
