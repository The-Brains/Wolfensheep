define(function() {
    /**
     *  FUNCTION DEFINITIONS
     */
    function fixPath() {
        var regex = /\/$|index\.html$|next\.html$/g;
        if (!regex.exec(location.pathname)) {
            window.history.pushState(null,"", location.pathname+"/"+location.search+location.hash);
        }
    }

    function changeScene(scene, htmlFile) {
        if(typeof(htmlFile)==='undefined') {
            htmlFile = 'scene.html';
        }
        Utils.destroyEverything();
        location.replace("../" + scene + "/" + htmlFile);
    }

    function handleError(error, soft) {
        if(Array.isArray(error)) {
            var array = [];
            for(var i=0;i<error.length;i++) {
                array.push(error[i]);
                array.push("\n ");
            }
            console.error.apply(null, array);
        } else {
            console.error(error);
        }
        Utils.lastError = error;
        if(!soft) {
            throw new Error("Last error terminated the process.");
        }
    }

    function combineMethods(firstMethod, secondMethod) {
        return function() {
            if(firstMethod)
                firstMethod();
            if(secondMethod)
                secondMethod();
        };
    }

    function expectParams(args) {
        assert(typeof(args) === 'object', "Pass 'arguments' to expectParams");

        for(var i=1; i<arguments.length; i++) {
            var type = args[i-1]===null? 'null' : Array.isArray(args[i-1])?'array' : typeof(args[i-1]);
            assert(
                arguments[i].split("|").indexOf(type)>=0,
                ["Expected argument "+(i-1)+" to be "+arguments[i]+" NOT "+type, args]
            );
        }
    }

    function checkParams(args) {
        assert(typeof(args) === 'object', "Pass 'arguments' to expectParams");

        for(var i=1; i<arguments.length; i++) {
            var type = args[i-1]===null? 'null' : Array.isArray(args[i-1])?'array' : typeof(args[i-1]);
            if(arguments[i].split("|").indexOf(type)<0) {
                return false;
            }
        }
        return true;
    }

    function assert(condition, message) {
        if(!condition) {
            handleError(message ? message: "Assert failed: condition not met.");
        }
    }

    function cleanUp() {
        Utils.destroyEverything();
    }

    function setupExit() {
        document.onbeforeunload = window.onbeforeunload = cleanUp;
    }

    var destroyEverything = function() {};
    function onDestroy(callback) {
        destroyEverything = Utils.combineMethods(callback, destroyEverything);
    }

    function definePrototypes() {
        if(typeof(String.prototype.trim) === "undefined") {
            String.prototype.trim = function() {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }

        if ( !window.requestAnimationFrame ) {
            setupRequestAnimationFrame();
        }

        if (typeof(Float32Array.prototype.fill) === 'undefined') {
            Float32Array.prototype.fill = fill_compat;
        }

        if (typeof(Uint32Array.prototype.fill) === 'undefined') {
            Uint32Array.prototype.fill = fill_compat;
        }

        Array.prototype.getFrame = function (index) {
            index = index|0;
            return this[index % this.length];
        };
        Number.prototype.getFrame = function () {
            return this;
        }

    }

    function fill_compat(value,start,end) {
        start = start||0;
        end = end||this.length;
        for(var i=start;i<end;i++) {
            this[i] = value;
        }
        return this;
    }

    function setupRequestAnimationFrame() {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                requestAnimationFrame_compat;

        } )();

        var timeout, time = 0;
        function requestAnimationFrame_compat( callback) {
            timeout = setTimeout( timeoutCallback, 1000 / 60 , callback);
        }

        function timeoutCallback(callback) {
            clearTimeout(timeout);
            var dt = Date.now() - time;
            callback(dt);
            time = Date.now();
        }
    }

    function loadAsyncHelper(src, result, index, callback, binary, method, data) {
        loadAsync(src, function(value) {
            result[index] = value;
            for(var i=0; i<result.length; i++) {
                if(result[i]===undefined) {
                    return;
                }
            }
            callback.apply(null, result);
        }, binary, method, data);
    }

    function loadAsync(src, callback, binary, method, data) {
        if(Array.isArray(src)) {
            var result = new Array(src.length);
            for(var i=0; i<src.length; i++) {
                loadAsyncHelper(src[i], result, i, callback);
            }

        } else {
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType(binary ? "text/plain; charset=x-user-defined" : "text/plain; charset=UTF-8");
            xhr.open(method?method:"GET", src, true);
            xhr.addEventListener('load',
                function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            callback(xhr.responseText);
                        } else {
                            handleError(xhr.responseText);
                        }
                    }
                }
            );
            xhr.addEventListener('error',
                function (e) {
                    handleError(e);
                }
            );
            xhr.send(data);
        }
    }

    //      C
    //     748
    //    B3019
    //     625
    //      A


    function Roundabout() {
        this.x = 0;
        this.y = 0;
        this.left = -1;
        this.right = 1;
        this.top = -1;
        this.bottom = 1;
        this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up

        var point = [0,0];

        this.reset = function() {
            this.x = 0;
            this.y = 0;
            this.left = -1;
            this.right = 1;
            this.top = -1;
            this.bottom = 1;
            this.direction = 0; //  0-right, 1-bottom, 2-left, 3-up
        };

        this.current = function() {
            point[0] = this.x;
            point[1] = this.y;
            return point;
        };

        this.next = function () {
            var point = this.current();
            switch(this.direction) {
                case 0:
                    this.x++;
                    if(this.x >= this.right) {
                        this.right++;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
                case 1:
                    this.y++;
                    if(this.y >= this.bottom) {
                        this.bottom++;
                        this.direction = (this.direction+1)%4;
                    }
                    break;
                case 2:
                    this.x--;
                    if(this.x <= this.left) {
                        this.left--;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
                case 3:
                    this.y--;
                    if(this.y <= this.top) {
                        this.top--;
                        this.direction = (this.direction+1)%4;  //  change dir
                    }
                    break;
            }
            return point;
        }
    }

    function addLinkToHeadTag(rel, href) {
        var link = document.createElement("link");
        link.setAttribute("rel", rel);
        link.href = href;
        document.head.appendChild(link);
    }

    function getTitle() {
        return title;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    var title = "";


    function Utils() {
        this.lastError = null;
    }
    Utils.handleError = handleError;
    Utils.changeScene = changeScene;
    Utils.destroyEverything = destroyEverything;
    Utils.combineMethods = combineMethods;
    Utils.expectParams = expectParams;
    Utils.checkParams = checkParams;
    Utils.assert = assert;
    Utils.fixPath = fixPath;
    Utils.onDestroy = onDestroy;
    Utils.loadAsync = loadAsync;
    Utils.Roundabout = Roundabout;
    Utils.getTitle = getTitle;

    /**
     *   PROCESSES
     */
    setupExit();
    definePrototypes();

/*    loadAsync("package.json", function(str) {
        try {
            var object = JSON.parse(str);
            var icon = object.window.icon || require.toUrl('images/logo.ico');
            document.title = object.window.title || 'Dobuki Game';
            addLinkToHeadTag("shortcut icon", icon);
            addLinkToHeadTag("apple-touch-icon", object.window['apple-touch-icon'] || icon);
        } catch(e) {
        }
    });
*/

    return Utils;
});
