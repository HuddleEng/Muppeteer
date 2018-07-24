let HOST;

// if (process.platform === 'win32') {
//     HOST = 'docker.for.win.host.internal'; // Windows
// } else if (process.platform === 'darwin') {
//     HOST = 'docker.for.mac.host.internal'; // Mac
// } else {
//     HOST = 'host.docker.internal'; // Linux (after patching hosts file, see chrome/docker-entrypoint.sh)
// }
HOST = 'host.docker.internal'; // Linux (after patching hosts file, see chrome/docker-entrypoint.sh)

const PORT = 3000;

module.exports = {
    HOST,
    PORT
};
