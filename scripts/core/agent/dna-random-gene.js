define(
    ['../random.js'],
    function(Generator) {
        var DNA_LENGTH = 512;

        var classDNA = function(seed) {
            var myself = this;
            this.seed = seed;
            this.generator = new Generator(seed);
            this.dna = '';
            _.times(DNA_LENGTH, function() {
                myself.dna = myself.dna + myself.generator.getChar(
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_=+~;:"<>,./?|'
                );
            });

            this.serialize = function() {
                return this.seed;
            };

            this.getDNA = function() {
                return this.dna;
            }
        };

        classDNA.deserialize = function(input) {
            return new classDNA(input);
        };

        return classDNA;
    }
);
