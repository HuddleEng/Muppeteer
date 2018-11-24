const { globMatch, legacyMatch } = require('./testMatching');

const testDir = 'examples/component';
const expectedFiles = ['examples/component/tests/panel.test.js'];

const legacyTestFilter = testFitler => {
    const actualFile = legacyMatch(testDir, testFitler);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
};

test('Glob matching works', async () => {
    const testPathPattern = 'examples/component/**/*.test.js';
    const actualFile = await globMatch(testPathPattern);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
});

test('Legacy regex filename matching works', () => {
    legacyTestFilter(/.*\.test\.js$/);
});

test('Legacy substring filename matching works', () => {
    legacyTestFilter('.test');
});
