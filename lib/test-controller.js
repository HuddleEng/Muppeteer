/**
 *
 * This file represents the test controller. It allows the test runner to re-use the same instance of the browser
 * instead of launching a fresh one for each test. This works so long as there is no parallelization of tests.
 *
 **/

const puppeteer = require('puppeteer');

let browser = null;

module.exports = {
    browserInstance: {
        get() {
            return browser;
        },
        async launch({headless = true, disableSandbox = false, executablePath = null} = {}) {
            const launchConfig = { headless, args: disableSandbox ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] };

            if (executablePath) {
                launchConfig.executablePath = executablePath;
            }

            browser = await puppeteer.launch(launchConfig);
            return browser;
        },
        async close() {
            browser && await browser.close();
        },
    },
};