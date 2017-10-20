const {keyCodeForKey} = require('../test-utils');

module.exports = puppeteerPage => ({
    keyboard: {
        async down(key) {
            return await puppeteerPage.keyboard.down(key);
        },
        async press(key) {
            return await puppeteerPage.keyboard.press(key);
        },
        async naughtyPress(selector, key) {
            const keyCode = keyCodeForKey(key);
            return await puppeteerPage.evaluate((selector, keyCode) => {
                let element = document.activeElement;

                if (selector) {
                    element = document.querySelector(selector);
                }

                const evt = new CustomEvent('keypress');
                evt.keyCode = keyCode;
                element.dispatchEvent(evt);
            }, selector, keyCode);
        },
        async up(key) {
            return await puppeteerPage.keyboard.up(key);
        }
    }
});
