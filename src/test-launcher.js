/**
 *
 * This file represents the test launcher. It hooks up Mochateer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 *
 *
 * Example usage:
 *
 * Launcher({
 *   testDir,
 *   testFilter,
 *   shouldRebaseVisuals,
 *   reportDir,
 *   componentTestUrlFactory,
 *   componentTestVisualPathFactory,
 *   visualThreshold,
 *   afterHook
 * });
 *
 * testDir is the directory for Mocha to look for the test files
 * testFilter allows you to pass in some text to filter the test file name, it's just a substring match, nothing fancy
 * shouldRebaseVisuals is a flag to tell the visual regression engine to replace the existing baseline visuals
 * reportDir is the directory for the Mocha reporter to dump the report files
 * componentTestUrlFactory is a function that returns the url for the component test to run
 * componentTestVisualPathFactory is a function that returns the path for visual tests to run in
 * visualThreshold is a value between 0 and 1 to present the threshold at which a visual test may pass or fail
 * afterHook is a function that can be used to do some extra work after Mochateer is teared down
 * headless determines whether Chrome will be launched in a headless mode (without GUI) or with a head
 * disableSandbox is used to disable the sandbox checks if not using SUID sandbox:
 *      https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md
 *
 **/

const Mocha = require('mocha');
const path = require('path');
const mochateerInterface = require('../lib/test-interface');
const {browserInstance} = require('../lib/test-controller');
const recursiveReadSync = require('recursive-readdir-sync');

module.exports = function Launcher({
    testDir,
    testFilter,
    shouldRebaseVisuals,
    reportDir,
    componentTestUrlFactory,
    componentTestVisualPathFactory,
    visualThreshold,
    afterHook,
    headless,
    disableSandbox
}) {
    componentTestUrlFactory = componentTestUrlFactory || (component => component.url);
    componentTestVisualPathFactory = componentTestVisualPathFactory || (component => path.join(testDir, `/screenshots/${component.name}`));

    Mocha.interfaces['mochateer'] = mochateerInterface(componentTestUrlFactory, componentTestVisualPathFactory, visualThreshold, shouldRebaseVisuals);

    const mocha = new Mocha({
        timeout: 10000, ui: 'mochateer', reporter: 'mocha-multi-reporters', reporterOptions: {
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

    (async() => {
        await browserInstance.launch({headless, disableSandbox});

        mocha.run(async() => {
            await browserInstance.close();
            afterHook && afterHook();
        });
    })();
};


