importScripts('./lib/require.js');

var worker = self;
require({
        baseUrl: './lib',
        paths: {
            jquery: [
                'https://code.jquery.com/jquery-3.2.1.slim.min',
                'jquery-3.2.1.slim.min',
            ],
            lodash: [
                'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min',
                'lodash.min',
            ],
            seedRandom: [
                'https://cdnjs.cloudflare.com/ajax/libs/seedrandom/2.4.3/seedrandom.min',
                'seedrandom.min',
            ],
            threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
            dobuki: 'https://jacklehamster.github.io/dok/out/dok.min',
            jsgif: 'jsgif/gif',
        },
    },
    [
        './core/game.js',
        'lodash',
    ],
    function(Game, Round) {
        console.log('worker loaded');

        worker.onmessage = function (e) {
            console.log('worker starting');

            var lastTimeUpdate = {};

            game = new Game(e.data.seed, e.data.width, e.data.height);
            game.initialize((progressBarName, progress, progressTotal) => {
                if (!lastTimeUpdate[progressBarName]) {
                    lastTimeUpdate[progressBarName] = 0;
                }

                var now = new Date();
                var timeSpent = now - lastTimeUpdate[progressBarName];

                if (timeSpent >= 250 || progress === 0 || progress === progressTotal) {
                    worker.postMessage({
                        message: 'progress',
                        progressBarName: progressBarName,
                        percent: _.round(progress / progressTotal * 100.0, 2),
                    });

                    lastTimeUpdate[progressBarName] = now;
                }
            })
            .then((game) => {
                console.log('Worker done');
                worker.postMessage({
                    message: 'game start',
                    game: game.toJson(),
                });
            });
        };

        worker.postMessage({
            message: 'ready',
        });
    }
);
