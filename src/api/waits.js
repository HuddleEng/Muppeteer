const serialization = require('./serialization');

module.exports = (puppeteerPage, requests, defaultTimeout) => ({
    waitForResource (resource) {
        return new Promise((resolve, reject) => {
            let request = requests.find(r => r.url.indexOf(resource) !== -1);

            if (request && request.response()) {
                resolve();
            }

            const startTime = new Date().getTime();
            const timer = setInterval(() => {
                if ((new Date().getTime() - startTime) < defaultTimeout) {
                    request = requests.find(r => r.url.indexOf(resource) !== -1);

                    if (request && request.response()) {
                        clearInterval(timer);
                        resolve();
                    }
                } else {
                    clearInterval(timer);
                    reject('Timeout waiting for resource match.');
                }
            }, 100);
        });
    },
    async waitForFunction(fn, options, ...args) {
        const fnStr = serialization.serializeFunctionWithArgs(fn, ...args);
        return puppeteerPage.waitForFunction(fnStr, options);
    },
    async waitForSelector(selector, timeout) {
        return puppeteerPage.waitForSelector(selector, { timeout: timeout || defaultTimeout});
    },
    async waitUntilExistsAndVisible(selector) {
        return puppeteerPage.waitForSelector(selector, { visible: true });
    },
    async waitWhileExistsAndVisible(selector) {
        return puppeteerPage.waitForSelector(selector, { hidden: true });
    },
    async waitWhileSelectorHasVisibleContent(selector) {
        return puppeteerPage.waitForFunction(selector => {
            const elem = document.querySelector(selector);
            const isVisible = elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length;
            return !isVisible;
        }, {timeout: defaultTimeout}, selector);
    },
    async waitUntilSelectorHasVisibleContent(selector) {
        return self._puppeteerPage.waitForFunction(selector => {
            const elem = document.querySelector(selector);
            const isVisible = elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length;
            return !!isVisible;
        }, {timeout: defaultTimeout}, selector);
    },
    async waitForElementCount(selector, expectedCount) {
        return puppeteerPage.waitForFunction((selector, expectedCount) => {
            return document.querySelectorAll(selector).length === expectedCount;
        }, { timeout: defaultTimeout}, selector, expectedCount);
    },
    async waitForUrl(regex) {
        return this.waitForFunction(regex => {
            return regex.test(window.location.href);
        }, { timeout: defaultTimeout}, regex);
    },
    async waitFor(milliseconds) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    },
});


