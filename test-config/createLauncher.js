const Launcher = require('../lib/Launcher');

function createLauncher(testType, onFinish) {
    return new Launcher({
        testPathPattern:
            testType === 'component'
                ? 'examples/component/**/*.test.js'
                : 'examples/e2e/**/*.test.js',
        reportDir: `examples/${testType}/report`,
        componentTestUrlFactory: () => `http://host.docker.internal:3000`,
        visualThreshold: 0.05,
        useDocker: true,
        onFinish
    });
}

module.exports = createLauncher;
