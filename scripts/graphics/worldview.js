define([
        'threejs',
        'dobuki',
    ],
    function(THREE, DOK) {
        var WorldViewer = function(game, canvas) {
            var width = canvas.width;
            var height = canvas.height;

            var renderer = new THREE.WebGLRenderer({
                canvas: canvas,
            });
            renderer.setSize( width, height );
            renderer.setPixelRatio(window.devicePixelRatio);
            var camera = DOK.Camera.getCamera(); //new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000);
            var scene = new THREE.Scene();

            camera.position.set(2000,1000,1000);
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = 0;
            renderer.domElement.style.top = 0;
            camera.rotateX(.3);

            scene.add( new THREE.AmbientLight( 0xcccccc ) );
            var light = new THREE.PointLight( 0xffffff, 1, 0, 5 );
            light.position.set( -50, 250, 50 );
            scene.add( light );


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

            var range = 100;
            var cellSize = 64;
            renderer.setClearColor (0xffffff, 1);
            var selectedObj = {};
            function getCamPos() {
                var xPos = camera.position.x;
                var yPos = camera.position.y;

                selectedObj.x = Math.round(xPos/cellSize);
                selectedObj.y = Math.round(yPos/cellSize) + 6;
                return selectedObj;
            }

            function getImageFromTileStatus(status) {
                if(status.ground==='water') {
                    return status.temperature==='freezing' ? DOK.SpriteSheet.spritesheet.ice : DOK.SpriteSheet.spritesheet.water;
                } else {
                    return DOK.SpriteSheet.spritesheet.floor;
                }
            }


            var images = {
                floor: require.toUrl("dok/images/wood.png"),
                water: require.toUrl("dok/images/water.gif"),
                ice: require.toUrl("dok/images/ice.png"),
            };
            DOK.SpriteSheet.preLoad(images);
            var spriteRenderer = new DOK.SpriteRenderer();
            scene.add(spriteRenderer.mesh);
            var collection = new DOK.Collection(
                {
                    type: "grid",
                    get x() {
                        return getCamPos().x -Math.floor(range/2);
                    },
                    get y() {
                        return getCamPos().y -Math.floor(range/2);
                    },
                    width: range,
                    height: range,
                    tiles: null,
                },
                function(x,y) {
                    if(this.options.tiles) {
                        var tile = this.options.tiles[x+"-"+y];
                        if (tile) {
                            var status = tile.status;

                            var img = getImageFromTileStatus(status);

                            return DOK.SpriteObject.create().init(
                                x*cellSize,y*cellSize,0,//c!==0?0:-64,
                                cellSize,cellSize,
                                DOK.Camera.quaternions.southQuaternionArray,
                                1,
                                img
                            );
                        }
                    }
                }
            );

            function initialize() {
                DOK.Loader.getLoadingBar();
                DOK.Loader.setOnLoad(gameLoaded);
            }

            function gameLoaded() {
                document.body.removeChild(DOK.Loader.getLoadingBar());
                renderer.setClearColor (0xffffff, 1);
                renderer.render(scene,DOK.Camera.getCamera());
                startGame();
            }

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
            function startGame() {
                DOK.Loop.fps = 45;
                var frame = 0;
                DOK.Loop.addLoop(function() {
                    frame++;
                    checkCanvasSize();

                    var tiles = game.getWorld().getAllTiles();
                    collection.options.tiles = tiles;
                    window.collection = collection;

                    var camera = DOK.Camera.getCamera();
                    camera.position.x += (camGoal.x - camera.position.x) / 3;
                    camera.position.y += (camGoal.y - camera.position.y) / 3;
                    collection.forEach(spriteRenderer.display);
                    spriteRenderer.updateGraphics();
                    renderer.render(scene, camera);
                });
            }

            this.start = initialize;



            var statuses = {};
            var tiles = game.getWorld().getAllTiles();
            for(var i in tiles) {
                var status = tiles[i].status;
                for(var s in status) {
                    statuses[s + "=" + status[s]] = true;
                }
            }
            console.log(statuses);

        };
        return WorldViewer;
    });