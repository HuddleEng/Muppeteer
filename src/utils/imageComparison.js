const stream = require('stream');
const pixelmatch = require('pixelmatch');
const { Buffer } = require('buffer');
const { PNG } = require('pngjs');
const { createReadStream, writeFile } = require('./fileUtils');

const imageComparison = (file1, buffer, output, threshold) =>
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
                        await writeFile(output, result);

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

            img1 = createReadStream(file1)
                .pipe(new PNG())
                .on('parsed', doneReading);
            img2 = bufferStream.pipe(new PNG()).on('parsed', doneReading);
        } catch (e) {
            reject(e);
        }
    });

module.exports = imageComparison;
