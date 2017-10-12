const resemble = require('resemblejs');
const fsutils = require('./fsutils');

const cleanupVisuals = Symbol('cleanupVisuals');
const compare = Symbol('compare');

module.exports = class Resemble {
    constructor({capturer, path = '.', visualThresholdPercentage = 0.05, debug = false} = {}) {
        this.capturer = capturer;
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
    async [cleanupVisuals](testImagePath, diffImagePath) {
        try {
            await fsutils.unlinkIfExists(testImagePath);
            await fsutils.unlinkIfExists(diffImagePath);
        } catch (e) {
            throw new Error('Removing visuals failed', e);
        }
    }
    compareVisual(selector, testName) {
        return new Promise(async (resolve, reject) => {
            if (!testName) {
                reject('Test name is required otherwise visual cannot be named.');
            }

            try {
                const path = await fsutils.mkdirIfRequired(this.path);
                const testImage = `${path}/${testName}-test.png`;
                const diffImage = `${path}/${testName}-diff.png`;
                const baselineImage = `${path}/${testName}-base.png`;

                // cleanup old test/diff visuals first if they
                try {
                    await this[cleanupVisuals](testImage, diffImage);
                } catch (e) {
                    reject(e);
                }

                if (this.capturer && this.capturer.screenshot) {
                    await this.capturer.screenshot({
                        path: await fsutils.exists(baselineImage) ? testImage : baselineImage,
                        selector: selector
                    });

                    const base = await fsutils.readFileIfExists(baselineImage);
                    const test = await fsutils.readFileIfExists(testImage);

                    let r = { result: 'pass' };

                    // if test image exists, then a baseline already existed so do comparison
                    if (test) {
                        r = await this[compare](base, test, diffImage);

                        if (!this.debug) {
                            // cleanup test/diff visuals in non-debug mode
                            try {
                                await this[cleanupVisuals](testImage, diffImage);
                            } catch (e) {
                                reject(e);
                            }
                        }
                    }
                    resolve(r);
                } else {
                    reject ('Capturer does not conform to contract.')
                }

            } catch (e) {
                reject(`There was a error comparing visuals, ${e}`);
            }
        });
    }
};