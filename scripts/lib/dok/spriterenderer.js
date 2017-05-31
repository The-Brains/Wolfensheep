define([
    'threejs',
    'dok/utils',
    'dok/spriteobject',
    'dok/spritesheet',
    'dok/objectpool',
    'dok/camera',
    'dok/turbosort'
], function(THREE, Utils, SpriteObject, SpriteSheet, ObjectPool, Camera, turboSort) {
    'use strict';

    var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    var pointCount = planeGeometry.attributes.position.count;
    var indices = planeGeometry.index.array;
    var spriteRenderers = [];
    var uniforms = null;
    var indexProcessor = function(){};

    /**
     *  CLASS DEFINITIONS
     */

    function SpriteRenderer() {
        this.images = [];
        this.imageOrder = [];
        this.imageCount = 0;
        this.mesh = createMesh();

        var self = this;

        this.display = function (spriteObject) {
            var image = null;
            var cut = spriteObject && spriteObject.visible !== false
                ? SpriteSheet.getCut(spriteObject.img) : null;
            if (cut && cut.ready) {
                var index = self.imageCount;
                if(!self.images[index]) {
                    self.images[index] = new SpriteImage();
                    self.images[index].index = index;
                }

                image = self.images[index];

                for (var j=0; j<indices.length; j++) {
                    image.indexArray[j] = indices[j] + image.index*4;
                }

                var quat = spriteObject.hasQuaternionArray ? spriteObject.quaternionArray : Camera.getCameraQuaternionData().array;
                if (image.quaternionArray[0] !== quat[0]
                    || image.quaternionArray[1] !== quat[1]
                    || image.quaternionArray[2] !== quat[2]
                    || image.quaternionArray[3] !== quat[3]
                ) {
                    image.quaternionArray.set(quat);
                    image.quaternionArray.set(quat,4);
                    image.quaternionArray.set(quat,8);
                    image.quaternionArray.set(quat,12);
                    image.quatDirty = true;
                }

                if (!spriteObject.position.equals(image.position)) {
                    image.position.copy(spriteObject.position);
                    image.position.toArray(image.spotArray);
                    image.position.toArray(image.spotArray, 3);
                    image.position.toArray(image.spotArray, 6);
                    image.position.toArray(image.spotArray, 9);
                    image.positionDirty = true;
                }

                if (spriteObject.size[0] !== image.size[0]
                    || spriteObject.size[1] !== image.size[1]
                    || spriteObject.size[2] !== image.size[2]
                    || image.positionDirty
                ) {
                    image.size[0] = spriteObject.size[0];
                    image.size[1] = spriteObject.size[1];
                    image.size[2] = spriteObject.size[2];
                    var vertices = planeGeometry.attributes.position.array;
                    for(var v=0; v<vertices.length; v++) {
                        image.vertices[v]
                            = vertices[v] * spriteObject.size[v%3] + image.spotArray[v];
                    }
                    image.verticesDirty = true;
                }

                if(image.uv !== cut.uv) {
                    image.uv = cut.uv;
                    image.uvDirty = true;
                }

                if(image.tex !== cut.tex) {
                    image.tex = cut.tex;
                    image.texDirty = true;
                }

                if(image.light !== spriteObject.light) {
                    image.light = spriteObject.light;
                    image.lightDirty = true;
                }
                image.spriteObject = spriteObject;
                self.imageOrder[index] = image;
                self.imageCount++;
            }
            return image;
        };

        spriteRenderers.push(this);
    }

    SpriteRenderer.prototype.destroy = destroySprite;
    SpriteRenderer.prototype.render = render;
    SpriteRenderer.prototype.updateGraphics = updateGraphics;
    SpriteRenderer.prototype.clear = clear;

    function SpriteImage() {
        this.position = new THREE.Vector3();
        this.spotArray = new Float32Array(3 * pointCount);
        this.size = new Float32Array(3);
        this.vertices = new Float32Array(planeGeometry.attributes.position.array.length);
        this.quaternionArray = new Float32Array(4 * pointCount);
        this.indexArray = new Uint16Array(indices.length);
    }
    SpriteImage.prototype.index = 0;
    SpriteImage.prototype.position = null;
    SpriteImage.prototype.spotArray = null;
    SpriteImage.prototype.indexArray = null;
    SpriteImage.prototype.tex = -1;
    SpriteImage.prototype.size = null;
    SpriteImage.prototype.uv = null;
    SpriteImage.prototype.vertices = null;
    SpriteImage.prototype.light = 1;
    SpriteImage.prototype.zIndex = 0;
    SpriteImage.prototype.quaternionArray = null;
    SpriteImage.prototype.positionDirty = true;
    SpriteImage.prototype.verticesDirty = true;
    SpriteImage.prototype.texDirty = true;
    SpriteImage.prototype.uvDirty = true;
    SpriteImage.prototype.lightDirty = true;
    SpriteImage.prototype.quatDirty = true;
    SpriteImage.prototype.spriteObject = null;

    /**
     *  FUNCTION DEFINITIONS
     */

    function clear() {
        this.imageCount = 0;
        ObjectPool.recycleAll(SpriteObject);
    }

    function createMesh() {
        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array( [
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,

            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0
        ] );
        geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

        Utils.loadAsync(
            [
                require.toUrl("dok/glsl/vertex-shader.glsl"),
                require.toUrl("dok/glsl/fragment-shader.glsl"),
                require.toUrl("dok/glsl/vertex-shader-common.glsl"),
            ],
            function(vertexShader, fragmentShader, vertexShaderCommon) {
                mesh.material = new THREE.ShaderMaterial( {
                    uniforms: uniforms = {
                        texture:  {
                            type: 'tv',
                            get value() { return SpriteSheet.getTextures(); }
                        },
                        vCam : {
                            type: "v3",
                            get value() { return Camera.getCamera().position; }
                        },
                    },
                    vertexShader: vertexShaderCommon + vertexShader,
                    fragmentShader: fragmentShader,
                    transparent:true,
                    depthWrite: false,
                    depthTest: true,
                } );
            }
        );

        mesh.frustumCulled = false;
        return mesh;
    }

    function sortImages(images,count) {
        var camera = Camera.getCamera();
        for (var i = 0; i < count; i++) {
            images[i].zIndex = -camera.position.distanceToManhattan(images[i].position);
        }
        indexProcessor(images, count);
        turboSort(images,count,indexFunction);
    }

    function setIndexProcessor(fun) {
        indexProcessor = fun ? fun : function(){};
    }

    function indexFunction(a) {
        return a.zIndex;
    }

    function render() {
        var imageCount = this.imageCount;
        var pointCount = planeGeometry.attributes.position.count;
        var previousAttribute;

        var mesh = this.mesh;
        var geometry = mesh.geometry;
        if (!geometry.attributes.position || geometry.attributes.position.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.position;
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.position.copyArray(previousAttribute.array);
            geometry.attributes.position.setDynamic(true);
        }
        if (!geometry.attributes.spot || geometry.attributes.spot.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.spot;
            geometry.attributes.spot = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.spot.copyArray(previousAttribute.array);
            geometry.attributes.spot.setDynamic(true);
        }
        if (!geometry.attributes.quaternion || geometry.attributes.quaternion.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.quaternion;
            geometry.attributes.quaternion = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 4), 4
            );
            if(previousAttribute)
                geometry.attributes.quaternion.copyArray(previousAttribute.array);
            geometry.attributes.quaternion.setDynamic(true);
        }
        if (!geometry.attributes.uv || geometry.attributes.uv.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.uv;
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 2), 2
            );
            if(previousAttribute)
                geometry.attributes.uv.copyArray(previousAttribute.array);
            geometry.attributes.uv.setDynamic(true);
        }
        if (!geometry.attributes.tex || geometry.attributes.tex.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.tex;
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.tex.copyArray(previousAttribute.array);
            geometry.attributes.tex.setDynamic(true);
        }
        if (!geometry.attributes.light || geometry.attributes.light.count < imageCount * pointCount) {
            previousAttribute = geometry.attributes.light;
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.light.copyArray(previousAttribute.array);
            geometry.attributes.light.setDynamic(true);
        }
        if (!geometry.index || geometry.index.count < imageCount * planeGeometry.index.array.length) {
            previousAttribute = geometry.index;
            var indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            if(previousAttribute)
                geometry.index.copyArray(previousAttribute.array);
            geometry.index.setDynamic(true);
        }

        sortImages(this.imageOrder, imageCount);
    }

    function updateGraphics() {
        this.render();

        var images = this.images;
        var imageOrder = this.imageOrder;
        var imageCount = this.imageCount;
        var geometry = this.mesh.geometry;
        var geo_quaternion = geometry.attributes.quaternion.array;
        var geo_spot = geometry.attributes.spot.array;
        var geo_pos = geometry.attributes.position.array;
        var geo_tex = geometry.attributes.tex.array;
        var geo_light = geometry.attributes.light.array;
        var geo_uv = geometry.attributes.uv.array;
        var geo_index = geometry.index.array;

        var quatChanged = false;
        var positionChanged = false;
        var texChanged = false;
        var verticesChanged = false;
        var uvChanged = false;
        var lightChanged = false;

        for(var i=0;i<imageCount;i++) {
            var image = images[i];
            var index = image.index;

            if (image.quatDirty) {
                var quaternionArray = image.quaternionArray;
                geo_quaternion.set(quaternionArray, index * 16);
                image.quatDirty = false;
                quatChanged = true;
            }

            if (image.positionDirty) {
                geo_spot.set(image.spotArray, index * 12);
                image.positionDirty = false;
                positionChanged = true;
            }

            if (image.verticesDirty) {
                geo_pos.set(image.vertices, index * 12);
                image.verticesDirty = false;
                verticesChanged = true;
            }

            if (image.uvDirty) {
                geo_uv.set(image.uv, index * 8);
                image.uvDirty = false;
                uvChanged = true;
            }

            if (image.texDirty) {
                geo_tex.fill(image.tex, index * 4, index * 4 + 4);
                image.texDirty = false;
                texChanged = true;
            }

            if (image.lightDirty) {
                geo_light.fill(image.light, index * 4, index * 4 + 4);
                image.lightDirty = false;
                lightChanged = true;
            }
        }

        for(i=0;i<imageCount;i++) {
            geo_index.set(imageOrder[i].indexArray, i * 6);
        }

        if(geometry.drawRange.start !== 0 || geometry.drawRange.count !== imageCount*planeGeometry.index.count) {
            geometry.setDrawRange(0, imageCount*planeGeometry.index.count);
        }

        if(lightChanged) {
            geometry.attributes.light.needsUpdate = true;
        }
        if(quatChanged) {
            geometry.attributes.quaternion.needsUpdate = true;
        }
        if(positionChanged) {
            geometry.attributes.spot.needsUpdate = true;
        }
        if(verticesChanged) {
            geometry.attributes.position.needsUpdate = true;
        }
        if(texChanged) {
            geometry.attributes.tex.needsUpdate = true;
        }
        if(uvChanged) {
            geometry.attributes.uv.needsUpdate = true;
        }
        geometry.index.needsUpdate = true;
        this.clear();
    }

    function destroyEverything() {
        for(var i=0; i<spriteRenderers.length; i++) {
            spriteRenderers[i].destroy();
        }
        spriteRenderers.length = 0;
    }

    function destroySprite() {
        if(this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.mesh = null;
        this.images.length = 0;
        this.imageCount = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    SpriteRenderer.setIndexProcessor = setIndexProcessor;
    Utils.onDestroy(destroyEverything);

    /**
     *   PROCESSES
     */


    return SpriteRenderer;
 });