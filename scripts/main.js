define([
        'jquery',
        'lodash',
        './core/game.js',
        './graphics/worldview.js',
        './util/round.js'
    ], function($, _, Game, WorldView, Round) {
        var game = null;

        var injectProgressBar = function(progressName, percent) {
            var container = $('.world-generation-progress .container');
            var progressBar = container.find(`[data-name="${progressName}"]`);

            if (_.isEmpty(progressBar)) {
                var newProgressBar = $('<div>', {
                    class: 'progress-bar',
                    'data-name': progressName,
                });
                var progressBarName = $('<span>', {
                    text: progressName,
                    class: 'progress-title mdl-typography--headline',
                });
                var progressBarContainer = $('<div>', {
                    class: 'progress-bar-container',
                });
                var progressBarFilling = $('<div>', {
                    class: 'progress-bar-filling',
                });
                var progressBarPercent = $('<span>', {
                    class: 'progress-bar-percent mdl-typography--title',
                    text: `${percent}%`,
                });
                var progressBarRow = $('<div>', {
                    class: 'progress-bar-row',
                });

                progressBarContainer.append(progressBarFilling);
                progressBarRow.append(progressBarContainer);
                progressBarRow.append(progressBarPercent);

                newProgressBar.append(progressBarName);
                newProgressBar.append(progressBarRow);

                container.append(newProgressBar);

                injectProgressBar(progressName, percent);
            } else {
                progressBar.find('.progress-bar-filling').css('width', `${percent}%`);
                progressBar.find('.progress-bar-percent').text(`${percent}%`)
            }


        }

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
                return game.initialize((processName, progress, total) => {
                    // console.log(`${processName}: ${progress}/${total}`);
                    injectProgressBar(processName, Round(progress / total * 100.0, 2));
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
            });
        };

        $('.input-world-generate').on('click', function() {
            $('.input-world-generate').attr('disabled', 'disabled');
            generateWorld()
            .then(() => {
                console.log('done generating game');
            });
        });

        $('.input-button-add-agent').on('click', function() {
            var agent = game.getWorld().addNewAgent();
        })

        console.log('App started.');
});
