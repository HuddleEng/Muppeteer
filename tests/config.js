const { IP, PORT } = require('./network');
const ConfigureLauncher = require('../lib/test-launcher');

function getLauncher(onFinish) {
    return ConfigureLauncher({
        testDir: 'example/example-tests',
        testFilter: 'test.js',
        reportDir: 'example/example-tests/report',
        componentTestUrlFactory: () => `http://${IP}:${PORT}`,
        visualThreshold: 0.05,
        useDocker: true,
        onFinish
    });
}

module.exports = getLauncher;
