const ConfigureLauncher = require('../src/test-launcher');
const isWindows = process.platform === 'win32';

const {config} = ConfigureLauncher({
    testDir: './example/example-tests',
    testFilter: 'test.js',
    reportDir: 'example/example-tests/report'
});

test('Substring filtering works', () => {
    expect(config.mocha.files.length).toBe(1);

    const path = isWindows ? config.mocha.files[0].replace(/\\/g, '/') : config.mocha.files[0];
    expect(path).toBe('example/example-tests/todomvc.test.js');
});

test('Test interface is set', () => {
    expect(config.mocha.options.ui).toBe('mochateer');
});

test('Report directory is set', () => {
    expect(config.mocha.options.reporterOptions.mochawesomeReporterOptions.reportDir).toBe('example/example-tests/report');
    expect(config.mocha.options.reporterOptions.mochaJunitReporterReporterOptions.mochaFile).toBe('example/example-tests/report/junit-custom.xml');
});