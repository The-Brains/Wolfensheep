define([
        'dobuki',
        './imagestore.js',
        '../core/localization/location.js',
    ],
    function(DOK, ImageStore, Location) {
        return function (cameraHandler, game) {
            var roundabout = new DOK.Utils.Roundabout();

            function getClosestAgentsPosition(x,y,limit) {
                x = Math.round(x);
                y = Math.round(y);
                roundabout.reset();

                for(var i=0; i<limit; i++) {
                    var pos = roundabout.next();
                    var loc = new Location(x+pos[0],y+pos[1]);
                    var agents = game.getWorld().getAgentsAt(loc);
                    if(agents) {
                        for(var a in agents) {
                            return loc;
                        }
                    }
                }
                return null;
            }

            function update() {
                var camPos = cameraHandler.getCamPos();
                var point = getClosestAgentsPosition(camPos.x, camPos.y, 20);
                if(point) {
                    var agents = game.getWorld().getAgentsAt(point);
                    console.log(agents);
                }
            }

            this.update = update;
        };
    });
