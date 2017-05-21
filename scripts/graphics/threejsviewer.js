define([
        'threejs',
    ],
    function(THREE) {
        var THREEViewer = function(canvas, model) {
            var width = canvas.width;
            var height = canvas.height;

            var renderer = new THREE.WebGLRenderer({
                canvas: canvas,
            });
            renderer.setSize( width, height );
            renderer.setPixelRatio(window.devicePixelRatio);
            var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000);
            var scene = new THREE.Scene();

            camera.position.set(0,-300,1000);
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = 0;
            renderer.domElement.style.top = 0;
            var ground = new THREE.Mesh(
                new THREE.PlaneGeometry( 1, 1),
                new THREE.MeshBasicMaterial( {color: 0x777777})
            );
            ground.position.set(0,0,0);
            ground.scale.set(1000, 1000, 1);
            scene.add(ground);
            camera.rotateX(.3);

            scene.add( new THREE.AmbientLight( 0xcccccc ) );
            var light = new THREE.PointLight( 0xffffff, 1, 0, 5 );
            light.position.set( -50, 250, 50 );
            scene.add( light );


            var threeObjs = {
            };

            function displayCreature(id, creature, time) {
                var position = creature.getPosition(time);

                var threeObj = threeObjs[id];
                if(!threeObj) {
                    if (!creature.color) {
                        creature.color = '#'+Math.floor(Math.random()*0xFFFFFF).toString(16);
                    }
                    threeObj = new THREE.Mesh(
                        new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2),
                        new THREE.MeshLambertMaterial({
                            color: creature.color,
                        })
                    );
                    threeObj.geometry.scale(5,5,5);
                    scene.add(threeObj);
                    threeObjs[id] = threeObj;
                }
                threeObj.position.set(position[0],position[1],0);


    /*            if (!creature.color) {
                    creature.color = '#'+Math.floor(Math.random()*0xFFFFFF).toString(16);
                }
                ctx.fillStyle = creature.color;
                ctx.beginPath();
                ctx.arc(position[0],position[1],10,0,2*Math.PI);
                ctx.fill();*/
            }

            function updateView(model, time) {
                model.forEach(displayCreature, time);
                renderer.render(scene, camera);
            }

            var stopped = false;
            function refreshScreen() {
                if (!stopped) {
                    var time = Date.now();
                    updateView(model, time);
                    requestAnimationFrame(refreshScreen);
                }
            }

            function start() {
                stopped = false;
                refreshScreen();
            }

            function stop() {
                stopped = true;
            }

            this.start = start;
            this.stop = stop;
        };
        return THREEViewer;
});