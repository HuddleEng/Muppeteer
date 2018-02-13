/**
 *
 * This file represents the retrieval API for Muppeteer. It exposes custom convenience functions.
 *
 **/

module.exports = puppeteerPage => ({
    /**
     * Get the value property value for a particular element
     * @param {string} selector - The selector for the element to get the value for
     * @returns {string} value - The value property value for the element
     */
    async getValue(selector) {
        return puppeteerPage.evaluate(selector => {
            return document.querySelector(selector).value;
        }, selector);
    },
    /**
     * Get the text property value for a particular element
     * @param {string} selector - The selector for the element to get the text for
     * @returns {string} value - The text property value for the element
     */
    async getText(selector) {
        return puppeteerPage.evaluate(selector => {
            return document.querySelector(selector).textContent;
        }, selector);
    },
    /**
     * Get the value of a particular property for a particular element
     * @param {string} selector - The selector for the element to get the property value for
     * @param {string} property - The property to look for
     * @returns {string} value - The property value for the element
     */
    async getPropertyValue(selector, property) {
        try {
            return puppeteerPage.evaluate((selector, property) => {
                const element = document.querySelector(selector);
                return element[property];
            }, selector, property);
        } catch(e) {
            throw Error(`Unable able to get ${property} from ${selector}.`, e);
        }
    },
});
