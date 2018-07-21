const imageComparison = require('./imageComparison');
const { fileExists, readFile, removeFileIfExists } = require('./fileUtils');

const targetDir = `${__dirname}/test-fixtures`;
const baselineImagePath = `${targetDir}/baseline.png`;
const currentImagePath = `${targetDir}/current.png`;
const diffImagePath = `${targetDir}/diff.png`;
const visualThreshold = 0.05;

afterAll(async () => {
    await removeFileIfExists(diffImagePath);
});

test('Test findDifferencesInImages', async () => {
    const currentImage = await readFile(currentImagePath);

    const result = await imageComparison(
        baselineImagePath,
        currentImage,
        diffImagePath,
        visualThreshold
    );

    const diffImageExists = await fileExists(diffImagePath);
    expect(result.misMatchPercentage).toBe('1.07');
    expect(result.passOrFail).toBe('fail');
    expect(diffImageExists).toBe(true);
});
