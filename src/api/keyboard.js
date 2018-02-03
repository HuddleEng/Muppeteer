/**
 *
 * This file represents the keyboard API for Mochateer. It exposes standard Puppeteer functions and custom convenience ones.
 *
 **/

const {keyCodeForKey} = require('../external/keyboard-utils');

module.exports = puppeteerPage => ({
    keyboard: {
        async down(key) {
            return puppeteerPage.keyboard.down(key);
        },
        async press(key) {
            return puppeteerPage.keyboard.press(key);
        },
        // This can be used for legacy code using keypress handlers (deprecated)
        // See: https://www.w3.org/TR/DOM-Level-3-Events/#event-type-keypress
        async naughtyPress(selector, key) {
            const keyCode = keyCodeForKey(key);
            return puppeteerPage.evaluate((selector, keyCode) => {
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
            return puppeteerPage.keyboard.up(key);
        },
        async type(text, options) {
            return puppeteerPage.keyboard.type(text, options);
        },
        async sendCharacter(char) {
            return puppeteerPage.keyboard.sendCharacter(char);
        },
    }
});
