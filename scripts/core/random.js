define(
    ['seedRandom', 'lodash'],
    function(seedRandom, _) {
        var Generator = function(seed = null) {
            var indexGenerator = 0;
            var myself = this;
            this.myGenerator = new Math.seedrandom(seed);

            this.getInt = function(min, max) {
                return Math.floor(this.getFloatInRange(min, max));
            }

            this.getFloatInRange = function(min, max) {
                return (this.getFloat() * Math.abs(max - min)) + min;
            }

            this.getFloat = function() {
                indexGenerator++;
                return this.myGenerator();
            }

            this.get32Int = function() {
                return this.getInt(0, Number.MAX_SAFE_INTEGER);
            }

            this.getChar = function(dictionary) {
                if (!dictionary) {
                    dictionary =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_=+~;:"<>,./?|';
                }
                return dictionary[this.getInt(0, dictionary.length)];
            }

            this.advanceGeneration = function(steps) {
                _.times(steps, () => {
                    myself.getFloat();
                });
            }

            this.getGeneration = function() {
                return indexGenerator;
            }
        };

        return Generator;
    }
);
