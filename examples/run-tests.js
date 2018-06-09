const server = require('../tests/server.js');
const { PORT } = require('../tests/network');
const getLauncher = require('../tests/config');
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

    const launcher = await getLauncher(testType, () => {
        server.stop(serverInstance);
    });

    await launcher.launch();
})();
