const server = require('../test-config/server');
const createLauncher = require('../test-config/createLauncher');
const { onlyInit, webSocketUri } = require('minimist')(process.argv.slice(2));

const testType = 'component';

(async () => {
    let serverInstance = null;

    const launcher = createLauncher(testType, () => {
        // tell parent process that the onFinish handler has executed
        process.send({ tag: 'STDOUT_HOOK_ONFINISH' });
        server.stop(serverInstance);
    });

    async function setupServerAndRunTests() {
        serverInstance = await server.start({ testType });

        // log mocha test config object to STDOUT for later use in framework test config assertions
        const { config } = launcher;
        process.send({ tag: 'STDOUT_HOOK_CONFIG', value: config });
        await launcher.runTests();

        // tell parent process that mocha tests have complete
        process.send({ tag: 'STDOUT_HOOK_DONE' });
    }

    if (onlyInit) {
        await launcher.init();
    } else if (webSocketUri) {
        // use web socket instead of launcher a fresh instance of Chrome
        await launcher.init(webSocketUri);
        await setupServerAndRunTests();
    } else {
        await launcher.init();
        await setupServerAndRunTests();
    }
})();
