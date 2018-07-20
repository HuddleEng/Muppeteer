/**
 *
 * This file represents the test launcher. It hooks up Muppeteer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 * */

const Mocha = require('mocha');
const path = require('path');
const muppeteerInterface = require('./test-interface');
const { browserInstance } = require('./test-controller');
const shell = require('shelljs');
const { globMatch, legacyMatch } = require('../src/test-matching');

module.exports = async function configureLauncher(config) {
    // update the Dockerfile to pin Chrome version to use, otherwise use 'latest' tag
    if (config.dockerChromeVersion) {
        const prefix = process.platform !== 'win32' ? './' : '';
        const muppeteerPath = path.join(__dirname, '../');
        shell.exec(
            `cd "${muppeteerPath}" && ${prefix}update-docker-chrome.sh ${
                config.dockerChromeVersion
            }`
        );
    }

    Mocha.interfaces.muppeteer = muppeteerInterface(
        config.componentTestUrlFactory || (component => component.url),
        config.componentTestVisualPathFactory ||
            ((component, file) => {
                if (config.testPathPattern) {
                    return path.join(
                        path.dirname(file),
                        `/screenshots/${component.name}`
                    );
                }
                return path.join(
                    config.testDir,
                    `/screenshots/${component.name}`
                );
            }),
        config.visualThreshold,
        config.shouldRebaseVisuals
    );

    const mocha = new Mocha({
        timeout: 10000,
        ui: 'muppeteer',
        reporter: 'mocha-multi-reporters',
        reporterOptions: {
            reporterEnabled: 'mocha-junit-reporter, mochawesome',
            mochaJunitReporterReporterOptions: {
                mochaFile: `${config.reportDir}/junit-custom.xml`
            },
            mochawesomeReporterOptions: {
                reportDir: config.reportDir,
                reportFilename: 'test-report',
                reportTitle: 'Test Report',
                reportPageTitle: 'Test Report'
            }
        }
    });

    const files = config.testPathPattern
        ? await globMatch(config.testPathPattern)
        : legacyMatch(config.testDir, config.testFilter);

    files.forEach(file => {
        mocha.addFile(file);
    });

    const init = existingWebSocketUri =>
        browserInstance.launch({
            useDocker: config.useDocker,
            existingWebSocketUri,
            headless: config.headless,
            disableSandbox: config.disableSandbox,
            executablePath: config.executablePath
        });

    const runTests = () =>
        new Promise(resolve => {
            mocha.run(async () => {
                await browserInstance.close();
                if (config.onFinish) {
                    await config.onFinish();
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
