const resemble = require('resemblejs');
const Capture = require('./capture');
const fs = require('mz/fs');
const {assert} = require('chai');

async function compare(file1, file2, output) {
    return new Promise(async(resolve, reject) => {
        const diff = resemble(file1).compareTo(file2).onComplete(data => {
            if (Number(data.misMatchPercentage) > 0.05) {
                fs.writeFile(output, data.getBuffer(), err => {
                    if (err) {
                        reject(err);
                    }

                    resolve({
                        result: 'fail',
                        misMatchPercentage: data.misMatchPercentage
                    });
                });
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
    constructor({ page, path = '.', debug = false } = {}) {
        this.page = page;
        this.path = path;
        this.debug = debug;
    }

    async compareVisual(selector, testName) {
        if (!testName) {
            throw new Error('Test name is required otherwise visual cannot be named');
        }
        let base, suffix = '';
        const baselinePath = `${this.path}/baselines`;
        const resultsPath = `${this.path}/results`;

        const testImage = `${resultsPath}/${testName}-test.jpg`;
        const diffImage = `${resultsPath}/${testName}-diff.jpg`;
        const baselineImage = `${baselinePath}/${testName}-base.jpg`;

        if (!await fs.exists(baselinePath)){
            await fs.mkdir(baselinePath);
        }

        if (await fs.exists(baselineImage)) {
            base = await fs.readFile(baselineImage);
            suffix = 'test';

            if (!await fs.exists(resultsPath)){
                await fs.mkdir(resultsPath);
            }

        } else {
            suffix = 'base';
        }

        await new Capture(this.page).screenshot({ path: suffix === 'base' ? baselineImage : testImage, selector: selector });
        let result;

        if (base) {
            const test = await fs.readFile(testImage);
            result = await compare(base, test, diffImage);

            if (!this.debug) {
                try {
                    await fs.unlink(testImage);
                    await fs.unlink(diffImage);
                } catch(e) {

                }
            }
        }

        return result;
    }
};


