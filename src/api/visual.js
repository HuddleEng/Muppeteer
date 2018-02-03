module.exports = puppeteerPage => ({
    async screenshot(selector) {
        if (!selector) {
            throw new Error('Selector is required for a screenshot.');
        }

        try {
            const element = await puppeteerPage.$(selector);
            return element.screenshot();
        } catch (e) {
            throw new Error(`Unable to take screenshot of element, ${selector}`);
        }
    },
});