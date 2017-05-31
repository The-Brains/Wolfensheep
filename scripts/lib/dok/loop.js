define([ 'dok/utils' ], function(Utils) {
    'use strict';

    var coreLoops = null;
    var frame = 0;
    var fps = 0;
    var period = Math.floor(1000/60);
    var nextTime = 0;
    var lastCount = 0;

    var frameCount = 0;
   
    /**
    *  FUNCTION DEFINITIONS
    */
    function loop(time) {
        if(coreLoops) {
            requestAnimationFrame( loop );
            if(time<=Loop.time + period) {
                return;
            }
            Loop.time = Math.floor(time/period)*period;
            for(var i=0;coreLoops && i<coreLoops.length;i++)  {
                coreLoops[i]();
            }
            frameCount ++;
            if(time-lastCount>1000) {
                fps = frameCount;
                frameCount = 0;
                lastCount = time;
            }
        }
    }

    function addLoop(callback) {
        if(coreLoops===null) {
            coreLoops = [];
            beginLoop();
        }
        coreLoops.push(callback);
    }

    function removeLoop(callback) {
        if(coreLoops) {
            var index = coreLoops.indexOf(callback);
            coreLoops.splice(index, 1);
            if(coreLoops.length===0) {
                coreLoops = null;
            }
        }
    }

    function beginLoop() {
        loop(0);
    }

    function loopTime() {
        return performance.now() - Loop.time;
    }

    function destroyEverything() {
        coreLoops = null;
        frame = 0;
        fps = 0;
        period = Math.floor(1000/60);
        nextTime = 0;
        lastCount = 0;
        frameCount = 0;
    }

    /**
    *  PUBLIC DECLARATIONS
    */
    function Loop() {
    }

    Loop.addLoop = addLoop;
    Loop.removeLoop = removeLoop;
    Utils.onDestroy(Loop);

    Object.defineProperty(Loop, "fps", {
        enumerable: false,
        configurable: false,
        get: function () {
            return fps;
        },
        set: function(value) {
            period = Math.floor(1000/value);
        }
    });

    /**
    *   PROCESSES
    */
    Loop.time = 0;

    return Loop;
 });
