/**
 *
 * This file represents the visual API for Muppeteer. This currently only exports the screenshot function.
 *
 **/

module.exports = puppeteerPage => ({
    /**
     * Take a screenshot of a particular element on the page
     * @param {string} selector - The selector for the element to take a screenshot of
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions
     */
    async screenshot(selector) {
        if (!selector) {
            throw Error('Selector is required for a screenshot.');
        }

        try {
            const element = await puppeteerPage.$(selector);
            return element.screenshot();
        } catch (e) {
            throw Error(`Unable to take screenshot of element, ${selector}`);
        }
    },
});