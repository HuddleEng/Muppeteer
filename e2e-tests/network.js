const { networkInterfaces } = require('os');

// Source: https://gist.github.com/szalishchuk/9054346

const IP = []
    .concat(...Object.values(networkInterfaces()))
    .filter(details => details.family === 'IPv4' && !details.internal)
    .pop().address;

const PORT = 3000;

module.exports = {
    IP,
    PORT
};
