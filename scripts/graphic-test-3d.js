requirejs.config({
//    enforceDefine: true,
    baseUrl: 'scripts/lib',
    paths: {
        jquery: 'https://code.jquery.com/jquery-3.2.1.slim.min',
        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min',
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
    },
});

define(function() {
    // Start loading the main app file. Put all of
    // your application logic in there.
    requirejs([
        'scripts/graphics/main-3d.js',
    ]);
});
