define(function() {
    Array.prototype.copy = function(array) {
        for(var i=0; i<array.length;i++) {
            this[i] = array[i];
        }
    };
});