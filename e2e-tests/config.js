const { IP, PORT } = require('./network');
const ConfigureLauncher = require('../lib/test-launcher');

function getLauncher(testType, onFinish) {
    return ConfigureLauncher({
        testPathPattern:
            testType === 'unit'
                ? 'examples/unit/**/*.test.js'
                : 'examples/e2e/**/*.test.js',
        reportDir: `examples/${testType}/report`,
        componentTestUrlFactory: () => `http://${IP}:${PORT}`,
        visualThreshold: 0.05,
        useDocker: true,
        dockerChromeVersion: '67.0.3396.79',
        onFinish
    });
}

module.exports = getLauncher;
