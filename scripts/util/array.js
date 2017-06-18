define(function() {
    var makeTwoDimensional = function(firstDimension, secondDimension) {
        var array = new Array(firstDimension);
        for (var i = 0; i < array.length; i++) {
            array[i] = new Array(secondDimension);
        }
        return array;
    };

    return {
        makeTwoDimensional: makeTwoDimensional,
    };
});
