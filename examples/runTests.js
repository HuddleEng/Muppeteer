const server = require('../test-config/server.js');
const createLauncher = require('../test-config/createLauncher');
const program = require('commander');

program
    .version('0.0.1')
    .option('-u, --component', 'Run component tests')
    .option('-e, --e2e', 'Run e2e tests')
    .parse(process.argv);

const testType = program.component ? 'component' : 'e2e';

(async () => {
    const serverInstance = await server.start({
        testType
    });

    const launcher = createLauncher(testType, () => {
        server.stop(serverInstance);
    });

    launcher.run();
})();
