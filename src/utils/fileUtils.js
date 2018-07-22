/**
 *
 * This file represents file system utilities required for visual tests. This wraps around native Node and custom functions,
 * and exposes a promisified API.
 *
 * */

const fs = require('fs');
const mkdirp = require('mkdirp');
const { promisify } = require('util');

const makeDir = promisify(mkdirp);
const existsp = promisify(fs.exists);
const renamep = promisify(fs.rename);

const writeFile = async (path, buffer) => promisify(fs.writeFile)(path, buffer);

const writeFileSync = (path, data, options) =>
    fs.writeFileSync(path, data, options);

const readFile = async (path, options) => promisify(fs.readFile)(path, options);

const readFileSync = (path, options) => fs.readFileSync(path, options);

const createDirectoryIfRequired = async path => {
    if (!(await existsp(path))) {
        await makeDir(path);
    }
    return path;
};

const createReadStream = (path, options) => fs.createReadStream(path, options);

const removeFileIfExists = async buffer => {
    if (await existsp(buffer)) {
        return promisify(fs.unlink)(buffer);
    }
    return false;
};

const fileExists = async buffer => existsp(buffer);

const renameFile = async (from, to) => {
    return renamep(from, to);
};

module.exports = {
    writeFile,
    writeFileSync,
    readFile,
    readFileSync,
    createReadStream,
    createDirectoryIfRequired,
    removeFileIfExists,
    fileExists,
    renameFile
};
