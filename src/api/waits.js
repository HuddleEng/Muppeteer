const serializeFunctionWithArgs = require('../external/serialization-utils');

const pollFor = ({checkFn, interval, timeout, timeoutMsg}) => {
    return new Promise((resolve, reject) => {
        const startTime = new Date().getTime();
        const timer = setInterval(async () => {
            if ((new Date().getTime() - startTime) < timeout) {
                if (await checkFn()) {
                    clearInterval(timer);
                    resolve();
                }
            } else {
                clearInterval(timer);
                reject(timeoutMsg);
            }
        }, interval);
    });
};
/**
 *
 * This file represents the waits API for Mochateer. It exposes standard Puppeteer functions and custom convenience ones
 *
 **/

module.exports = (puppeteerPage, requests, defaultTimeout) => ({
    waitForResource (resource, timeout = defaultTimeout) {
        return new Promise((resolve, reject) => {
            let request = requests.find(r => r.url.indexOf(resource) !== -1);

            if (request && request.response()) {
                resolve();
            } else {
                pollFor({
                    checkFn: () => {
                        request = requests.find(r => r.url.indexOf(resource) !== -1);
                        return request && request.response();
                    },
                    internal: 100,
                    timeout: timeout,
                    timeoutMsg: 'Timeout waiting for resource match.'
                }).then(resolve).catch(reject)
            }
        });
    },
    async waitForLoadedWebFontCountToBe(count, timeout = defaultTimeout) {
        let hasInjectedWebFontsAllLoadedFunction = false;

        async function checkWebFontIsLoaded() {
            const fontResponses = requests.filter(r => r.resourceType === 'font' && r.response && r.response());

            if (fontResponses.length === count) {
                if (hasInjectedWebFontsAllLoadedFunction) {
                    return puppeteerPage.evaluate(() => {
                        return !!window.__webFontsAllLoaded;
                    });
                } else {
                    await puppeteerPage.evaluate(() => {
                        (async function() {
                            window.__webFontsAllLoaded = await document.fonts.ready;
                        })();
                    });

                    hasInjectedWebFontsAllLoadedFunction = true;
                    return false;
                }
            }
            return false;
        }

        return pollFor({
            checkFn: checkWebFontIsLoaded,
            internal: 100,
            timeout: timeout,
            timeoutMsg: `Timeout waiting for ${count} web font responses`
        });
    },
    async waitForFunction(fn, options, ...args) {
        const fnStr = serializeFunctionWithArgs(fn, ...args);
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


