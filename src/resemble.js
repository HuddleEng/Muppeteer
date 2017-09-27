const resemble = require('resemblejs');
const Capture = require('./capture');
const {promisify} = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');

const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

async function compare(file1, file2, output) {
    return new Promise(async(resolve, reject) => {
        const diff = resemble(file1).compareTo(file2).onComplete(async (data) => {
            if (Number(data.misMatchPercentage) > 0.05) {
                let err = await writeFile(output, data.getBuffer());
                if (err) {
                    reject({
                        result: 'fail',
                        error: err
                    });
                } else {
                    resolve({
                        result: 'fail',
                        misMatchPercentage: data.misMatchPercentage
                    });
                }
            } else {
                resolve({
                    result: 'pass',
                    misMatchPercentage: data.misMatchPercentage
                });
            }
        });
        diff.ignoreAntialiasing();
    });
}

module.exports = class Resemble {
    constructor({page, path = '.', debug = false} = {}) {
        this.page = page;
        this.path = path;
        this.debug = debug;
    }

    compareVisual(selector, testName) {
        return new Promise(async (resolve, reject) => {
            if (!testName) {
                throw new Error('Test name is required otherwise visual cannot be named');
            }
            let base, suffix = '';
            const baselinePath = `${this.path}/baselines`;
            const resultsPath = `${this.path}/results`;

            const testImage = `${resultsPath}/${testName}-test.png`;
            const diffImage = `${resultsPath}/${testName}-diff.png`;
            const baselineImage = `${baselinePath}/${testName}-base.png`;

            if (!await exists(baselinePath)) {
                await mkdirp(baselinePath);
            }

            if (await exists(baselineImage)) {
                base = await readFile(baselineImage);
                suffix = 'test';

                if (!await exists(resultsPath)) {
                    await mkdirp(resultsPath);
                }

            } else {
                suffix = 'base';
            }

            await new Capture(this.page).screenshot({
                path: suffix === 'base' ? baselineImage : testImage,
                selector: selector
            });
            let r = {result: 'pass'};

            if (base) {
                const test = await readFile(testImage);
                r = await compare(base, test, diffImage);

                if (!this.debug) {
                    try {
                        await unlink(testImage);
                        await unlink(diffImage);
                    } catch (e) {
                        reject(e);
                    }
                }
            }

            resolve(r);
        })
    }
}