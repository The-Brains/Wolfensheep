// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    // enforceDefine: true,
    baseUrl: 'scripts/lib',
    paths: {
        chai: 'chai',
        jquery: 'https://code.jquery.com/jquery-3.2.1.slim.min',
        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js',
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs([
    'scripts/test/core-agent-dna-test.js',
]);
