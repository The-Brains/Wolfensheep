define(
    ['lodash', '../../util/world-parameters.js'],
    function(_, Parameters) {
        var World = function(width, height) {
            this.width = width;
            this.height = height;
            this.world = {};

            this.getWidth = function() {
                return this.width;
            };

            this.getHeight = function() {
                return this.height;
            };

            this.getWorldStatus = function(x, y) {
                var createKey = function(x, y) {
                    return x + '-' + 'y';
                }
                var key = createKey(x,y);
                if(_.has(this.world, key)) {
                    return this.world[key]
                } else {
                    var param = _.map(Parameters, function(p) {
                        return
                    })
                }
            }
        };

        return World;
    }
);
