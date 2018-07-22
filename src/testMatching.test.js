const { globMatch, legacyMatch } = require('./testMatching');

const testDir = 'examples/unit';
const expectedFiles = ['examples/unit/tests/panel.test.js'];

const legacyTestFilter = testFitler => {
    const actualFile = legacyMatch(testDir, testFitler);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
};

test('Glob matching works', async () => {
    const testPathPattern = 'examples/unit/**/*.test.js';
    const actualFile = await globMatch(testPathPattern);
    expect(JSON.stringify(actualFile)).toBe(JSON.stringify(expectedFiles));
});

test('Legacy regex filename matching works', () => {
    legacyTestFilter(/.*\.test\.js$/);
});

test('Legacy substring filename matching works', () => {
    legacyTestFilter('.test');
});
