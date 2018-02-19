/**
 *
 * This file represents the test launcher. It hooks up Muppeteer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 *
 *
 * Example usage:
 *
 * ConfigureLauncher({
 *   testDir,
 *   testFilter,
 *   shouldRebaseVisuals,
 *   reportDir,
 *   componentTestUrlFactory,
 *   componentTestVisualPathFactory,
 *   visualThreshold,
 *   onFinish
 *   headless
 *   disableSandbox
 *   executablePath
 *   useDocker
 * });
 *
 * testDir is the directory for Mocha to look for the test files
 * testFilter allows you to pass in some text to filter the test file name, it's just a substring match, nothing fancy
 * shouldRebaseVisuals is a flag to tell the visual regression engine to replace the existing baseline visuals
 * reportDir is the directory for the Mocha reporter to dump the report files
 * componentTestUrlFactory is a function that returns the url for the component test to run
 * componentTestVisualPathFactory is a function that returns the path for visual tests to run in
 * visualThreshold is a value between 0 and 1 to present the threshold at which a visual test may pass or fail
 * onFinish is a function that can be used to do some extra work after Muppeteer is teared down
 * useDocker is the option for telling Muppeteer to run Chrome in Docker to better deal with environmental inconsistencies (default)
 * headless determines whether Chrome will be launched in a headless mode (without GUI) or with a head (not applicable with useDocker)
 * disableSandbox is used to disable the sandbox checks if not using SUID sandbox (not applicable with useDocker)
 *      https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md
 * executablePath is the option to set the version of Chrome to use duning the tests. By default, it uses the bundled version (not applicable with useDocker)
 *
 **/

const Mocha = require('mocha');
const path = require('path');
const muppeteerInterface = require('./test-interface');
const {browserInstance} = require('./test-controller');
const recursiveReadSync = require('recursive-readdir-sync');

module.exports = function ConfigureLauncher({
    testDir,
    testFilter,
    shouldRebaseVisuals,
    reportDir,
    componentTestUrlFactory,
    componentTestVisualPathFactory,
    visualThreshold,
    onFinish,
    headless,
    useDocker,
    disableSandbox,
    executablePath,

}) {
    componentTestUrlFactory = componentTestUrlFactory || (component => component.url);
    componentTestVisualPathFactory = componentTestVisualPathFactory || (component => path.join(testDir, `/screenshots/${component.name}`));

    Mocha.interfaces['muppeteer'] = muppeteerInterface(componentTestUrlFactory, componentTestVisualPathFactory, visualThreshold, shouldRebaseVisuals);

    const mocha = new Mocha({
        timeout: 10000, ui: 'muppeteer', reporter: 'mocha-multi-reporters', reporterOptions: {
            'reporterEnabled': 'mocha-junit-reporter, mochawesome',
            'mochaJunitReporterReporterOptions': {
                'mochaFile': reportDir + '/junit-custom.xml'
            }, 'mochawesomeReporterOptions': {
                'reportDir': reportDir,
                'reportFilename': 'test-report',
                'reportTitle': 'Test Report',
                'reportPageTitle': 'Test Report'
            }
        }
    });

    let files = null;

    try {
        files = recursiveReadSync(testDir);
    } catch (err) {
        if (err.errno === 34) {
            throw Error('Path does not exist');
        } else {
            throw err;
        }
    }

    if (testFilter) {
        files.filter(file => {
            return file.indexOf(testFilter) !== -1 && path.basename(file).substr(-7) === 'test.js';
        }).forEach(file => {
            mocha.addFile(file);
        });
    } else {
        files.forEach(file => {
            mocha.addFile(file);
        });
    }

    return {
        launch: () => {
            return new Promise(async(resolve) => {
                await browserInstance.launch({useDocker, headless, disableSandbox, executablePath});

                mocha.run(async() => {
                    await browserInstance.close();
                    onFinish && await onFinish();
                    resolve();
                });
            });
        },
        config: {
            mocha,
        }
    };
};


