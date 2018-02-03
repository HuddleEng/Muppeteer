const {Buffer} = require('buffer');
const fsutils = require('./fs-utils');
const pixelmatch = require('pixelmatch');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const {PNG} = require('pngjs');

const compare = (file1, file2, output, threshold) => {
    return new Promise((resolve, reject) => {
        try {
            let filesRead = 0;
            const img1 = fsutils.createReadStream(file1).pipe(new PNG()).on('parsed', doneReading);
            const img2 = fsutils.createReadStream(file2).pipe(new PNG()).on('parsed', doneReading);

            function doneReading() {
                if (++filesRead < 2) return;
                const diff = new PNG({ width: img1.width, height: img1.height });
                const noOfDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold });

                if (noOfDiffPixels > 0) {
                    const chunks = [];

                    diff.pack();

                    diff.on('data', function (chunk) {
                        chunks.push(chunk);
                    });

                    diff.on('end', async function () {
                        let result = Buffer.concat(chunks);
                        await fsutils.writeFile(output, result);
                        const dataUrl = `data:image/jpg;base64, ${result.toString('base64')}`;

                        const img1Size = await sizeOf(file1);
                        const img2Size = await sizeOf(file2);
                        const misMatchPercentage = (noOfDiffPixels /
                        (Math.max(img1Size.height, img2Size.height) * Math.max(img1Size.width, img2Size.width)) * 100).toFixed(2);

                        resolve({
                            passOrFail: 'fail',
                            misMatchPercentage: misMatchPercentage,
                            diffScreenshot: dataUrl
                        })
                    });
                } else {
                    resolve({
                        passOrFail: 'pass'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

const cleanupVisuals = async (currentImage, diffImagePath) => {
    try {
        await fsutils.unlinkIfExists(currentImage);
        await fsutils.unlinkIfExists(diffImagePath);
    } catch (e) {
        throw Error('Removing visuals failed', e);
    }
};

module.exports = function VisualRegression({path = '.', visualThreshold = 0.05, shouldRebaseVisuals = false} = {}) {
    return {
        async compareVisual(buffer, testName) {
            if (!testName) {
                throw Error('Test name is required otherwise visual cannot be named.');
            }

            try {
                const defaultResult = { passOrFail: 'pass' };
                const currentImage = `${path}/${testName}-current.png`;
                const diffImage = `${path}/${testName}-diff.png`;
                const baselineImage = `${path}/${testName}-base.png`;

                await fsutils.mkdirIfRequired(path);
                await cleanupVisuals(currentImage, diffImage);

                const pathToSaveTo = (shouldRebaseVisuals || !await fsutils.exists(baselineImage)) ? baselineImage : currentImage;
                await fsutils.writeFile(pathToSaveTo, buffer);

                const current = await fsutils.readFileIfExists(currentImage);

                // if a current image exists, then a baseline already existed so do comparison
                if (current) {
                    const result = await compare(baselineImage, currentImage, diffImage, visualThreshold);

                    if (result.passOrFail === 'pass') {
                        await cleanupVisuals(currentImage, diffImage);
                        return result;
                    }
                    return result;
                }
                return defaultResult;
            } catch (e) {
                throw Error(`There was an error comparing visuals, ${e}`);
            }
        }
    }
};