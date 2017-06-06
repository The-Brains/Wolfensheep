define(['lodash'], function(_) {
    var Location = function(x, y) {
        if(!_.isNumber(x) || !_.isNumber(y)) {
            throw new Error('X and Y has to be numbers.');
        }
        var locX = x;
        var locY = y;

        this.getX = function() {
            return locX;
        };

        this.getY = function() {
            return locY;
        };

        this.serialize = function() {
            return locX + '-' + locY;
        };

        this.distance = function(location) {
            var xx = location.getX() - locX;
            var yy = location.getY() - locY;

            return Math.sqrt(xx*xx + yy*yy);
        };

        this.equals = function(location) {
            return location.getX() === locX && location.getY() === locY;
        };

        this.serialized = this.serialize();
    };

    Location.deserialize = function(input) {
        var piece = _.split(input, '-');
        return new Location(_.parseInt(piece[0]), _.parseInt(piece[1]));
    }

    return Location;
});
