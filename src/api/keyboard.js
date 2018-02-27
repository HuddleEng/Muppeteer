/**
 *
 * This file represents the keyboard API for Muppeteer. It exposes standard Puppeteer functions and custom convenience ones.
 *
 **/

const {keyCodeForKey} = require('../external/keyboard-utils');

module.exports = puppeteerPage => ({
    keyboard: {
        /**
         * Fire down event on a particular keyboard key
         * @param {string} key - The key to fire the down event on
         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboarddownkey-options
         */
        async down(key) {
            return puppeteerPage.keyboard.down(key);
        },
        /**
         * Fire up event on a particular keyboard key
         * @param {string} key - The key to fire the up event on
         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardupkey
         */
        async up(key) {
            return puppeteerPage.keyboard.up(key);
        },
        /**
         * Fire press event on a particular keyboard key
         * @param {string} key - The key to fire the press event on
         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardpresskey-options
         */
        async press(key) {
            return puppeteerPage.keyboard.press(key);
        },
        /**
         * Type some text into an input field
         * @param {string} text - The text to type
         * @param {object} options - Keyboard options
         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardtypetext-options
         */
        async type(text, options) {
            return puppeteerPage.keyboard.type(text, options);
        },
        /**
         * Send a particular character to an input field
         * @param {char} char - The key to fire the up event on
         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardsendcharacterchar
         */
        async sendCharacter(char) {
            return puppeteerPage.keyboard.sendCharacter(char);
        },
    },
    /**
     * Type into a field on the page
     * @param {string} selector - The selector of the element to type into
     * @param {string} text - The text to enter into the field
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagetypeselector-text-options
     */
    async type(selector, text) {
        return puppeteerPage.type(selector, text);
    },
});
