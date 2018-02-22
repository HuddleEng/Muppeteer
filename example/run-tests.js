const server = require('./server.js');
const path = require('path');
const {IP, PORT} = require('../tests/network');
const ConfigureLauncher = require('../lib/test-launcher');

(async() => {
    const serverInstance = await server.start(PORT);
    const exampleTestsPath = path.join(__dirname, 'example-tests');

    ConfigureLauncher({
            testDir: exampleTestsPath,
            testFilter: 'test.js',
            reportDir: `${exampleTestsPath}/report`,
            componentTestUrlFactory: () => `http://${IP}:${PORT}`,
            visualThreshold: 0.05,
            useDocker: true,
            disableSandbox: !!process.env.DISABLE_SANDBOX,
            onFinish: () => {
                server.stop(serverInstance);
            }
        }
    ).launch();
})();

