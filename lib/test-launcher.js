/**
 *
 * This file represents the test launcher. It hooks up Muppeteer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 *
 * testPathPattern is a glob match for test files. This is the new and recommended way.
 * testDir is the directory for Mocha to look for the test files. This is the old way of matching tests.
 * testFilter allows you to pass in some text to filter the test file name. This is the old way of matching tests.
 * shouldRebaseVisuals is a flag to tell the visual regression engine to replace the existing baseline visuals
 * reportDir is the directory for the Mocha reporter to dump the report files
 * componentTestUrlFactory is a function that returns the url for the component test to run
 * componentTestVisualPathFactory is a function that returns the path for visual tests to run in
 * visualThreshold is a value between 0 and 1 to present the threshold at which a visual test may pass or fail
 * onFinish is a function that can be used to do some extra work after Muppeteer is teared down
 * useDocker is the option for telling Muppeteer to run Chrome in Docker to better deal with environmental inconsistencies (default)
 * dockerChromeVersion is the version you want to pin Chrome to for deterministic results, e.g. 65.0.3325.181. By default 'latest' (not recommended)
 * headless determines whether Chrome will be launched in a headless mode (without GUI) or with a head (not applicable with useDocker)
 * disableSandbox is used to disable the sandbox checks if not using SUID sandbox (not applicable with useDocker)
 *      https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md
 * executablePath is the option to set the version of Chrome to use duning the tests. By default, it uses the bundled version (not applicable with useDocker)
 *
 * */

const Mocha = require('mocha');
const path = require('path');
const muppeteerInterface = require('./test-interface');
const { browserInstance } = require('./test-controller');
const recursiveReadSync = require('recursive-readdir-sync');
const glob = require('glob-promise');
const shell = require('shelljs');

module.exports = async function ConfigureLauncher({
    testPathPattern,
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
    dockerChromeVersion,
    disableSandbox,
    executablePath
}) {
    // update the Dockerfile to pin Chrome version to use, otherwise use 'latest' tag
    if (dockerChromeVersion) {
        const prefix = process.platform !== 'win32' ? './' : '';
        shell.exec(`${prefix}update-docker-chrome.sh ${dockerChromeVersion}`);
    }

    Mocha.interfaces.muppeteer = muppeteerInterface(
        componentTestUrlFactory || (component => component.url),
        componentTestVisualPathFactory ||
            ((component, file) => {
                if (testPathPattern) {
                    return path.join(
                        path.dirname(file),
                        `/screenshots/${component.name}`
                    );
                }
                return path.join(testDir, `/screenshots/${component.name}`);
            }),
        visualThreshold,
        shouldRebaseVisuals
    );

    const mocha = new Mocha({
        timeout: 10000,
        ui: 'muppeteer',
        reporter: 'mocha-multi-reporters',
        reporterOptions: {
            reporterEnabled: 'mocha-junit-reporter, mochawesome',
            mochaJunitReporterReporterOptions: {
                mochaFile: `${reportDir}/junit-custom.xml`
            },
            mochawesomeReporterOptions: {
                reportDir,
                reportFilename: 'test-report',
                reportTitle: 'Test Report',
                reportPageTitle: 'Test Report'
            }
        }
    });

    // new fancy way of file path matching
    if (testPathPattern) {
        try {
            const files = await glob(testPathPattern, {});
            files.forEach(file => {
                mocha.addFile(file);
            });
        } catch (err) {
            throw Error(err);
        }
        // legacy/old way of file path matching using a separate directory and file filter
    } else if (testDir) {
        let files = [];

        try {
            files = recursiveReadSync(testDir);
        } catch (err) {
            if (err.errno === 34) {
                throw Error('Path does not exist');
            } else {
                throw err;
            }
        }

        files
            .filter(
                file =>
                    (testFilter instanceof RegExp &&
                        testFilter.test(path.basename(file))) ||
                    path.basename(file).indexOf(testFilter || '.test.js') !== -1
            )
            .forEach(file => {
                mocha.addFile(file);
            });
    }

    const init = existingWebSocketUri =>
        browserInstance.launch({
            useDocker,
            existingWebSocketUri,
            headless,
            disableSandbox,
            executablePath
        });

    const runTests = () =>
        new Promise(resolve => {
            mocha.run(async () => {
                await browserInstance.close();
                if (onFinish) {
                    await onFinish();
                }
                resolve();
            });
        });

    return {
        init,
        runTests,
        launch: async () => {
            await init();
            return runTests();
        },
        config: {
            mocha
        }
    };
};
