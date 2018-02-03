/**
 *
 * This file represents file system utilities required for visual tests. This wraps around native Node and custom functions,
 * and exposes a promisified API.
 *
 **/

const {promisify} = require('util');
const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));
const existsp = promisify(fs.exists);

module.exports = {
    async writeFile(path, buffer) {
        return promisify(fs.writeFile)(path, buffer);
    },
    async mkdirIfRequired(path) {
        if (!await existsp(path)) {
            await mkdirp(path);
        }
        return path;
    },
    createReadStream(path, options) {
        return fs.createReadStream(path, options);
    },
    createWriteStream(path, options) {
        return fs.createWriteStream(path, options);
    },
    async readFileIfExists(buffer) {
        if (await existsp(buffer)) {
            return promisify(fs.readFile)(buffer);
        }
        return false;
    },
    async unlinkIfExists(buffer) {
        if (await existsp(buffer)) {
            return promisify(fs.unlink)(buffer);
        }
        return false;
    },
    async exists(buffer) {
        return existsp(buffer);
    }
};
