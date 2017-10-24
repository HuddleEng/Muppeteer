const puppeteer = require('puppeteer');
let _debugMode = false;

module.exports = {
    browserInstance: {
        _browser: null,
        async launch() {
            return new Promise(async(resolve, reject) => {
                try {
                    this._browser = await puppeteer.launch({headless: true});
                    resolve(this._browser);
                } catch (e) {
                    reject(e);
                }
            });
        },
        async get() {
            return new Promise(async(resolve, reject) => {
                if (this._browser) {
                    resolve(this._browser);
                } else {
                    reject('No browser instance initialized');
                }
            });
        },
        async close() {
            this._browser && await this._browser.close();
        },
    },
    debugMode(mode) {
        if (typeof mode !== 'undefined') {
            _debugMode = !!mode;
        }

        return _debugMode;
    }
};
