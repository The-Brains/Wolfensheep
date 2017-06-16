define(
    ['../random.js'],
    function(Generator) {
        var DNA_LENGTH = 512;

        var classDNA = function(seed) {
            var myself = this;
            this.seed = seed;
            this.dna = seed;
            var generator = new Generator(seed);

            var speedSeed = null;
            _.times(DNA_LENGTH, function() {
                speedSeed = speedSeed + generator.getChar();
            });

            this.serialize = function() {
                return this.seed;
            };

            this.getDNA = function() {
                return this.dna;
            };

            this.getSpeedSeed = function() {
                return speedSeed;
            }

            this.toJson = function() {
                return {
                    seed: seed,
                };
            }
        };

        classDNA.parseFromJson = function(json) {
            return new classDNA(json.seed);
        }

        classDNA.deserialize = function(input) {
            return new classDNA(input);
        };

        classDNA.createNewDNA = function(generator) {
            var dna = '';
            _.times(DNA_LENGTH, function() {
                dna = dna + generator.getChar();
            });

            return new classDNA(dna);
        }

        return classDNA;
    }
);
