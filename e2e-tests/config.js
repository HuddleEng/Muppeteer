const { HOST, PORT } = require('./network');
const Launcher = require('../lib/Launcher');

function getLauncher(testType, onFinish) {
    return new Launcher({
        testPathPattern:
            testType === 'unit'
                ? 'examples/unit/**/*.test.js'
                : 'examples/e2e/**/*.test.js',
        reportDir: `examples/${testType}/report`,
        componentTestUrlFactory: () => `http://${HOST}:${PORT}`,
        visualThreshold: 0.05,
        useDocker: true,
        dockerChromeVersion: '67.0.3396.79',
        onFinish
    });
}

module.exports = getLauncher;
