define(['dobuki'],function(DOK) {

    function CameraHandler(camera, domElement, cellSize) {
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

        var zoombar = 0;
        DOK.Mouse.setOnWheel(
            function(dx,dy) {
                zoombar = Math.max(0,Math.min(1,zoombar - dy/300));
            }
        );

        DOK.Mouse.setOnZoom(
            function(pinchSize) {
                zoombar = Math.max(0,Math.min(1,zoombar + pinchSize/200));
            }
        );

        DOK.Mouse.setMainElement(domElement);

        var zoomState = [
            { distance: 400, angle: 1.1 },
            { distance: 1000, angle: .3 },
        ];

        function updateCamera() {
            camera.position.x += (camGoal.x - camera.position.x) / 3;
            camera.position.y += (camGoal.y - camera.position.y) / 3;
            camera.position.z = zoombar*zoomState[0].distance + (1-zoombar)*zoomState[1].distance;
            camera.rotation.x = zoombar*zoomState[0].angle + (1-zoombar)*zoomState[1].angle;
        }

        this.getCamPos = getCamPos;
        this.update = updateCamera;
    }
    return CameraHandler;
});
