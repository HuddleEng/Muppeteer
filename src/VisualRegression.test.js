const VisualRegression = require('./VisualRegression');
const {
    readFile,
    removeFileIfExists,
    fileExists
} = require('./utils/fileUtils');

const testName = 'some test';
const testFixturePath = `${__dirname}/test-fixtures`;
const visualThreshold = 0.05;

const getImagePaths = targetDir => {
    return {
        bufferImagePath: `${targetDir}/buffer.png`,
        baseImagePath: `${targetDir}/${testName}-base.png`,
        currentImagePath: `${targetDir}/${testName}-current.png`,
        diffImagePath: `${targetDir}/${testName}-diff.png`
    };
};

const checkImagesExist = async targetDir => {
    const { baseImagePath, currentImagePath, diffImagePath } = getImagePaths(
        targetDir
    );

    const baseImageExists = await fileExists(baseImagePath);
    const currentImageExists = await fileExists(currentImagePath);
    const diffImageExists = await fileExists(diffImagePath);

    return {
        baseImageExists,
        currentImageExists,
        diffImageExists
    };
};

test('Test compareVisual with no baseline', async () => {
    const targetDir = `${testFixturePath}/new`;
    const { baseImagePath, bufferImagePath } = getImagePaths(targetDir);

    const visualRegression = new VisualRegression({
        path: targetDir,
        visualThreshold,
        shouldRebaseVisuals: false
    });

    const buffer = await readFile(bufferImagePath);
    const result = await visualRegression.compareVisual(buffer, testName);

    expect(result.misMatchPercentage).toBe(undefined);
    expect(result.passOrFail).toBe('pass');

    const {
        baseImageExists,
        currentImageExists,
        diffImageExists
    } = await checkImagesExist(targetDir);

    expect(baseImageExists).toBe(true);
    expect(currentImageExists).toBe(false);
    expect(diffImageExists).toBe(false);

    // cleanup
    await removeFileIfExists(baseImagePath);
});

test('Test compareVisual with baseline', async () => {
    const targetDir = `${testFixturePath}`;
    const { bufferImagePath, currentImagePath, diffImagePath } = getImagePaths(
        targetDir
    );

    const visualRegression = new VisualRegression({
        path: targetDir,
        visualThreshold,
        shouldRebaseVisuals: false
    });

    const buffer = await readFile(bufferImagePath);
    const result = await visualRegression.compareVisual(buffer, testName);

    expect(result.misMatchPercentage).toBe('1.07');
    expect(result.passOrFail).toBe('fail');

    const {
        baseImageExists,
        currentImageExists,
        diffImageExists
    } = await checkImagesExist(targetDir);

    expect(baseImageExists).toBe(true);
    expect(currentImageExists).toBe(true);
    expect(diffImageExists).toBe(true);

    // cleanup
    await removeFileIfExists(currentImagePath);
    await removeFileIfExists(diffImagePath);
});
