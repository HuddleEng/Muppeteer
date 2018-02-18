const server = require('../example/server');
const { fork } = require('child_process');
const {launcher} = require('./config');
const {config} = launcher;
const isWindows = process.platform === 'win32';

let serverInstance;
let hasExecutedOnFinishHandler = false;

// running the example tests in a worker process so that a failed test (exit 1) doesn't exit this process
const launchTestsInWorker = () => {
    const child = fork('tests/worker');

    return new Promise(resolve => {
        // tell worker to run the launch function
        child.send('LAUNCH');

        // receive complete response from worker
        child.on('message', message => {
            if (message.title.toUpperCase() === 'COMPLETE') {
                hasExecutedOnFinishHandler = message.data.hasExecutedOnFinishHandler;
                resolve();
            }
        });
    });
};

beforeAll(async () => {
    serverInstance = await server.start();
});

afterAll(() => {
    server.stop(serverInstance);
    process.exit(0);
});

test('Substring filtering works', () => {
    expect(config.mocha.files.length).toBe(1);

    const path = isWindows ? config.mocha.files[0].replace(/\\/g, '/') : config.mocha.files[0];
    expect(path).toBe('example/example-tests/todomvc.test.js');
});

test('Test interface is set', () => {
    expect(config.mocha.options.ui).toBe('muppeteer');
});

test('Report directory is set', () => {
    expect(config.mocha.options.reporterOptions.mochawesomeReporterOptions.reportDir).toBe('example/example-tests/report');
    expect(config.mocha.options.reporterOptions.mochaJunitReporterReporterOptions.mochaFile).toBe('example/example-tests/report/junit-custom.xml');
});

test('Test onFinish hook executes after running tests', async() => {
    await launchTestsInWorker();
    expect(hasExecutedOnFinishHandler).toBe(true);
});
