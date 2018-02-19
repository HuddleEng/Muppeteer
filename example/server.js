const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'todomvc-react')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

module.exports = {
    start: (port) => {
        return new Promise((resolve) => {
           const server = app.listen(port, () => {
               console.log(`Test server started on port ${port}`);
               resolve(server);
           });
        });
    },
    stop: server => {
        server.close();
        console.log('Test server stopped');
    }
};