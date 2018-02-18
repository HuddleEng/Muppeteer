const ConfigureLauncher = require('../lib/test-launcher');

let result = {
    hasExecutedOnFinishHandler: false
};

const launcher = ConfigureLauncher({
        testDir: 'example/example-tests',
        testFilter: 'test.js',
        reportDir: 'example/example-tests/report',
        onFinish: () => {
            return new Promise(resolve => {
                // onFinish could be async like this:
                setTimeout(() => {
                    result.hasExecutedOnFinishHandler = true;
                    resolve();
                }, 200);
            });
        }
    }
);

module.exports = {
    launcher,
    result
};