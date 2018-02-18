/**
 *
 * This file represents the miscellaneous API functions for Muppeteer. It exposes standard Puppeteer functions and custom convenience ones.
 *
 **/

const serializeFunctionWithArgs = require('../external/serialization-utils');

module.exports = puppeteerPage => ({
    /**
     * Turn off CSS animations on the page to help avoid flaky visual comparisons
     */
    async turnOffAnimations () {
        return puppeteerPage.evaluate(() => {
            function disableAnimations() {
                const {jQuery} = window;
                if (jQuery) {
                    jQuery.fx.off = true;
                }

                const css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = '* { -webkit-transition: none !important; transition: none !important; -webkit-animation: none !important; animation: none !important; }';
                document.body.appendChild( css );
            }

            if (document.readyState !== 'loading') {
                disableAnimations();
            } else {
                window.addEventListener('load', disableAnimations, false);
            }
        })
    },
    /**
     * Run a function on the page
     * @param {function} fn - The function to execute on the page
     * @param {...args} args - Arguments to be passed into the function
     */
    async evaluate(fn, ...args) {
        const fnStr = serializeFunctionWithArgs(fn, ...args);
        return puppeteerPage.evaluate(fnStr);
    },
    /**
     * Set the view port of the page
     * @param {object} viewport - The viewport config object
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport
     */
    async setViewport(viewport) {
        return puppeteerPage.setViewport(viewport);
    },
    /**
     * Add style tag to the page
     * @param {object} options - The config options
     * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions
     */
    async addStyleTag(options) {
        return puppeteerPage.addStyleTag(options);
    }
});
