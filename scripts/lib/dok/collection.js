define([
    'dok/utils',
    'dok/spritesheet',
    'dok/spriteobject',
    'dok/camera',
], function(Utils, SpriteSheet, SpriteObject, Camera) {

    'use strict';

    function nop() {
    }

    function Collection(options, getSpriteFunction, forEach) {
        this.options = options || {};
        this.getSprite = getSpriteFunction ? getSpriteFunction : nop;
        if(forEach) {
            this.forEach = forEach.bind(this);
        } else {
            switch(this.options.type) {
                case "grid":
                    this.forEach = Grid_forEach.bind(this);
                    break;
                default:
                    Utils.handleError('Collection type not recognized');
                    break;
            }
        }
    }
    Collection.prototype.pos = null;
    Collection.prototype.size = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.forEach = nop;
    Collection.prototype.options = null;
    Collection.prototype.getSprite = nop;
    Collection.prototype.isCollection = true;

    /**
     *  FUNCTION DEFINITIONS
     */
    function Grid_forEach(callback) {
        var count = this.options.count || 1;
        var gridCount = this.options.width*this.options.height;
        var length = gridCount*count;
        for(var i=0; i<length; i++) {
            var x = this.options.x + i%this.options.width;
            var y = this.options.y + Math.floor(i/this.options.width) % this.options.height;
            var c = Math.floor(i / gridCount);
            var obj = this.getSprite(x,y,c);
            if(obj) {
                if(obj.forEach) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    }

    function destroyEverything() {
    }

    function spriteFace(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = cellSize;
        var light = 1;
        var img = SpriteSheet.spritesheet.sprite[index];

        return SpriteObject.create().init(
            x*cellSize,y*cellSize,size/2,
            size,size,
            null,
            light,
            img
        );
    }

    var cubeFaces = [];
    function spriteCube(spriteInfo) {
        cubeFaces.length = 0;

        cube.faces.push(
            SpriteObject.create().init(
                x*cellSize,y*cellSize,size/2,
                size,size,
                Camera.quaternions.southQuaternionArray,
                light,
                img
            )
        );


        return cubeFaces;
    }

    function createSpriteCollection(options) {
        var spriteMap = [];
        var areaSize = 50;
        var spriteRegistry = {};
        var cellSize = 64;

        var spriteFunction = function(spriteInfo) {
            switch(spriteInfo.type) {
                case 'face':
                    return spriteFace(spriteInfo);
                    break;
                case 'cube':
                    return spriteCube(spriteInfo);
                    break;
            }
        };
        if(options.spriteFunction) {
            spriteFunction = options.spriteFunction;
        }

        var spriteCount = 0;
        function SpriteInfo(x,y,index) {
            this.uid = 'uid'+spriteCount++;
            spriteRegistry[this.uid] = this;
            this.index = index;
            this.enterArea(x,y);
        }
        SpriteInfo.prototype.leaveArea = function() {
            var areaId = getAreaId(this.x,this.y);
            var area = spriteMap[areaId];
            if(area) {
                var posId = Math.floor(this.x) + "_" + Math.floor(this.y);
                if(area[posId])
                    delete area[posId][this.uid];
            }
        };
        SpriteInfo.prototype.enterArea = function(x,y) {
            this.x = x; this.y = y;
            var areaId = getAreaId(this.x,this.y);
            var area = spriteMap[areaId] || (spriteMap[areaId] = {});
            var posId = Math.floor(this.x) + "_" + Math.floor(this.y);
            area[posId] = area[posId] || (area[posId] = {});
            area[posId][this.uid] = this;
        };
        SpriteInfo.prototype.move = function(x,y) {
            this.leaveArea();
            this.enterArea(x,y);
        };


        function getAreaId(x,y) {
            x = Math.floor(x/areaSize);
            y = Math.floor(y/areaSize);
            return x+"_"+y;
        }

        var selectedObj = { x: 0, y: 0};
        function getCamPos() {
            var cellSize = 64;
            var camera = Camera.getCamera();
            var xPos = camera.position.x;
            var yPos = camera.position.y;

            selectedObj.x = Math.round(xPos/cellSize);
            selectedObj.y = Math.round(yPos/cellSize) + 6;
            return selectedObj;
        }


        var spriteCollection = new Collection(
            options,
            spriteFunction,
            function(callback) {
                var camPos = getCamPos();
                var xArea = Math.floor(camPos.x / areaSize);
                var yArea = Math.floor(camPos.y / areaSize);
                var range = 1;
                for(var y=yArea-range;y<=yArea+range;y++) {
                    for(var x=xArea-range;x<=xArea+range;x++) {
                        var area = spriteMap[x+"_"+y];
                        if(area) {
                            for(var a in area) {
                                var sprites = area[a];
                                for(var s in sprites) {
                                    var obj = this.getSprite(sprites[s]);
                                    if(Array.isArray(obj)) {
                                        obj.forEach(callback);
                                    } else {
                                        callback(obj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        );
        spriteCollection.create = function(x,y,index) {
            return new SpriteInfo(x,y,index);
        };

        spriteCollection.get = function(x,y) {
            var areaId = getAreaId(x,y);
            var area = spriteMap[areaId];
            var posId = Math.floor(x) + "_" + Math.floor(y);
            return area?area[posId]:null;
        };
        spriteCollection.find = function(uid) {
            return spriteRegistry[uid];
        }
        return spriteCollection;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    Collection.createSpriteCollection = createSpriteCollection;

    /**
     *   PROCESSES
     */
    Utils.onDestroy(destroyEverything);


    return Collection;
});