module.exports = puppeteerPage => ({
    async getValue(selector) {
        return puppeteerPage.evaluate(selector => {
            return document.querySelector(selector).value;
        }, selector);
    },
    async getText(selector) {
        return puppeteerPage.evaluate(selector => {
            return document.querySelector(selector).textContent;
        }, selector);
    },
    async getPropertyValue(selector, property) {
        try {
            return puppeteerPage.evaluate((selector, property) => {
                const element = document.querySelector(selector);
                return element[property];
            }, selector, property);
        } catch(e) {
            throw new Error(`Unable able to get ${property} from ${selector}.`, e);
        }
    },
});
