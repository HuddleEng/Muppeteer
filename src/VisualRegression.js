/**
 *
 * This file represents the visual comparison engine. A screenshot buffer is passed in and compared to a baseline image,
 * using PixelMatch image comparison library. If the image exceeds the threshold for differences, a fail result is
 * returned to the consumer, otherwise a pass result is returned. If there is no baseline already, one is created
 * from the buffer and the result returned is an automatic pass.
 *
 * */

const sanitize = require('sanitize-filename');
const {
    writeFile,
    createDirectoryIfRequired,
    removeFileIfExists,
    fileExists
} = require('./utils/fileUtils');

const imageComparison = require('./utils/imageComparison');

module.exports = class VisualRegression {
    constructor({
        path = '.',
        visualThreshold = 0.05,
        shouldRebaseVisuals = false
    } = {}) {
        this.path = path;
        this.visualThreshold = visualThreshold;
        this.shouldRebaseVisuals = shouldRebaseVisuals;
    }

    async compareVisual(buffer, testName) {
        if (!testName) {
            throw Error(
                'Test name is required otherwise visual cannot be named.'
            );
        }

        try {
            // sanitize the filename because the test name is written to disk and may contain invalid characters like `:` or `/`
            const sanitizedTestName = sanitize(testName);
            const defaultResult = { passOrFail: 'pass' };
            const currentImage = `${this.path}/${sanitizedTestName}-current.png`;
            const diffImage = `${this.path}/${sanitizedTestName}-diff.png`;
            const baselineImage = `${this.path}/${sanitizedTestName}-base.png`;

            // ensure the visual path exists
            await createDirectoryIfRequired(this.path);

            // clean any non baseline visuals from previous tests
            await removeFileIfExists(currentImage);
            await removeFileIfExists(diffImage);

            const newBaseline =
                this.shouldRebaseVisuals || !(await fileExists(baselineImage));

            if (newBaseline) {
                await writeFile(baselineImage, buffer);
            } else {
                // a baseline exists so do comparison with the buffered visual
                const result = await imageComparison(
                    baselineImage,
                    buffer,
                    diffImage,
                    this.visualThreshold
                );

                // write the current sreenshot if failed so it's easy to view difference manually
                if (result.passOrFail === 'fail') {
                    await writeFile(currentImage, buffer);
                } else {
                    // clean up diff visual if generated for minor mismatch
                    await removeFileIfExists(diffImage);
                }

                return result;
            }

            return defaultResult;
        } catch (e) {
            throw Error(`There was an error comparing visuals, ${e}`);
        }
    }
};
