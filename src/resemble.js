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
        if (await fs.exists(`${this.path}/${this.name}-base.jpg`)) {
            base = await fs.readFile(`${this.path}/${this.name}-base.jpg`);
            suffix = 'test';

        } else {
            suffix = 'base';
        }

        await new Capture(this.page).screenshot({ path: `${this.path}/${this.name}-${suffix}.jpg`, selector: selector });
        let isSame = true;

        if (base) {
            const test = await fs.readFile(`${this.path}/${this.name}-test.jpg`);
            isSame = await compare(base, test,`${this.path}/${this.name}-diff.jpg`);

            if (!this.debug) {
                try {
                    await fs.unlink(`${this.path}/${this.name}-test.jpg`);
                    await fs.unlink(`${this.path}/${this.name}-diff.jpg`);
                } catch(e) {

                }
            }
        }

        return isSame;
    }
};


