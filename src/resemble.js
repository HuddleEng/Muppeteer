const resemble = require('resemblejs');
const Capture = require('./capture');
const fs = require('mz/fs');

async function compare(file1, file2) {
    return new Promise(async(resolve, reject) => {
        const diff = resemble(file1).compareTo(file2).onComplete(data => {
            if (Number(data.misMatchPercentage) > 0.05) {
                fs.writeFile('../diff.jpg', data.getBuffer(), err => {
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
    constructor(page, { debug = false } = {}) {
        this.page = page;
        this.debug = debug;
    }

    async visualCompare(selector) {
        await new Capture(this.page).screenshot({ path: '../file2.jpg', selector: selector });

        const file1 = await fs.readFile('../file1.jpg');
        const file2 = await fs.readFile('../file2.jpg');
        let isSame = await compare(file1, file2);

        if (!this.debug) {
            try {
                await fs.unlink('../file2.jpg');
                await fs.unlink('../diff.jpg');
            } catch(e) {

            }
        }

        return isSame;
    }
};


