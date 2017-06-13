define(
    [
        'chai',
        'testWrapper',
        '../core/localization/quadrant-manager.js',
        '../core/localization/location.js',
    ],
    function(chai, testWrapper, QuadrantManager, Location) {
        var expect = chai.expect;
        var mainName = 'core-localization-quadrantManager';

        testWrapper.execTest(mainName, 'should have valid root quadrant', function() {
            var quadManager = new QuadrantManager(100, 100);
            var rootQuad = quadManager.getRootQuadrant();
            expect(rootQuad.getWidth()).to.equal(100);
            expect(rootQuad.getHeight()).to.equal(100);
        });

        testWrapper.execTest(mainName, 'should have valid childs', function() {
            var quadManager = new QuadrantManager(100, 100);
            var rootQuad = quadManager.getRootQuadrant();
            var childs = rootQuad.getChilds();

            var testChilds = (childs, sizeExpected, expectedDepth) => {
                expect(childs).to.exist;
                expect(childs.length).to.equal(4);

                _.forEach(childs, (child) => {
                    expect(child).to.exist;
                    expect(child.getWidth()).to.equal(sizeExpected);
                    expect(child.getHeight()).to.equal(sizeExpected);
                    expect(child.getDepth()).to.equal(expectedDepth);

                    if (_.isNil(child.getChilds())) {
                        expect(child.getWidth()).to.be.at.most(1);
                        expect(child.getHeight()).to.be.at.most(1);
                    } else {
                        testChilds(child.getChilds(), sizeExpected / 2, expectedDepth + 1);
                    }
                });
            }

            testChilds(childs, 100 / 2, 1);
        });

        testWrapper.execTest(mainName, 'should be able to get root quad with indexes path', function() {
            var quadManager = new QuadrantManager(100, 100);
            var rootQuad = quadManager.getRootQuadrant();
            var quad = quadManager.getQuadrantPerIndexes([]);
            expect(rootQuad.getID()).to.equal('root');
            expect(quad.getID()).to.equal(rootQuad.getID());
        });

        testWrapper.execTest(mainName, 'should return correct quad after series of indexes', function() {
            var quadManager = new QuadrantManager(100, 100);
            var quad = quadManager.getQuadrantPerIndexes([0, 0, 0]);
            expect(quad.getWidth()).to.equal(100 /2 /2 /2);
            expect(quad.getHeight()).to.equal(100 /2 /2 /2);
            expect(quad.getDepth()).to.equal(3);
            expect(quad.getID()).to.equal('root-0-0-0');
        });

        testWrapper.execTest(mainName, 'should have coherent path indexes', function() {
            var quadManager = new QuadrantManager(100, 100);
            var pathIndexes = [0, 0, 0];
            var quad = quadManager.getQuadrantPerIndexes(pathIndexes);
            expect(quad.getPathIndex()).to.eql(pathIndexes);
        });

        testWrapper.execTest(mainName, 'should get correct quads chain from coordinate', function() {
            var quadManager = new QuadrantManager(100, 100);
            var locX = 25;
            var locY = 50;
            var quads = quadManager.getQuadrantsForCoordinate(new Location(locX, locY));
            _.forEach(quads, (quad) => {
                expect(quad.getUpperLeftLocation().getX()).to.be.at.most(locX);
                expect(quad.getUpperLeftLocation().getY()).to.be.at.most(locY);
                expect(quad.getBottomRightLocation().getX()).to.be.above(locX);
                expect(quad.getBottomRightLocation().getY()).to.be.above(locY);
            });
        });
    }
);
