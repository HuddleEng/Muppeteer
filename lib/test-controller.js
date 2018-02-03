/**
 *
 * This file represents the test controller. It allows the test runner to re-use the same instance of the browser
 * instead of launching a fresh one for each test. This works so long as there is no parallelization of tests.
 *
 **/

const puppeteer = require('puppeteer');

module.exports = {
    browserInstance: {
        browser: null,
        get() {
            return this.browser;
        },
        async launch() {
            this.browser = await puppeteer.launch({headless: true});
            return this.browser;
        },
        async close() {
            this.browser && await this.browser.close();
        },
    },
};