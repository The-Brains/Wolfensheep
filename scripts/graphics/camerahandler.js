define(['dobuki',],function(DOK) {

    function CameraHandler(camera, cellSize) {
        var width, height;
        var selectedObj = {};
        function getCamPos() {
            var xPos = camera.position.x;
            var yPos = camera.position.y;

            selectedObj.x = Math.round(xPos/cellSize);
            selectedObj.y = Math.round(yPos/cellSize) + 6;
            return selectedObj;
        }

        camera.position.set(2000,1000,1000);
        camera.rotateX(.3);

        var camGoal = {
            x:camera.position.x, y:camera.position.y,
        };
        DOK.Mouse.setOnTouch(
            function(dx,dy,down,pageX,pageY) {
                if(dx!==null && dy!==null) {
                    if(down) {
                        camGoal.x = camera.position.x - dx*20;
                        camGoal.y = camera.position.y + dy*20;
                    }
                } else {
                    if(down) {
                        camGoal.x = camera.position.x;
                        camGoal.y = camera.position.y;
                    }
                }
            }
        );

        function updateCamera() {
            camera.position.x += (camGoal.x - camera.position.x) / 3;
            camera.position.y += (camGoal.y - camera.position.y) / 3;
        }

        this.getCamPos = getCamPos;
        this.update = updateCamera;
    }
    return CameraHandler;
});
