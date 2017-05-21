define(
    [
        './actiongenerator.js',
        './viewmodel.js',
        './threejsviewer.js',
    ],
    function(ActionGenerator, ViewModel, THREEViewer) {
        var canvas = document.getElementById("canvas");

        var generator = new ActionGenerator({
            x: 0, y: 0,
        });
        var model = new ViewModel();

        generator.generateActions(function(action) {
            logAction(action);
            model.updateModel(action);
        });

        var viewer = new THREEViewer(canvas, model);
        viewer.start();


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
