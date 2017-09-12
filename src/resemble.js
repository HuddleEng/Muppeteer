const resemble = require('resemblejs');
const Capture = require('./capture');
const fs = require('mz/fs');

async function compare(file1, file2, output) {
    return new Promise(async(resolve, reject) => {
        const diff = resemble(file1).compareTo(file2).onComplete(data => {
            if (Number(data.misMatchPercentage) > 0.05) {
                fs.writeFile(output, data.getBuffer(), err => {
                    if (err) {
                        reject(err);
                    }

                    resolve(false);
                });
            } else {
                resolve(true);
            }
        });
        diff.ignoreAntialiasing();
    });
}

module.exports = class Resemble {
    constructor({ page, path = '.', name, debug = false } = {}) {
        this.page = page;
        this.path = path;
        this.name = name;
        this.debug = debug;
    }

    async visualCompare(selector) {
        let base, suffix = '';
        const baselinePath = `${this.path}/baselines`;
        const resultsPath = `${this.path}/results`;

        const testImage = `${resultsPath}/${this.name}-test.jpg`;
        const diffImage = `${resultsPath}/${this.name}-diff.jpg`;
        const baselineImage = `${baselinePath}/${this.name}-base.jpg`;

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
        let isSame = true;

        if (base) {
            const test = await fs.readFile(testImage);
            isSame = await compare(base, test, diffImage);

            if (!this.debug) {
                try {
                    await fs.unlink(testImage);
                    await fs.unlink(diffImage);
                } catch(e) {

                }
            }
        }

        return isSame;
    }
};


