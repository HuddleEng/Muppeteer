const resemble = require('resemblejs');
const Capture = require('./capture');
const fsutils = require('./fsutils');

async function compare(file1, file2, output) {
    return new Promise(async(resolve, reject) => {
        const diff = resemble(file1).compareTo(file2).onComplete(async (data) => {
            if (Number(data.misMatchPercentage) > 0.05) {
                let err = await fsutils.writeFile(output, data.getBuffer());
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

            await fsutils.mkdirIfRequired(baselinePath);

            if (await fsutils.exists(baselineImage)) {
                base = await fsutils.readFileIfExists(baselineImage);
                suffix = 'test';

                await fsutils.mkdirIfRequired(resultsPath);

            } else {
                suffix = 'base';
            }

            await new Capture(this.page).screenshot({
                path: suffix === 'base' ? baselineImage : testImage,
                selector: selector
            });
            let r = {result: 'pass'};

            if (base) {
                const test = await fsutils.readFileIfExists(testImage);
                r = await compare(base, test, diffImage);

                if (!this.debug) {
                    try {
                        await fsutils.unlinkIfExists(testImage);
                        await fsutils.unlinkIfExists(diffImage);
                    } catch (e) {
                        reject(e);
                    }
                }
            }
            resolve(r);
        });
    }
}