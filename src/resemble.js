const {Buffer} = require('buffer');
const fsutils = require('./fs-utils');
const pixelmatch = require('pixelmatch');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const {PNG} = require('pngjs');
const cleanupVisuals = Symbol('cleanupVisuals');
const compare = Symbol('compare');

module.exports = class ResembleVRT {
    constructor({path = '.', visualThresholdPercentage = 0.1, debug = false} = {}) {
        this.path = path;
        this.visualThresholdPercentage = visualThresholdPercentage;
        this.debug = debug;
    }

    [compare](file1, file2, output) {
        return new Promise((resolve, reject) => {
            try {
                let filesRead = 0;
                const img1 = fsutils.createReadStream(file1).pipe(new PNG()).on('parsed', doneReading);
                const img2 = fsutils.createReadStream(file2).pipe(new PNG()).on('parsed', doneReading);

                function doneReading() {
                    if (++filesRead < 2) return;
                    let diff = new PNG({width: img1.width, height: img1.height});
                    let pixelmatchResult = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: this.visualThresholdPercentage });

                    if (pixelmatchResult > 0) {
                        diff.pack();

                        let chunks = [];

                        diff.on('data', function (chunk) {
                            chunks.push(chunk);
                        });

                        diff.on('end', async function () {
                            let result = Buffer.concat(chunks);
                            fsutils.writeFile(output, result);
                            const b64encoded = result.toString('base64');
                            const dataUrl = `data:image/jpg;base64, ${b64encoded}`;

                            const img1Size = await sizeOf(file1);
                            const img2Size = await sizeOf(file2);
                            const largestWidth =  Math.max(img1Size.width, img2Size.width);
                            const largestHeight = Math.max(img1Size.height, img2Size.height);
                            const misMatchPercentage =  (pixelmatchResult / (largestHeight * largestWidth) * 100).toFixed(2);

                            resolve({
                                result: 'fail',
                                misMatchPercentage: misMatchPercentage,
                                diffScreenshot: dataUrl
                            })
                        });
                    } else {
                        resolve({
                            result: 'pass'
                        })
                    }
                }
            } catch (e) {
                reject(e);
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

                const test = await fsutils.readFileIfExists(currentImage);

                let r = { result: 'pass' };

                // if test image exists, then a baseline already existed so do comparison
                if (test) {
                    r = await this[compare](baselineImage, currentImage, diffImage);

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
