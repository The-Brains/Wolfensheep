define([
    'lodash',
    './location.js',
    './quadrant.js'
], function(_, Location, Quadrant) {
    var QuadrantManager = function(width, height) {
        var rootQuadrant = new Quadrant(
            0,
            new Location(0, 0),
            new Location(width, height),
            null,
            null,
            [],
            width,
            height
        );

        this.getRootQuadrant = () => {
            return rootQuadrant;
        }

        this.getQuadrantPerIndexes = (indexes) => {
            var quad = rootQuadrant;

            _.forEach(indexes, (index) => {
                if (_.isNil(quad)) {
                    return null;
                }
                quad = quad.getChild(index);
            });

            return quad;
        }

        this.getQuadrantsForCoordinate = (location) => {
            if (location.getX() >= width
                || location.getY() >= height) {
                return null;
            }

            return rootQuadrant.getSmallerChildrenForLocation(location, [rootQuadrant]);
        }
    };

    return QuadrantManager;
});
