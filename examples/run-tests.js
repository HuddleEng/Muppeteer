const server = require('../e2e-tests/server');
const { PORT } = require('../e2e-tests/network');
const getLauncher = require('../e2e-tests/config');
const program = require('commander');

program
    .version('0.0.1')
    .option('-u, --unit', 'Run unit tests')
    .option('-e, --e2e', 'Run e2e tests')
    .parse(process.argv);

const testType = program.unit ? 'unit' : 'e2e';

(async () => {
    const serverInstance = await server.start({
        port: PORT,
        testType
    });

    const launcher = getLauncher(testType, () => {
        server.stop(serverInstance);
    });

    await launcher.run();
})();
