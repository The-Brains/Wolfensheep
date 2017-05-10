function ViewModel() {

    function Creature() {
        this.from = [0,0,0];
        this.to = [0,0,0];
        this.time_start = 0;
        this.time_end = 0;
        this.position = [0,0,0];
        this.updatePosition = function (time) {
            var progress = Math.min(
                1,
                (time - this.time_start) / (this.time_end - this.time_start)
            );
            var anti = 1-progress;
            this.position[0] = (this.from[0] * anti + this.to[0] * progress);
            this.position[1] = (this.from[1] * anti + this.to[1] * progress);
            this.position[2] = (this.from[2] * anti + this.to[2] * progress);
        };
        this.getPosition = function (time) {
            this.updatePosition(time);
            return this.position;
        }
    }

    var creatures = {};
    function updateModel(action) {
        if(action) {
            var id = action.id;
            var from = action.from;
            var to = action.to;
            if(!creatures[id]) {
                creatures[id] = new Creature();
            }
            var creature = creatures[id];
            creature.from.copy(action.from);
            creature.to.copy(action.to);
            creature.time_start = action.time_start;
            creature.time_end = action.time_end;
        }
    }

    function forEach(callback, time) {
        for(var id in creatures) {
            callback(id, creatures[id], time);
        }
    }

    this.updateModel = updateModel;
    this.forEach = forEach;
}