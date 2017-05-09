define(
    ['../../util/conversionDNATable.js'],
    function(convertDNAKeys) {
        var classDNA = function() {
            this.dna = {};

            this.serialize = function() {
                var output = '';
                _.forEach(this.getAllKeys(), (key) => {
                    var keyID = convertDNAKeys[key];
                    var value = this.get(key);
                    output += "${keyID}:${value}||";
                });

                return btoa(output);
            };

            this.deserialize = function(input) {
                var pairs = _.split(input, '||');
                _.forEach(pairs, (pair) => {
                    var pieces = _.split(pair, ':');
                    var keyID = pieces[0];
                    var value = pieces[1];
                    var key = convertDNAKeys[keyID];

                    this.set(key, value);
                });
            };

            this.getAllKeys = function() {
                return _.keys(this.dna);
            };

            this.setGene = function(key, value) {
                if (!convertDNAKeys[key]) {
                    throw new Error('Unknown DNA key: ' + key + '.');
                }
                var returnValue = !!(this.dna[key]);
                this.dna[key] = value;
                return returnValue;
            };

            this.getGene = function(key) {
                return this.dna[key];
            };
        };

        return classDNA;
    }
);
