/**
 *
 * This file represents the visual comparison engine. A screenshot buffer is passed in and compared to a baseline image,
 * using PixelMatch image comparison library. If the image exceeds the threshold for differences, a fail result is
 * returned to the consumer, otherwise a pass result is returned. If there is no baseline already, one is created
 * from the buffer and the result returned is an automatic pass.
 *
 * */

const { Buffer } = require('buffer');
const stream = require('stream');
const fsutils = require('./utils/file-utils');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const compare = (file1, buffer, output, threshold) =>
    new Promise((resolve, reject) => {
        try {
            // push buffer to a stream for comparison with the baseline image
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);

            let filesRead = 0;
            let img1;
            let img2;

            const doneReading = () => {
                filesRead += 1;
                if (filesRead < 2) return;
                const diff = new PNG({
                    width: img1.width,
                    height: img1.height
                });
                const noOfDiffPixels = pixelmatch(
                    img1.data,
                    img2.data,
                    diff.data,
                    img1.width,
                    img1.height,
                    { threshold }
                );

                if (noOfDiffPixels > 0) {
                    const chunks = [];

                    diff.pack();

                    diff.on('data', chunk => {
                        chunks.push(chunk);
                    });

                    diff.on('end', async () => {
                        const result = Buffer.concat(chunks);
                        await fsutils.writeFile(output, result);

                        const dataUrl = `data:image/jpg;base64, ${result.toString(
                            'base64'
                        )}`;
                        const misMatchPercentage = (
                            (noOfDiffPixels /
                                (Math.max(img1.height, img2.height) *
                                    Math.max(img1.width, img2.width))) *
                            100
                        ).toFixed(2);

                        resolve({
                            passOrFail: 'fail',
                            misMatchPercentage,
                            diffScreenshot: dataUrl
                        });
                    });
                } else {
                    resolve({
                        passOrFail: 'pass'
                    });
                }
            };

            img1 = fsutils
                .createReadStream(file1)
                .pipe(new PNG())
                .on('parsed', doneReading);
            img2 = bufferStream.pipe(new PNG()).on('parsed', doneReading);
        } catch (e) {
            reject(e);
        }
    });

module.exports = function VisualRegression({
    path = '.',
    visualThreshold = 0.05,
    shouldRebaseVisuals = false
} = {}) {
    return {
        async compareVisual(buffer, testName) {
            if (!testName) {
                throw Error(
                    'Test name is required otherwise visual cannot be named.'
                );
            }

            try {
                const defaultResult = { passOrFail: 'pass' };
                const currentImage = `${path}/${testName}-current.png`;
                const diffImage = `${path}/${testName}-diff.png`;
                const baselineImage = `${path}/${testName}-base.png`;

                // ensure the visual path exists
                await fsutils.mkdirIfRequired(path);

                // clean any non baseline visuals from previous tests
                await fsutils.unlinkIfExists(currentImage);
                await fsutils.unlinkIfExists(diffImage);

                const newBaseline =
                    shouldRebaseVisuals ||
                    !(await fsutils.exists(baselineImage));

                if (newBaseline) {
                    await fsutils.writeFile(baselineImage, buffer);
                } else {
                    // a baseline exists so do comparison with the buffered visual
                    const result = await compare(
                        baselineImage,
                        buffer,
                        diffImage,
                        visualThreshold
                    );

                    // write the current sreenshot if failed so it's easy to view difference manually
                    if (result.passOrFail === 'fail') {
                        await fsutils.writeFile(currentImage, buffer);
                    } else {
                        // clean up diff visual if generated for minor mismatch
                        await fsutils.unlinkIfExists(diffImage);
                    }

                    return result;
                }

                return defaultResult;
            } catch (e) {
                throw Error(`There was an error comparing visuals, ${e}`);
            }
        }
    };
};
