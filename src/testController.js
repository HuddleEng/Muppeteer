/**
 *
 * This file represents the test controller. It allows the test runner to re-use the same instance of the browser
 * instead of launching a fresh one for each test. This works so long as there is no parallelization of tests.
 *
 * */

const puppeteer = require('puppeteer');
const {
    dockerRunChrome,
    dockerShutdownChrome
} = require('./utils/dockerChrome');

let instance;
module.exports = class TestController {
    constructor() {
        if (!instance) {
            this.browser = null;
            this.isUsingDocker = false;
            instance = this;
        }

        return instance;
    }

    getBrowser() {
        return this.browser;
    }

    async launchBrowser({
        headless = true,
        existingWebSocketUri,
        disableSandbox = false,
        executablePath = null,
        useDocker = true
    } = {}) {
        if (existingWebSocketUri) {
            this.isUsingDocker = useDocker;

            this.browser = await puppeteer.connect({
                browserWSEndpoint: existingWebSocketUri
            });

            return this.browser;
        }

        if (useDocker) {
            const webSocketUri = await dockerRunChrome();

            this.browser = await puppeteer.connect({
                browserWSEndpoint: webSocketUri
            });

            this.isUsingDocker = useDocker;
        } else {
            const launchConfig = {
                headless,
                args: disableSandbox
                    ? ['--no-sandbox', '--disable-setuid-sandbox']
                    : []
            };

            if (executablePath) {
                launchConfig.executablePath = executablePath;
            }

            this.browser = await puppeteer.launch(launchConfig);
        }

        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }

        if (this.isUsingDocker) {
            await dockerShutdownChrome();
        }
    }
};
