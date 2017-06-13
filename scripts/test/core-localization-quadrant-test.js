define([
    'chai',
    'lodash',
    'testWrapper',
    '../core/localization/quadrant-manager.js',
    '../core/localization/quadrant.js',
],
function(chai, _, testWrapper, QuadrantManager, Quadrant) {
    var expect = chai.expect;
    var mainName = 'core-localization-quadrant';

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
});
