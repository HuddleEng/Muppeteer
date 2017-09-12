module.exports = class Capture {
    constructor(page) {
        this.page = page;
    }

    async screenshot(options = {}) {
        const path = 'path' in options ? options.path : null;
        const selector = options.selector;

        if (!selector)
            throw Error('Selector is required for screenshot.');

        const boundingRect = await this.page.evaluate(selector => {
            const element = document.querySelector(selector);

            if (!element) {
                return null;
            }

            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        if (!boundingRect)
            throw Error(`Unable find element that matches selector: ${selector}.`);

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