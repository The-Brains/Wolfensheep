define([
    'lodash',
    './location.js',
    '../../util/round.js',
], function(_, Location, Round) {
    var Quadrant = function(
            depth,
            upLeftLoc,
            downRightLoc,
            parent,
            quadID,
            indexPath,
            globalWidth,
            globalHeight
        ) {
        var myself = this;
        var currentWidth = Round(globalWidth / Math.pow(2, depth), 2);
        var currentHeight = Round(globalHeight / Math.pow(2, depth), 2);
        var childs = null;
        this.serialized = '';

        if (Round(upLeftLoc.getX() + currentWidth - downRightLoc.getX(), 2) > 0.01
            || Round(upLeftLoc.getY() + currentHeight - downRightLoc.getY(), 2) > 0.01) {
            debugger;
            throw new Error(`[Quadrant] Corrupted coordinate: W: ${currentWidth}, H:
                ${currentHeight}, UpLeft: ${upLeftLoc.serialize()},
                DownRight: ${downRightLoc.serialize()}`);
        }

        var middleX = (upLeftLoc.getX() + downRightLoc.getX()) / 2;
        var middleY = (upLeftLoc.getY() + downRightLoc.getY()) / 2;

        this.getWidth = () => {
            return currentWidth;
        }

        this.getHeight = () => {
            return currentHeight;
        }

        this.getUpperLeftLocation = () => {
            return upLeftLoc;
        }

        this.getBottomRightLocation = () => {
            return downRightLoc;
        }

        var createChild = (quadID, childUpLeftLoc, childDownRightLoc) => {
            try {
                var newQuadPath = _.concat(indexPath, quadID);

                return new Quadrant(
                    depth + 1,
                    childUpLeftLoc,
                    childDownRightLoc,
                    this,
                    quadID,
                    newQuadPath,
                    globalWidth,
                    globalHeight
                );
            } catch (error) {
                debugger;
                return null;
            }
        }

        var createAllChild = () => {
            if (childs) {
                return childs;
            }

            if (currentWidth <= 1 && currentHeight <= 1) {
                return null;
            }

            var middleLeftLoc = new Location(upLeftLoc.getX(), middleY);
            var topMiddleLoc = new Location(middleX, upLeftLoc.getY());
            var bottomMiddleLoc = new Location(middleX, downRightLoc.getY());
            var middleLoc = new Location(middleX, middleY);
            var middleRightLoc = new Location(downRightLoc.getX(), middleY);

            childs = [
                createChild(0, upLeftLoc, middleLoc),
                createChild(1, topMiddleLoc, middleRightLoc),
                createChild(2, middleLeftLoc, bottomMiddleLoc),
                createChild(3, middleLoc, downRightLoc),
            ];

            return childs;
        }

        this.getChilds = () => {
            return createAllChild();
        }

        this.getChild = (index) => {
            return createAllChild()[index];
        }

        this.getDepth = () => {
            return depth
        }

        this.getQuadrantID = () => {
            return quadID;
        }

        this.getParent = () => {
            return parent;
        }

        var buildID = (acc = []) => {
            if (!this.serialized) {
                this.serialized = _.reduce(_.concat(['root'], indexPath), (result, id) => {
                    result = result + '-' + id;
                    return result;
                }, '').slice(1);
            }

            return this.serialized
        }

        this.getID = () => {
            return buildID();
        }

        this.getPathIndex = () => {
            return indexPath;
        }

        this.serialize = () => {
            return this.getID();
        }

        this.getSmallerChildrenForLocation = (location, acc = []) => {
            if (location.getX() < upLeftLoc.getX()
                || location.getX() >= downRightLoc.getX()
                || location.getY() < upLeftLoc.getX()
                || location.getY() >= downRightLoc.getY()) {
                throw new Error('[Quadrant] Something bad happen while searching for quadrant');
            }

            index = -1;

            if (location.getX() < middleX && location.getY() < middleY) {
                index = 0;
            } else if (location.getX() >= middleX && location.getY() < middleY) {
                index = 1
            } else if(location.getX() < middleX && location.getY() >= middleY) {
                index = 2
            } else if (location.getX() >= middleX && location.getY() >= middleY) {
                index = 3
            } else {
                throw new Error('[Quadrant] Something bad happened');
            }

            if (!this.getChilds()) {
                return acc;
            }

            var child = this.getChilds()[index];
            if (!child) {
                return acc;
            }
            return child.getSmallerChildrenForLocation(location, _.concat(acc, child));
        }

        buildID();
    };

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
