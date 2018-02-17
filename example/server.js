const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'todomvc-react')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

module.exports = {
    start: () => {
        return new Promise((resolve) => {
           const server = app.listen(3000, () => {
               console.log('>>> Started test server on port 3000 <<<');
               resolve(server);
           });
        });
    },
    stop: server => {
        server.close();
        console.log('>>> Closed test server <<<');
    }
};