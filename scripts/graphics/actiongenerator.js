define(function() {
    requirejs([
        'scripts/graphics/viewcore.js',
    ]);

    var ActionGenerator = function () {
        var creatures = {};
        var action = {
            id:null,
            from:[0,0,0],
            to:[0,0,0],
            time_start: 0,
            time_end: 0,
        };
        function fetchAction() {
            //  make a random creature from id1..id10 move to position X,Y
            var id = 'id'+Math.floor(Math.random()*10+1);
            if(!creatures[id]) {
                creatures[id] = {
                    from: [500, 500, 0],
                    to: [500, 500, 0],
                };
            }
            var creature = creatures[id];
            if(creature.end_walk > Date.now()) {
                return null;//   let it finish walking
            }
            creature.from.copy(creature.to);
            var mx = Math.floor((Math.random()-.5)*200);
            var my = Math.floor((Math.random()-.5)*200);
            creature.to[0] += mx;
            creature.to[1] += my;
            creature.end_walk = Date.now() + Math.floor(Math.random()*10000);
            action.id = id;
            action.from.copy(creature.from);
            action.to.copy(creature.to);
            action.time_start = Date.now();
            action.time_end = creature.end_walk;
            return action;
        }

        var interval = 0;
        function generateActions(callback) {
            stop();
            interval = setInterval(function() {
                callback(fetchAction());
            }, 1000);
        }

        function stop() {
            clearInterval(interval);
        }

        this.fetchAction = fetchAction;
        this.generateActions = generateActions;
        this.stop = stop;
    };
    return ActionGenerator;
});
