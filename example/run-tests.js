const server = require('../tests/server.js');
const { PORT } = require('../tests/network');

(async() => {
    const serverInstance = await server.start(PORT);
    await require('../tests/config')(() => {
        server.stop(serverInstance);
    }).launch();
})();