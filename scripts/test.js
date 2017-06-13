// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    enforceDefine: true,
    baseUrl: 'scripts/lib',
    paths: {
        chai: 'chai',
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
        testWrapper: 'https://the-brains.github.io/TestSuite/scripts/test/test-wrapper',
    },
    urlArgs: "bust=" + Date.now(),
});

define(function() {
    window.testFileName = 'test.html';
    // Start loading the main app file. Put all of
    // your application logic in there.
    requirejs([
        'scripts/test/core-agent-agent-test.js',
        'scripts/test/core-agent-dnaHardcodedGene-test.js',
        'scripts/test/core-agent-dnaRandomGene-test.js',
        'scripts/test/core-game-test.js',
        'scripts/test/core-localization-location-test.js',
        'scripts/test/core-random-test.js',
        'scripts/test/core-world-world-test.js',
        'scripts/test/core-world-world-status-test.js',
        'scripts/test/util-find-get-param-test.js',
        'scripts/test/agent-interaction-test.js',
    ]);
});
