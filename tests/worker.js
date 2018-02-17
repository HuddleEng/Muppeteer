const {launcher, result} = require('./config');

process.on('message', async (message) => {
    if (message.toUpperCase() === 'LAUNCH') {
        await launcher.launch();
        process.send({title: 'COMPLETE', data: { hasExecutedOnFinishHandler: result.hasExecutedOnFinishHandler }});
    }
});