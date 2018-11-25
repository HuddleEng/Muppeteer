const express = require('express');
const path = require('path');

module.exports = {
    start: ({ testType = 'component' } = {}) => {
        const app = express();

        const directory =
            testType === 'component'
                ? 'component/panel-app'
                : 'e2e/todomvc-react';

        app.use(
            express.static(path.join(__dirname, '../examples/', directory))
        );

        app.get('/', (req, res) => {
            res.sendFile('index.html');
        });

        return new Promise(resolve => {
            const server = app.listen(3000, () => {
                console.log(`Test server started on port 3000`);
                resolve(server);
            });
        });
    },
    stop: server => {
        server.close();
        console.log('Test server stopped');
    }
};
