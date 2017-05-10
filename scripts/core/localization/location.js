define(['lodash'], function(_) {
    var Location = function(x, y) {
        if(!_.isNumber(x) || !_.isNumber(y)) {
            throw new Error('X and Y has to be numbers.');
        }
        this.x = x;
        this.y = y;

        this.getX = function() {
            return this.x;
        };

        this.getY = function() {
            return this.y;
        };

        this.serialize = function() {
            return this.x + '-' + this.y;
        }
    };

    Location.deserialize = function(input) {
        var piece = _.split(input, '-');
        return new Location(_.parseInt(piece[0]), _.parseInt(piece[1]));
    }

    return Location;
});
