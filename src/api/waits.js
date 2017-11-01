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
    async waitForLoadedWebFontCountToBe(count) {
        return new Promise(async (resolve, reject) => {
            let fontResponses = requests.filter(r => r.resourceType === 'font' && r.response && r.response());
            let hasInjectedWebFontsAllLoadedFunction = false;

            async function checkWebFontIsLoaded(cb) {
                if (fontResponses.length === count) {
                    if (hasInjectedWebFontsAllLoadedFunction) {
                        let allLoaded = await puppeteerPage.evaluate(() => {
                            return !!window.__webFontsAllLoaded;
                        });

                        if (allLoaded) {
                            cb && cb();
                            resolve();
                        }
                    } else {
                        await puppeteerPage.evaluate(() => {
                            (async function() {
                                window.__webFontsAllLoaded = await document.fonts.ready;
                            })();
                        });

                        hasInjectedWebFontsAllLoadedFunction = true;
                    }
                }
            }
            await checkWebFontIsLoaded();

            const startTime = new Date().getTime();
            const timer = setInterval(async () => {
                if ((new Date().getTime() - startTime) < defaultTimeout) {
                    fontResponses = requests.filter(r => r.resourceType === 'font' && r.response && r.response());
                    await checkWebFontIsLoaded(() => {
                        clearInterval(timer);
                    });
                } else {
                    clearInterval(timer);
                    reject(`Timeout waiting for ${count} web font responses`);
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
        return puppeteerPage.waitForFunction(selector => {
            const elem = document.querySelector(selector);
            const isVisible = elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length;
            return !!isVisible;
        }, {timeout: defaultTimeout}, selector);
    },
    async waitForNthSelectorAttribute(selector, nth, attributeName) {
        return puppeteerPage.waitForFunction((selector, nth, attributeName) => {
            const element = document.querySelectorAll(selector)[nth - 1];
            return typeof element.attributes[attributeName] !== 'undefined';
        }, {timeout: defaultTimeout}, selector, nth, attributeName);
    },
    async waitForSelectorAttribute (selector, attributeName) {
        return this.waitForNthSelectorAttribute(selector, 1, attributeName);
    },
    async waitForNthSelectorAttributeValue (selector, nth, attributeName, attributeValue) {
        return puppeteerPage.waitForFunction((selector, nth, attributeName, attributeValue) => {
            const element = document.querySelectorAll(selector)[nth - 1];
            return element.attributes[attributeName] && element.attributes[attributeName].value === attributeValue;
        }, {timeout: defaultTimeout}, selector, nth, attributeName, attributeValue);
    },
    async waitForSelectorAttributeValue (selector, attributeName, attributeValue) {
        return this.waitForNthSelectorAttributeValue(selector, 1, attributeName, attributeValue);
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


