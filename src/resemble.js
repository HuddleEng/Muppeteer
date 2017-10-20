const resemble = require('resemblejs');
const fsutils = require('./fs-utils');

const cleanupVisuals = Symbol('cleanupVisuals');
const compare = Symbol('compare');

module.exports = class ResembleVRT {
    constructor({path = '.', visualThresholdPercentage = 0.05, debug = false} = {}) {
        this.path = path;
        this.visualThresholdPercentage = visualThresholdPercentage;
        this.debug = debug;
    }

    [compare](file1, file2, output) {
        return new Promise((resolve, reject) => {
            try {
                const diff = resemble(file1).compareTo(file2).onComplete(async (data) => {
                    if (Number(data.misMatchPercentage) > this.visualThresholdPercentage) {
                        let err = await fsutils.writeFile(output, data.getBuffer());
                        if (!err) {
                            resolve({
                                result: 'fail',
                                misMatchPercentage: data.misMatchPercentage
                            });
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve({
                            result: 'pass',
                            misMatchPercentage: data.misMatchPercentage
                        });
                    }
                });
                diff.ignoreAntialiasing();
            } catch (e) {
                reject(`Resemble threw an error, ${e}`);
            }
        });
    }
    async [cleanupVisuals](currentImage, diffImagePath) {
        try {
            await fsutils.unlinkIfExists(currentImage);
            await fsutils.unlinkIfExists(diffImagePath);
        } catch (e) {
            throw new Error('Removing visuals failed', e);
        }
    }
    compareVisual(buffer, testName) {
        return new Promise(async (resolve, reject) => {
            if (!testName) {
                reject('Test name is required otherwise visual cannot be named.');
            }

            try {
                const path = await fsutils.mkdirIfRequired(this.path);

                const currentImage = `${path}/${testName}-current.png`;
                const diffImage = `${path}/${testName}-diff.png`;
                const baselineImage = `${path}/${testName}-base.png`;

                // cleanup old test/diff visuals first if they exist
                try {
                    await this[cleanupVisuals](currentImage, diffImage);
                } catch (e) {
                    reject(e);
                }

                const pathToSaveTo = await fsutils.exists(baselineImage) ? currentImage : baselineImage;
                await fsutils.writeFile(pathToSaveTo, buffer);

                const base = await fsutils.readFileIfExists(baselineImage);
                const test = await fsutils.readFileIfExists(currentImage);

                let r = { result: 'pass' };

                // if test image exists, then a baseline already existed so do comparison
                if (test) {
                    r = await this[compare](base, test, diffImage);

                    if (!this.debug && r.result === 'pass') {
                        // cleanup test/diff visuals if passed and not in debug mode
                        try {
                            await this[cleanupVisuals](currentImage, diffImage);
                        } catch (e) {
                            reject(e);
                        }
                    }
                }
                resolve(r);
            } catch (e) {
                reject(`There was an error comparing visuals, ${e}`);
            }
        });
    }
};
