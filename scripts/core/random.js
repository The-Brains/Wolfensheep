define(
    ['seedRandom'],
    function(seedRandom) {
        var Generator = function(seed = null) {
            this.myGenerator = new Math.seedrandom(seed);

            this.getInt = function(min, max) {
                return Math.floor(this.getFloatInRange(min, max));
            }

            this.getFloatInRange = function(min, max) {
                return (this.myGenerator() * Math.abs(max - min)) + min;
            }

            this.getFloat = function() {
                return this.myGenerator();
            }

            this.get32Int = function() {
                return this.myGenerator.int32();
            }

            this.getChar = function(dictionary) {
                if (!dictionary) {
                    dictionary =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_=+~;:"<>,./?|';
                }
                return dictionary[this.getInt(0, dictionary.length)];
            }
        };

        return Generator;
    }
);
