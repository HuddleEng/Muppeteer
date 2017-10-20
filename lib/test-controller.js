let _debugMode = false;

module.exports = {
    browserInstance: {
        _browser: null,
        getBrowser(puppeteer) {
            return new Promise(async(resolve, reject) => {
                if (this._browser) {
                    resolve(this._browser);
                } else {
                    try {
                        this._browser = await puppeteer.launch({headless: true});
                        resolve(this._browser);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        },
        async closeBrowser() {
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
