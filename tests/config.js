const { IP, PORT } = require('./network');
const ConfigureLauncher = require('../lib/test-launcher');

function getLauncher(onFinish) {
    return ConfigureLauncher({
        testPathPattern: 'example/example-tests/*.test.js',
        reportDir: 'example/example-tests/report',
        componentTestUrlFactory: () => `http://${IP}:${PORT}`,
        visualThreshold: 0.05,
        useDocker: true,
        dockerChromeVersion: '67.0.3396.79',
        onFinish
    });
}

module.exports = getLauncher;
