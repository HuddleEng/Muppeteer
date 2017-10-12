const {promisify} = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const existsp = promisify(fs.exists);

module.exports = {
    writeFile(path, buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await promisify(fs.writeFile)(path, buffer));
            } catch(e) {
                reject(e);
            }
        });
    },
    mkdirIfRequired(path) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!await existsp(path)) {
                    await mkdirp(path);
                }
                resolve(path);
            } catch (e) {
                reject(e);
            }
        });
    },
    readFileIfExists(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await existsp(buffer)) {
                    resolve(await promisify(fs.readFile)(buffer));
                } else {
                    resolve(false);
                }
            } catch (e) {
                reject(e);
            }
        });
    },
    unlinkIfExists(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await existsp(buffer)) {
                    resolve(await promisify(fs.unlink)(buffer));
                } else {
                    resolve(false);
                }
            } catch (e) {
                reject(e);
            }
        });
    },
    exists(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await existsp(buffer));
            } catch (e) {
                reject(e);
            }
        });
    }
};
