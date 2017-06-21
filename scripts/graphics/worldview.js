define([
        'threejs',
        'dobuki',
        './camerahandler.js',
        './tilesview.js',
        './agentsview.js',
        './infoview.js',
    ],
    function(THREE, DOK, CameraHandler, TilesView, AgentsView, InfoView) {
        var WorldViewer = function(game, canvas) {
            var cellSize = 64;

            var engine = new DOK.Engine({
                    canvas: canvas,
            });

            engine.renderer.domElement.style.position = "absolute";
            engine.renderer.domElement.style.left = 0;
            engine.renderer.domElement.style.top = 0;

            engine.scene.add( new THREE.AmbientLight( 0xcccccc ) );
            var light = new THREE.PointLight( 0xffffff, 1, 0, 5 );
            light.position.set( -50, 250, 50 );
            engine.scene.add( light );

            var spriteRenderer = new DOK.SpriteRenderer();
            spriteRenderer.curvature = 1;
            var camHandler = new CameraHandler(DOK.Camera.getCamera(), engine.renderer.domElement, cellSize);
            var tilesView = new TilesView(camHandler, spriteRenderer, cellSize, game);
            var agentsView = new AgentsView(camHandler, spriteRenderer, tilesView, cellSize, game);
            var infoView = new InfoView(camHandler, game);

            engine.scene.add(spriteRenderer.mesh);

            DOK.SpriteRenderer.setIndexProcessor(function (images, count) {
                for(var i=0; i<count;i++) {
                    var image = images[i];
                    image.zIndex += image.spriteObject.type==="face"
                        ?10000
                        :0;
                }
            });

            DOK.Loop.fps = 45;

            function initialize() {
                DOK.Loop.addLoop(function() {
                    if(engine.ready) {
                        camHandler.update();
                        tilesView.update();
                        agentsView.update();
                        infoView.update();
                        spriteRenderer.updateGraphics();
                    }
                });
            }

            this.start = initialize;
            window.game= game;
        };
        return WorldViewer;
    });
