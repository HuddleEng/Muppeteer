const ConfigureLauncher = require('../lib/test-launcher');
const {IP, PORT} = require('./network');

let result = {
    hasExecutedOnFinishHandler: false
};

const launcher = ConfigureLauncher({
        testDir: 'example/example-tests',
        testFilter: 'test.js',
        reportDir: 'example/example-tests/report',
        disableSandbox: !!process.env.DISABLE_SANDBOX,
        useDocker: false, // don't use docker to test internals for now as jest tests will timeout in CI/fresh env
        componentTestUrlFactory: () => `http://${IP}:${PORT}`,
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