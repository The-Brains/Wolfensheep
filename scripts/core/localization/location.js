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

        this.toString = function() {
            return this.serialize();
        }

        this.distance = function(location) {
            var xx = location.getX() - locX;
            var yy = location.getY() - locY;

            return Math.sqrt(xx*xx + yy*yy);
        };

        this.equals = function(location) {
            return location.getX() === locX && location.getY() === locY;
        };

        this.getLocationAwayToward = function(distance, target) {
            if (this.equals(target)) {
                return this;
            }
            var slop = (target.getY() - locY) / (target.getX() - locX);

            if (target.getX() === locX) {
                var x = locX;
            } else {
                var delta = Math.sqrt((distance * distance) / (1 + (slop * slop)))
                if (target.getX() > locX) {
                    var x = locX + delta;
                } else {
                    var x = locX - delta;
                }
            }

            if (target.getY() === locY) {
                var y = locY
            } else {
                if (target.getX() === locX) {
                    if (target.getY() > locY) {
                        var y = locY + distance;
                    } else {
                        var y = locY - distance;
                    }
                } else {
                    var y = slop * (x - locX) + locY;
                }
            }

            return new Location(x, y);
        }

        this.serialized = this.serialize();
    };

    Location.deserialize = function(input) {
        var piece = _.split(input, '-');
        return new Location(_.parseInt(piece[0]), _.parseInt(piece[1]));
    }

    return Location;
});
