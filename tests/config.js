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
        dockerChromeVersion: '65.0.3325.181',
        onFinish
    });
}

module.exports = getLauncher;
