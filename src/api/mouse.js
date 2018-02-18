/**
 *
 * This file represents the mouse API for Muppeteer. It exposes standard Puppeteer functions and custom convenience ones.
 *
 **/

module.exports = puppeteerPage => ({
    mouse: {},
    /**
     * Focus an element on the page
     * @param {string} selector - The selector of the element to focus
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagefocusselector
     */
    async focus(selector) {
        return puppeteerPage.focus(selector);
    },
    /**
     * Hover an element on the page
     * @param {string} selector - The selector of the element to hover
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector
     */
    async hover(selector) {
        return puppeteerPage.hover(selector);
    },
    /**
     * Check if element is focused
     * @param {string} selector - The selector of the element to check for focus state
     * @returns {boolean} Whether the element is focused or not
     */
    async isElementFocused (selector) {
        return puppeteerPage.evaluate(selector => {
            const element = document.querySelector(selector);
            return element === document.activeElement;
        }, selector);
    },
    /**
     * Click on an element on the page
     * @param {string} selector - The selector of the element to click on
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options
     */
    async click(selector) {
        return puppeteerPage.click(selector);
    }
});
