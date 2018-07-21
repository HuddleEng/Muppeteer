/**
 *
 * This file represents file system utilities required for visual tests. This wraps around native Node and custom functions,
 * and exposes a promisified API.
 *
 * */

const fs = require('fs');
const stream = require('stream');
const pixelmatch = require('pixelmatch');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const { Buffer } = require('buffer');
const { PNG } = require('pngjs');

const makeDir = promisify(mkdirp);
const existsp = promisify(fs.exists);

const writeFile = async (path, buffer) => promisify(fs.writeFile)(path, buffer);

const writeFileSync = async (path, data, options) =>
    fs.writeFile(path, data, options);

const readFileSync = (path, options) => fs.readFileSync(path, options);

const createDirectoryIfRequired = async path => {
    if (!(await existsp(path))) {
        await makeDir(path);
    }
    return path;
};

const createReadStream = (path, options) => fs.createReadStream(path, options);

const removeFileIfExists = async buffer => {
    if (await existsp(buffer)) {
        return promisify(fs.unlink)(buffer);
    }
    return false;
};

const fileExists = async buffer => existsp(buffer);

const findDifferencesInImages = (file1, buffer, output, threshold) =>
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

module.exports = {
    writeFile,
    writeFileSync,
    readFileSync,
    createDirectoryIfRequired,
    removeFileIfExists,
    fileExists,
    findDifferencesInImages
};
