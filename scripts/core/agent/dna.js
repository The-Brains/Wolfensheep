define(
    ['../../util/conversionDNATable.js'],
    function(convertDNAKeys) {
        var classDNA = function() {
            this.dna = {};
        };

        classDNA.prototype = {
            serialize: function() {
                var output = '';
                _.forEach(this.getAllKeys(), (key) => {
                    var keyID = convertDNAKeys[key];
                    var value = this.get(key);
                    output += "${keyID}:${value}||";
                });

                return btoa(output);
            },
            deserialize: function(input) {
                var pairs = _.split(input, '||');
                _.forEach(pairs, (pair) => {
                    var pieces = _.split(pair, ':');
                    var keyID = pieces[0];
                    var value = pieces[1];
                    var key = convertDNAKeys[keyID];

                    this.set(key, value);
                });
            },
            getAllKeys: function() {
                return _.keys(dna);
            },
            set: function(key, value) {
                if (!convertDNAKeys[key]) {
                    throw new Error('Unknown DNA key: ' + key + '.');
                }
                var returnValue = !!(dna[key]);
                dna[key] = value;
                return returnValue;
            },
            get: function(key) {
                return dna[key];
            },
        };

        return classDNA;
    }
);
