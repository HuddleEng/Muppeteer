const server = require('../tests/server.js');
const { PORT } = require('../tests/network');
const getLauncher = require('../tests/config');

(async () => {
    const serverInstance = await server.start(PORT);
    await getLauncher(() => {
        server.stop(serverInstance);
    }).launch();
})();
