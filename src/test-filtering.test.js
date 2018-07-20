const { globMatch, legacyMatch } = require('./test-filtering');

test('Glob matching works', async () => {
    const testPathPattern = 'examples/unit/**/*.test.js';
    const expectedFiles = ['examples/unit/tests/panel.test.js'];
    const actualFile = await globMatch(testPathPattern);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
});

test('Legacy regex filename matching works', () => {
    const testDir = 'examples/unit';
    const testFitler = /.*\.test\.js$/;
    const expectedFiles = ['examples/unit/tests/panel.test.js'];
    const actualFile = legacyMatch(testDir, testFitler);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
});

test('Legacy substring filename matching works', () => {
    const testDir = 'examples/unit';
    const testFitler = '.test';
    const expectedFiles = ['examples/unit/tests/panel.test.js'];
    const actualFile = legacyMatch(testDir, testFitler);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
});
