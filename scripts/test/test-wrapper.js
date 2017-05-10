define(['jquery', 'lodash'], function($, _) {
    var testWrapper = function() {
        this.currentTest = '';
        this.startTime = 0;
        this.testQuantity = 0;
        this.$resultContainer = $('.TestResultsArea');

        this.execTest = function(mainName, testName, testFn) {
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

            console[succeed ? 'log' : 'error']('Test #' + this.testQuantity
                + ' "' + mainName + ' | ' + testName + '" took ' + timeSpent + 'ms to ' +
                (succeed ? 'SUCCEED' : 'FAILED')
                + '.');

            this.renderTest(succeed, mainName, testName, timeSpent, errorMsg);
        }

        this.createTestClass = function(mainName) {
            return 'testBlock-' + _.replace(mainName, ' ', '_');
        }

        this.getTestContainer = function(mainName) {
            var className = this.createTestClass(mainName);
            var $container = this.$resultContainer.find('.' + className);

            if (!$container.length) {
                $container = $('<div>',{
                    class: className,
                });
                $ul = $('<ul>');
                $title = $('<h3>', {
                    text: mainName,
                });
                $container.append($title);
                $container.append($ul);
                this.$resultContainer.append($container);
            }

            return $container.find('ul');
        }

        this.renderTest = function(succeed, mainName, name, time, errorMsg) {
            var $container = this.getTestContainer(mainName);
            var $result = $('<li/>', {
                class: 'mdl-list__item',
            });
            var iconName = succeed ? 'done' : 'close';
            var checked = succeed ? 'checked' : '';
            var secondaryBlock = succeed ? `${time} ms` : errorMsg;
            var iconClass = succeed ? 'icon-succeed' : 'icon-failed';
            var $testStatus = $(`
                <span class="mdl-list__item-primary-content">
                    <i class="material-icons mdl-list__item-avatar ${iconClass}">
                        ${iconName}
                    </i>
                    ${name}
                </span>
                <span class="mdl-list__item-secondary-action">
                    ${secondaryBlock}
                </span>`
            );
            $result.append($testStatus);
            $container.append($result);
        }
    };

    return new testWrapper();
});
