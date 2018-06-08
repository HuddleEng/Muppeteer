const server = require('../tests/server.js');
const { PORT } = require('../tests/network');
const getLauncher = require('../tests/config');

(async () => {
    const serverInstance = await server.start(PORT);

    const launcher = await getLauncher(() => {
        server.stop(serverInstance);
    });

    await launcher.launch();
})();
