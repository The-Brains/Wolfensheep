define(['jquery', 'lodash'], function($, _) {
    function resizeCanvas() {
        var canvasDrawing = $('#canvas');
        var width = canvasDrawing.width();
        var ctxDrawing = canvasDrawing[0].getContext('2d');

        var height = $(window).height() - $('header').height();
        CANVAS_WIDTH = width;
        CANVAS_HEIGHT = height;
        $('.CanvasArea').height(height);
        ctxDrawing.canvas.width = width;
        ctxDrawing.canvas.height = height;
    };

    $(window).resize(_.debounce(resizeCanvas, 200, {
        maxWait: 1000,
    }));
});
