module.exports = class PuppeteerCapture {
    constructor(page) {
        this.page = page;
    }

    async screenshot({selector, path} = {}) {
        if (!selector) {
            throw new Error('Selector is required for a screenshot.');
        }

        const boundingRect = await this.page.evaluate(selector => {
            const element = document.querySelector(selector);

            if (!element) {
                return null;
            }

            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        if (!boundingRect) {
            throw new Error(`Unable find element that matches selector: ${selector}.`);
        }

        return await this.page.screenshot({
            path,
            clip: {
                x: boundingRect.left,
                y: boundingRect.top,
                width: boundingRect.width,
                height: boundingRect.height
            }
        });
    }
};