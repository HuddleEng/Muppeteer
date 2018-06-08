const { fork } = require('child_process');

const isWindows = process.platform === 'win32';

let onFinishHookExecuted = false;
let config = null;

const launchMochaTests = () =>
    new Promise(resolve => {
        const runTests = fork(
            'tests/run.js',
            [`--webSocketUri=${process.env.WEBSOCKET_URI}`, '--color'],
            { silent: true }
        );

        runTests.stdout.on('data', data => {
            process.stdout.write(data.toString());
        });

        runTests.stderr.on('data', data => {
            process.stdout.write(data.toString());
        });

        runTests.on('message', message => {
            if (message.tag === 'STDOUT_HOOK_CONFIG') {
                config = message.value;
            }

            if (message.tag === 'STDOUT_HOOK_ONFINISH') {
                onFinishHookExecuted = true;
            }

            if (message.tag === 'STDOUT_HOOK_DONE') {
                resolve();
            }
        });

        runTests.on('exit', code => {
            if (code > 0) {
                process.exit(1);
            }
        });
    });

beforeAll(async () => {
    // mocha tests may take a few seconds to execute, but at least docker is already running at this point
    jest.setTimeout(20000);
    await launchMochaTests();
});

test('Test filtering works', () => {
    expect(config.mocha.files.length).toBe(1);

    const path = isWindows
        ? config.mocha.files[0].replace(/\\/g, '/')
        : config.mocha.files[0];
    expect(path).toBe('example/example-tests/todomvc.test.js');
});

test('Test interface is set', () => {
    expect(config.mocha.options.ui).toBe('muppeteer');
});

test('Report directory is set', () => {
    expect(
        config.mocha.options.reporterOptions.mochawesomeReporterOptions
            .reportDir
    ).toBe('example/example-tests/report');
    expect(
        config.mocha.options.reporterOptions.mochaJunitReporterReporterOptions
            .mochaFile
    ).toBe('example/example-tests/report/junit-custom.xml');
});

test('Test onFinish hook executes after running tests', async () => {
    expect(onFinishHookExecuted).toBe(true);
});
