define([ 'dok/utils' ], function(Utils) {

    'use strict';

    var spot = {x:0,y:0}, callbacks = [];
    var touchSpotX = {}, touchSpotY = {};
    var mdown = false;

    /**
     *  FUNCTION DEFINITIONS
     */   
    function onDown(e)
    {
        if(e.target.attributes['tap']===undefined) {
            var touches = e.changedTouches;
            if(touches) {
                for(var i=0;i<touches.length;i++) {
                    var touch = touches[i];
                    touchSpotX[touch.identifier] =touch.pageX;
                    touchSpotY[touch.identifier] =touch.pageY;
                }
            } else {
                spot.x = e.pageX;
                spot.y = e.pageY;
            }
            mdown = true;
            for(var i=0;i<callbacks.length;i++) {
                callbacks[i](null,null,true,e.pageX,e.pageY);
            }
        }
        e.preventDefault();
    }
    
    function onUp(e) {

        var hasTouch = false;
        if(e.changedTouches) {
            for(var i=0;i<e.changedTouches.length;i++) {
                delete touchSpotX[touch.identifier];
                delete touchSpotY[touch.identifier];
            }
            for(var i in touchSpotX) {
                hasTouch = true;
            }

        }

        for(var i=0;i<callbacks.length;i++) {
            callbacks[i](null,null, hasTouch,e.pageX,e.pageY);
        }
        mdown = false;
        e.preventDefault();
    }
    
    function onMove(e) {
        e = e || event;
        var touches = e.changedTouches;
        if(!touches) {
            var buttonDown = ('buttons' in e) && e.buttons===1 || (e.which || e.button) ===1;

            if(buttonDown && mdown) {
                var newX = e.pageX;
                var newY = e.pageY;
                var dx = newX - spot.x;
                var dy = newY - spot.y;
                spot.x = newX;
                spot.y = newY;
                for(var i=0;i<callbacks.length;i++) {
                    callbacks[i](dx,dy,true,e.pageX,e.pageY);
                }
            } else {
                mdown = false;
                for(var i=0;i<callbacks.length;i++) {
                    callbacks[i](dx,dy,false,e.pageX,e.pageY);
                }
            }
        } else if(mdown) {
            var dx = 0, dy = 0;
            for(var i=0;i<touches.length;i++) {
                var touch = touches[i];
                dx += touch.pageX - touchSpotX[touch.identifier];
                dy += touch.pageY - touchSpotY[touch.identifier];
                touchSpotX[touch.identifier] = touch.pageX;
                touchSpotY[touch.identifier] = touch.pageY;
            }
            for(var i=0;i<callbacks.length;i++) {
                callbacks[i](dx,dy,true,e.pageX,e.pageY);
            }
        }
        e.preventDefault();
    }

    function setOnTouch(func) {
        deactivateTouch();
        activateTouch();
        callbacks.push(func);
    }

    function activateTouch() {

        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchend", onUp);
        document.addEventListener("touchcancel", onUp);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove);
    }

    function deactivateTouch() {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("touchstart", onDown);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
        document.removeEventListener("touchcancel", onUp);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
    }

    function destroyEverything() {
        callbacks = [];
        deactivateTouch();
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    function Mouse() {
    }
    Mouse.setOnTouch = setOnTouch;

    Utils.onDestroy(destroyEverything);

    return Mouse;

 });