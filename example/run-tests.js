const server = require('./server.js');
const path = require('path');
const ConfigureLauncher = require('../lib/test-launcher');

(async() => {
    const serverInstance = await server.start();
    const exampleTestsPath = path.join(__dirname, 'example-tests');

    ConfigureLauncher({
            testDir: exampleTestsPath,
            testFilter: 'test.js',
            reportDir: `${exampleTestsPath}/report`,
            visualThreshold: 0.05,
            headless: true,
            disableSandbox: false,
            onFinish: () => {
                server.stop(serverInstance);
                process.exit(0);
            }
        }
    ).launch();
})();

