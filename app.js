// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    enforceDefine: true,
    baseUrl: 'scripts/lib',
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
});

define(['scripts/util/find-get-param.js'], function(findGetParameter) {
    var disable_cache = findGetParameter('disable_cache');
    var debug = findGetParameter('debug');
    var config = {
        urlArgs: disable_cache ? "time=" + Date.now() : '',
        paths: {
            dobuki: debug
                ? 'https://jacklehamster.github.io/dok/out/dok'
                : 'https://jacklehamster.github.io/dok/out/dok.min',
        }
    };

    var dok_lib = findGetParameter('dok_lib');
    if (dok_lib) {
        config.baseUrl = dok_lib;
        config.paths.dobuki = dok_lib + 'dobuki';
    }

    requirejs.config(config);

    // Start loading the main app file. Put all of
    // your application logic in there.
    requirejs([
        'scripts/util/resize-canvas.js',
        'scripts/main.js',
    ]);
});
