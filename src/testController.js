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

let browser = null;
let isUsingDocker = false;

module.exports = {
    browserInstance: {
        get() {
            return browser;
        },
        async launch({
            headless = true,
            existingWebSocketUri,
            disableSandbox = false,
            executablePath = null,
            useDocker = true
        } = {}) {
            if (existingWebSocketUri) {
                isUsingDocker = useDocker;
                browser = await puppeteer.connect({
                    browserWSEndpoint: existingWebSocketUri
                });
                return browser;
            }

            if (useDocker) {
                const webSocketUri = await dockerRunChrome();

                browser = await puppeteer.connect({
                    browserWSEndpoint: webSocketUri
                });

                isUsingDocker = useDocker;
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

                browser = await puppeteer.launch(launchConfig);
            }

            return browser;
        },
        async close() {
            if (browser) {
                await browser.close();
            }

            if (isUsingDocker) {
                await dockerShutdownChrome();
            }
        }
    }
};
