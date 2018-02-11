/**
 *
 * This file represents the waits API for Mochateer. It exposes standard Puppeteer functions and custom convenience ones
 *
 **/

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

module.exports = (puppeteerPage, requests, defaultTimeout) => ({
    /**
     * Wait for a resource request to be responded to
     * @param {string} resource - The URL of the resource (or a substring of it)
     * @param {number] [timeout=defaultTimeout] - Timeout for the check
     */
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
    /**
     * Wait for a specific number of web fonts to be loaded and ready on the page
     * @param {number} count - The number of web fonts to expect
     * @param {number] [timeout=defaultTimeout] - Timeout for the check
     */
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
    /**
     * Wait for function to execute on the page
     * @param {function} fn - The function to execute on the page
     * @param {object} options - Optional waiting parameters
     * @param {...args} args - Arguments to be passed into the function
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforfunctionpagefunction-options-args
     */
    async waitForFunction(fn, options, ...args) {
        const fnStr = serializeFunctionWithArgs(fn, ...args);
        return puppeteerPage.waitForFunction(fnStr, options);
    },
    /**
     * Wait for element with a given selector to exist on the page
     * @param {string} selector - The selector for the element on the page
     * @param {number] [timeout=defaultTimeout] - Timeout for the check
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options
     */
    async waitForSelector(selector, timeout = defaultTimeout) {
        return puppeteerPage.waitForSelector(selector, { timeout: timeout });
    },
    /**
     * Wait until an element exists on the page and is visible (i.e. not transparent)
     * @param {string} selector - The selector for the element on the page
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options
     */
    async waitUntilExistsAndVisible(selector) {
        return puppeteerPage.waitForSelector(selector, { visible: true });
    },
    /**
     * Wait while an element still exists on the page and is visible (i.e. not transparent)
     * @param {string} selector - The selector for the element on the page
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options
     */
    async waitWhileExistsAndVisible(selector) {
        return puppeteerPage.waitForSelector(selector, { hidden: true });
    },
    /**
     * Wait until the selector has visible content (i.e. the element takes up some width and height on the page)
     * @param {string} selector - The selector for the element on the page
     */
    async waitUntilSelectorHasVisibleContent(selector) {
        return puppeteerPage.waitForFunction(selector => {
            const elem = document.querySelector(selector);
            const isVisible = elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length;
            return !!isVisible;
        }, {timeout: defaultTimeout}, selector);
    },
    /**
     * Wait while the selector has visible content (i.e. the element takes up some width and height on the page)
     * @param {string} selector - The selector for the element on the page
     */
    async waitWhileSelectorHasVisibleContent(selector) {
        return puppeteerPage.waitForFunction(selector => {
            const elem = document.querySelector(selector);
            const isVisible = elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length;
            return !isVisible;
        }, {timeout: defaultTimeout}, selector);
    },
    /**
     * Wait for the nth element found from the selector has a particular attribute
     * @param {string} selector - The selector for the element on the page
     * @param {number} nth - The nth element found by the selector
     * @param {string} attributeName - The attribute name to look for
     */
    async waitForNthSelectorAttribute(selector, nth, attributeName) {
        return puppeteerPage.waitForFunction((selector, nth, attributeName) => {
            const element = document.querySelectorAll(selector)[nth - 1];
            return typeof element.attributes[attributeName] !== 'undefined';
        }, {timeout: defaultTimeout}, selector, nth, attributeName);
    },
    /**
     * Wait for the element found from the selector has a particular attribute
     * @param {string} selector - The selector for the element on the page
     * @param {string} attributeName - The attribute name to look for
     */
    async waitForSelectorAttribute (selector, attributeName) {
        return this.waitForNthSelectorAttribute(selector, 1, attributeName);
    },
    /**
     * Wait for the nth element found from the selector has a particular attribute value pair
     * @param {string} selector - The selector for the element on the page
     * @param {number} nth - The nth element found by the selector
     * @param {string} attributeName - The attribute name to look for
     * @param {string} attributeValue - The attribute value to match the attributeName
     */
    async waitForNthSelectorAttributeValue (selector, nth, attributeName, attributeValue) {
        return puppeteerPage.waitForFunction((selector, nth, attributeName, attributeValue) => {
            const element = document.querySelectorAll(selector)[nth - 1];
            return element.attributes[attributeName] && element.attributes[attributeName].value === attributeValue;
        }, {timeout: defaultTimeout}, selector, nth, attributeName, attributeValue);
    },
    /**
     * Wait for the element found from the selector has a particular attribute value pair
     * @param {string} selector - The selector for the element on the page
     * @param {string} attributeName - The attribute name to look for
     * @param {string} attributeValue - The attribute value to match the attributeName
     */
    async waitForSelectorAttributeValue (selector, attributeName, attributeValue) {
        return this.waitForNthSelectorAttributeValue(selector, 1, attributeName, attributeValue);
    },
    /**
     * Wait for the element count to be a particular value
     * @param {string} selector - The selector for the element on the page
     * @param {number} expectedCount - The number of elements to expect
     */
    async waitForElementCount(selector, expectedCount) {
        return puppeteerPage.waitForFunction((selector, expectedCount) => {
            return document.querySelectorAll(selector).length === expectedCount;
        }, { timeout: defaultTimeout}, selector, expectedCount);
    },
    /**
     * Wait for the current window location to match a particular regular expression
     * @param {RegExp} regex - The regular expression to match the URL on
     */
    async waitForUrl(regex) {
        return this.waitForFunction(regex => {
            return regex.test(window.location.href);
        }, { timeout: defaultTimeout}, regex);
    },
    /**
     * Wait for a given number of milliseconds
     * @param {number} milliseconds - The number of milliseconds to wait for
     */
    async waitFor(milliseconds) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    },
});


