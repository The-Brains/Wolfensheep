define([
    'chai',
    'testWrapper',
    '../core/game.js',
],
function(chai, testWrapper, Game) {
    var expect = chai.expect;
    var mainName = 'core-game';

    testWrapper.execTest(mainName, 'should generate World', function() {
        var game = new Game('nice seed', 5, 5);
        expect(game.getWorld()).to.exist;
    });

    testWrapper.execTest(mainName, 'should have correct dimensions', function() {
        var game = new Game('nice seed', 5, 5);
        expect(game.getWidth()).to.equal(5);
        expect(game.getHeight()).to.equal(5);
        expect(game.getWorld().getWidth()).to.equal(5);
        expect(game.getWorld().getHeight()).to.equal(5);
    });

    testWrapper.execTest(mainName, 'should create agent', function() {
        var game = new Game('nice seed', 5, 5);
        expect(game.getWorld().addNewAgent()).to.exists;
    });

    testWrapper.execTest(mainName, 'should json/parse json', function() {
        var expectedGame = new Game('nice seed', 5, 5);
        var expectedSerialization = expectedGame.toJson();
        var resultGame = Game.parseFromJson(expectedSerialization);
        var resultSerialization = resultGame.toJson();
        expect(resultSerialization).to.eql(expectedSerialization);
    });
});
