/**
 *
 * This file represents the test launcher. It hooks up Muppeteer to Mocha and the reporting library. You can configure
 * the path for the report files to go in and how the components are loaded for the tests
 * */

const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const findNodeModules = require('find-node-modules');
const nodeModulePaths = findNodeModules({ relative: false });
const mochaInterface = require('../src/mochaInterface');
const TestController = require('../src/TestController');
const { globMatch, legacyMatch } = require('../src/testMatching');
const { dockerUpdateChromium } = require('../src/utils/dockerChrome');
const { CONSOLE_PREFIX } = require('../src/utils/consoleHelpers');

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

        this.disableSandbox = disableSandbox;
        this.executablePath = executablePath;
        this.testController = new TestController();

        const getPackagePath = p => {
            return path.join(p, 'puppeteer', 'package.json');
        };

        const puppeteerConfigPath = getPackagePath(
            nodeModulePaths.find(p => {
                const pathToTest = getPackagePath(p);
                return fs.existsSync(pathToTest);
            })
        );

        const revision =
            process.env.PUPPETEER_CHROMIUM_REVISION ||
            process.env.npm_config_puppeteer_chromium_revision ||
            require(path.resolve(puppeteerConfigPath)).puppeteer
                .chromium_revision;

        // set the version of Chromium to use based on Puppeteer
        console.log(
            `${CONSOLE_PREFIX} Setting Chromium version to rev-${revision}...`
                .green
        );

        dockerUpdateChromium(revision);

        Mocha.interfaces.muppeteer = mochaInterface(
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
                    resolve();
                } else {
                    resolve();
                }
            });
        });
    }

    async run() {
        await this.init();
        return this.runTests();
    }
};
