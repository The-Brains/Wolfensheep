define(['dobuki',],function(DOK) {

    function CanvasResizer(camera, canvas, renderer) {
        var width = canvas.width, height = canvas.height;

        function checkCanvasSize() {
            var sizeChanged = false;
            if(width !== canvas.parentElement.offsetWidth) {
                width = canvas.parentElement.offsetWidth;
                sizeChanged = true;
            }
            if(height !== canvas.parentElement.offsetHeight) {
                height = canvas.parentElement.offsetHeight;
                sizeChanged = true;
            }
            if(sizeChanged) {
                canvas.width = width;
                canvas.height = height;
                renderer.setSize( width, height );
                camera.aspect = canvas.width / canvas.height;
                camera.updateProjectionMatrix();
            }
        }

        function update() {
            checkCanvasSize();
        }


        this.update = update;
    }
    return CanvasResizer;
});
