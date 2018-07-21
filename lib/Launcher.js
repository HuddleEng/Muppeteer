/**
 *
 * This file represents the test launcher. It hooks up Muppeteer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 * */

const Mocha = require('mocha');
const path = require('path');
const muppeteerInterface = require('../src/mochaInterface');
const TestController = require('../src/TestController');
const shell = require('shelljs');
const { globMatch, legacyMatch } = require('../src/testMatching');

module.exports = class Launcher {
    constructor({
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
        this.testPathPattern = testPathPattern;
        this.testDir = testDir;
        this.testFilter = testFilter;
        this.shouldRebaseVisuals = shouldRebaseVisuals;
        this.reportDir = reportDir;
        this.componentTestUrlFactory = componentTestUrlFactory;
        this.componentTestVisualPathFactory = componentTestVisualPathFactory;
        this.visualThreshold = visualThreshold;
        this.onFinish = onFinish;
        this.headless = headless;
        this.useDocker = useDocker;
        this.dockerChromeVersion = dockerChromeVersion;
        this.disableSandbox = disableSandbox;
        this.executablePath = executablePath;
        this.testController = new TestController();

        // update the Dockerfile to pin Chrome version to use, otherwise use 'latest' tag
        if (this.dockerChromeVersion) {
            const prefix = process.platform !== 'win32' ? './' : '';
            const muppeteerPath = path.join(__dirname, '../');
            shell.exec(
                `cd "${muppeteerPath}" && ${prefix}update-docker-chrome.sh ${
                    this.dockerChromeVersion
                }`
            );
        }

        Mocha.interfaces.muppeteer = muppeteerInterface(
            this.componentTestUrlFactory || (component => component.url),
            this.componentTestVisualPathFactory ||
                ((component, file) => {
                    if (this.testPathPattern) {
                        return path.join(
                            path.dirname(file),
                            `/screenshots/${component.name}`
                        );
                    }
                    return path.join(
                        this.testDir,
                        `/screenshots/${component.name}`
                    );
                }),
            this.visualThreshold,
            this.shouldRebaseVisuals
        );

        this.mocha = new Mocha({
            timeout: 10000,
            ui: 'muppeteer',
            reporter: 'mocha-multi-reporters',
            reporterOptions: {
                reporterEnabled: 'mocha-junit-reporter, mochawesome',
                mochaJunitReporterReporterOptions: {
                    mochaFile: `${this.reportDir}/junit-custom.xml`
                },
                mochawesomeReporterOptions: {
                    reportDir: this.reportDir,
                    reportFilename: 'test-report',
                    reportTitle: 'Test Report',
                    reportPageTitle: 'Test Report'
                }
            }
        });

        const files = this.testPathPattern
            ? globMatch(this.testPathPattern)
            : legacyMatch(this.testDir, this.testFilter);

        files.forEach(file => {
            this.mocha.addFile(file);
        });

        this.config = { mocha: this.mocha };
    }

    init(existingWebSocketUri) {
        return this.testController.launchBrowser({
            useDocker: this.useDocker,
            existingWebSocketUri,
            headless: this.headless,
            disableSandbox: this.disableSandbox,
            executablePath: this.executablePath
        });
    }

    async runTests() {
        return new Promise(resolve => {
            this.mocha.run(async () => {
                await this.testController.closeBrowser();
                if (this.onFinish) {
                    await this.onFinish();
                }
                resolve();
            });
        });
    }

    async run() {
        await this.init();
        return this.runTests();
    }
};
