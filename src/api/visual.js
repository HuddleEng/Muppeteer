module.exports = puppeteerPage => ({
    async screenshot(selector) {
        if (!selector) {
            throw new Error('Selector is required for a screenshot.');
        }

        const boundingRect = await puppeteerPage.evaluate(selector => {
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

        return await puppeteerPage.screenshot({
            undefined,
            clip: {
                x: boundingRect.left,
                y: boundingRect.top,
                width: boundingRect.width,
                height: boundingRect.height
            }
        });
    },
});

