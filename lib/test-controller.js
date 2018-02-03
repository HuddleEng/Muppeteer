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