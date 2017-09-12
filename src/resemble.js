const resemble = require('resemblejs');
const fs = require('mz/fs');

module.exports = class Resemble {
    async compare(file1, file2) {
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
    };
};


