define([ 'dok/utils', 'dok/loop' ], function(Utils, Loop) {
    'use strict';

    var index = 0;
    var imageQueue = [];
    var loadLimit = 3;
    var loading = 0;
    var loadingBar = null;
    var visualProgress = 0;
    var onLoadCallback = null;
    var loaded = 0;
    var loadTotal = 0;

    /**
     *  FUNCTION DEFINITIONS
     */
    function setOnLoad(onLoad) {
        onLoadCallback = onLoad;
        document.body.removeChild(getLoadingBar());
    }

    function loadImage(url,onLoad) {
        var image = new Image();
        image.onload = function(event) {
            onLoad.call(image,event);
            loading--;
            loaded++;
            checkLoad();
        };
        image.crossOrigin = '';
        imageQueue.push({
            image: image,
            url: url,
        });
        loadTotal++;
        checkLoad();
        return image;
    }

    function loadFile(url,onLoad) {
        loadTotal++;
        Utils.loadAsync(url, function(result) {
            loaded++;
            onLoad(result);
        });
    }

    function checkLoad() {
        while(index<imageQueue.length && loading<loadLimit) {
            imageQueue[index].image.src = imageQueue[index].url;
            index++;
            loading++;
        }
        if(index===imageQueue.length) {
            index = 0;
            imageQueue.length = 0;
            loaded = 0;
            loadTotal = 0;
        }
    }

    function getLoadingProgress() {
        return !loadTotal ? 1 : loaded / loadTotal;
    }

    function refreshLoadingBar() {
        if(loadingBar) {
            var ctx = loadingBar.getContext("2d");
            var actualProgress = getLoadingProgress();
            visualProgress = Math.max(0,visualProgress + (actualProgress-visualProgress)/10);
            if(actualProgress>=1) {
                visualProgress = 1;
                Loop.removeLoop(refreshLoadingBar);
            }
            ctx.fillRect(10,10,(loadingBar.width-20)*visualProgress,loadingBar.height-20);

            if(actualProgress>=1) {
                if(onLoadCallback) {
                    setTimeout(onLoadCallback,100);
                }
            }
        }
    }

    function getLoadingBar() {
        if(!loadingBar) {
            loadingBar = document.createElement("canvas");
            loadingBar.id = "loading";
            loadingBar.width = Math.round((innerWidth*2)*2/3);
            loadingBar.height = 50;
            loadingBar.style.left = (innerWidth/2-loadingBar.width/4)+"px";
            loadingBar.style.top = (innerHeight/2-loadingBar.height/4)+"px";
            loadingBar.style.width = (loadingBar.width/2) + "px";
            loadingBar.style.height = (loadingBar.height/2) + "px";
            loadingBar.style.position = "absolute";
            loadingBar.style.backgroundColor = "white";
            loadingBar.style.border = "10px double #00DDDD";
            var ctx = loadingBar.getContext("2d");
            ctx.fillStyle="#0066aa";
            Loop.addLoop(refreshLoadingBar);
        }
        document.body.appendChild(loadingBar);
        return loadingBar;
    }

    function destroyEverything() {
        imageQueue.length = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Loader() {
    }

    Loader.loadImage = loadImage;
    Loader.loadFile = loadFile;
    Loader.getLoadingProgress = getLoadingProgress;
    Loader.getLoadingBar = getLoadingBar;
    Loader.setOnLoad = setOnLoad;

    Utils.onDestroy(destroyEverything);

    return Loader;
});