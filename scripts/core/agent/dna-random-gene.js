define(
    ['../random.js'],
    function(Generator) {
        var DNA_LENGTH = 512;

        var classDNA = function(seed) {
            var myself = this;
            this.seed = seed;
            this.dna = seed;
            this.generator = new Generator(seed);

            this.serialize = function() {
                return this.seed;
            };

            this.getDNA = function() {
                return this.dna;
            };
        };

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
