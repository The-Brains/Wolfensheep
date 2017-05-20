define([
        'jquery',
        'lodash',
        './core/game.js',
    ], function($, _, Game) {
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

            var game = new Game(seed, width, height);
            $('.world-creation-form').addClass('is-hidden');

            // TODO: Pass the game object to the canvas generation part.
            // something like:
            // var frontEnd = new FrontEnd(game, function() {
            //      // callback when world is ready to show.
            //      $('.CanvasArea').removeClass('is-hidden');
            // });
        };

        $('.input-world-generate').on('click', function() {
            generateWorld();
        })

        console.log('App started.');
});
