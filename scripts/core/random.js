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

            this.anyFrom = function(input) {
                var key = null;

                if (!_.isArray(input)) {
                    var keys = _.keys(input);
                    var key = this.getInt(0, _.size(keys));
                    key = _.pullAt(keys, key);
                } else {
                    var key = this.getInt(0, _.size(input));
                }

                return input[key];
            }

            /**
            * Like _.forEach but shuffle the input first.
            */
            this.shuffledForEach = function(input, cb = _.noop) {
                var treatment = null;

                if (!_.isArray(input)) {
                    treatment = _.keys(input);
                }

                var output = [];

                if (_.isArray(input)) {
                    treatment = _.cloneDeep(input);
                }

                while(!_.isEmpty(treatment)) {
                    var key = this.getInt(0, _.size(treatment));
                    var element = _.pullAt(treatment, key);
                    output.push(element[0]);
                }

                if (!_.isArray(input)) {
                    var outputObject = {};
                    _.forEach(output, (key) => {
                        outputObject[key] = input[key];
                        cb(input[key], key);
                    });
                    return outputObject;
                } else {
                    _.forEach(output, (item, key) => {
                        cb(item, key);
                    });
                    return output;
                }
            }
        };

        return Generator;
    }
);
