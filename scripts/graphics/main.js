define(
    ['./actiongenerator.js', './viewmodel.js', './canvasviewer.js'],
    function(ActionGenerator, ViewModel, CanvasViewer) {
        var canvas = document.getElementById("canvas");

        var generator = new ActionGenerator();
        var model = new ViewModel();

        generator.generateActions(function(action) {
            logAction(action);
            model.updateModel(action);
        });

        var canvasViewer = new CanvasViewer(canvas, model);
        canvasViewer.start();


        function logAction(action) {
            var log = document.createElement('div');
            log.innerText = JSON.stringify(action);
            var logger = document.getElementById("log");
            logger.appendChild(log);
            if(logger.children.length > 8) {
                logger.removeChild(logger.firstChild);
                logger.classList.add('shifted');
                var timeout = setTimeout(function() {
                    logger.classList.remove('shifted');
                },10);
            }
        }
});
