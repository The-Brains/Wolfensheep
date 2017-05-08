define(['jquery'], function($) {
    var testWrapper = function() {
        this.currentTest = '';
        this.startTime = 0;
        this.testQuantity = 0;
        this.$resultContainer = $('.TestResultsArea');

        this.startTest = function(name) {
            this.currentTest = name;
            this.startTime = new Date();
        };

        this.endTest = function() {
            this.testQuantity++;
            var timeSpent = new Date() - this.startTime;
            this.startTime = null;
            console.log('Test "' + this.currentTest + '" took ' + timeSpent + '.');
            this.currentTest = null;
        };

        this.execTest = function(name, testFn) {
            this.testQuantity++;
            var startTime = new Date();
            var succeed = null;
            var errorMsg = null;
            try {
                testFn();
                succeed = true;
            } catch (error) {
                succeed = false;
                errorMsg = error;
            }
            var timeSpent = new Date() - startTime;

            console.log('Test #' + this.testQuantity
                + ' "' + name + '" took ' + timeSpent + 'ms to ' +
                (succeed ? 'SUCCEED' : 'FAILED')
                + '.');
            var $result = $('<div/>', {
                text: name,
            });
            this.$resultContainer.append($result);
        }
    };

    return new testWrapper();
});
