define([
        'threejs',
        'dobuki',
        './camerahandler.js',
        './canvasresizer.js',
        './tilesview.js',
    ],
    function(THREE, DOK, CameraHandler, CanvasResizer, TilesView) {
        var WorldViewer = function(game, canvas) {
            var cellSize = 64;
            var width = canvas.width;
            var height = canvas.height;

            var renderer = new THREE.WebGLRenderer({
                canvas: canvas,
            });
            renderer.setSize( width, height );
            renderer.setPixelRatio(window.devicePixelRatio);
            var scene = new THREE.Scene();

            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = 0;
            renderer.domElement.style.top = 0;

            scene.add( new THREE.AmbientLight( 0xcccccc ) );
            var light = new THREE.PointLight( 0xffffff, 1, 0, 5 );
            light.position.set( -50, 250, 50 );
            scene.add( light );

            renderer.setClearColor (0xffffff, 1);

            var spriteRenderer = new DOK.SpriteRenderer();
            spriteRenderer.curvature = 1;
            var camHandler = new CameraHandler(DOK.Camera.getCamera(), cellSize);
            var canvasResizer = new CanvasResizer(DOK.Camera.getCamera(), canvas, renderer);
            var tilesView = new TilesView(camHandler, spriteRenderer, cellSize, game);

            scene.add(spriteRenderer.mesh);


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


            function startGame() {
                DOK.Loop.fps = 45;
                var frame = 0;
                DOK.Loop.addLoop(function() {
                    frame++;
                    camHandler.update();
                    canvasResizer.update();
                    tilesView.update();

                    spriteRenderer.updateGraphics();
                    renderer.render(scene, DOK.Camera.getCamera());
                });
            }

            this.start = initialize;
            window.game= game;
        };
        return WorldViewer;
    });