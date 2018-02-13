/**
 *
 * This file represents the Muppeteer interface. The initialize function exposes the final API that can be used
 * in test cases, including the native Puppeteer page object for cases where this API doesn't cover enough yet
 *
 *
 * Example usage:
 *
 *  Muppeteer({
 *              componentName,
 *              url: componentTestUrlFactory(component),
 *              visualPath: componentTestVisualPathFactory(component),
 *              visualThreshold,
 *              shouldRebaseVisuals,
 *              onLoad: component.onLoad
 *  });
 *
 *  componentName is the name of the component you want to test, but this could equally be a page name
 *  url is the url to be loaded by the browser when running the test, either a static one, or generated by a factory
 *  visualPath is the path to for visual tests to run in, either a static one, or generated by a factory
 *  visualThreshold is a value between 0 and 1 to present the threshold at which a visual test may pass or fail
 *  shouldRebaseVisuals is a flag to tell the visual regression engine to replace the existing baseline visuals
 *  onLoad is an optional object that can be passed in during a test to run a function on load. {fn, args}
 *
 **/

const addContext = require('mochawesome/addContext');
const {assert} = require('chai');
const {browserInstance} = require('../lib/test-controller');
const waits = require('./api/waits');
const keyboard = require('./api/keyboard');
const retrieval = require('./api/retrieval');
const visual = require('./api/visual');
const serializeFunctionWithArgs = require('./external/serialization-utils');
const VisualRegression = require('./visual-regression');

const TIMEOUT_MS = 5000;

module.exports = function Muppeteer({
    componentName = 'unnamed-component',
    testId,
    url,
    visualThreshold = 0.05,
    visualPath,
    shouldRebaseVisuals,
    onLoad} = {}) {

    const state = {
        testId: testId || componentName,
        testContext: null,
        url,
        onLoad,
        visualThreshold,
        visualPath,
        shouldRebaseVisuals,
        resourceRequests: [],
        puppeteerPage: null,
        page: null,
        assert,
        resetRequests() {
            state.resourceRequests = [];
        },
        async finish() {
            return state.puppeteerPage.close();
        }
    };

    return {
        async initialize () {
            const browser = browserInstance.get();

            const createPageAPI = () => {
                const api = Object.assign({}, {
                        /**
                         * Turn off CSS animations on the page to help avoid flaky visual comparisons
                         */
                        async turnOffAnimations () {
                            return state.puppeteerPage.evaluate(() => {
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
                            return state.puppeteerPage.evaluate(fnStr);
                        },
                        /**
                         * Focus an element on the page
                         * @param {string} selector - The selector of the element to focus
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagefocusselector
                         */
                        async focus(selector) {
                            return state.puppeteerPage.focus(selector);
                        },
                        /**
                         * Hover an element on the page
                         * @param {string} selector - The selector of the element to hover
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector
                         */
                        async hover(selector) {
                            return state.puppeteerPage.hover(selector);
                        },
                        /**
                         * Check if element is focused
                         * @param {string} selector - The selector of the element to check for focus state
                         * @returns {boolean} Whether the element is focused or not
                         */
                        async isElementFocused (selector) {
                            return state.puppeteerPage.evaluate(selector => {
                                const element = document.querySelector(selector);
                                return element === document.activeElement;
                            }, selector);
                        },
                        /**
                         * Type into a field on the page
                         * @param {string} selector - The selector of the element to type into
                         * @param {string} text - The text to enter into the field
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagetypeselector-text-options
                         */
                        async type(selector, text) {
                            return state.puppeteerPage.type(selector, text);
                        },
                        /**
                         * Click on an element on the page
                         * @param {string} selector - The selector of the element to click on
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options
                         */
                        async click(selector) {
                            return state.puppeteerPage.click(selector);
                        },
                        /**
                         * Set the view port of the page
                         * @param {object} viewport - The viewport config object
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport
                         */
                        async setViewport(viewport) {
                            return state.puppeteerPage.setViewport(viewport);
                        },
                        /**
                         * Add style tag to the page
                         * @param {object} options - The config options
                         * @see https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions
                         */
                        async addStyleTag(options) {
                            return state.puppeteerPage.addStyleTag(options);
                        }
                    },
                    waits(state.puppeteerPage, state.resourceRequests, TIMEOUT_MS),
                    retrieval(state.puppeteerPage),
                    keyboard(state.puppeteerPage),
                    visual(state.puppeteerPage)
                );


                /**
                 * Compare the current state of an element to the baseline
                 * @param {string} selector - Selector of the element to compare
                 */
                assert.visual = async function(selector) {
                    const buffer = await api.screenshot(selector);
                    let r = await state.visualRegression.compareVisual(buffer, state.testId);

                    if (r.passOrFail === 'fail' && r.diffScreenshot) {
                        addContext(state.testContext, r.diffScreenshot);
                    }

                    assert.equal(r.passOrFail, 'pass', `Visual failure for selector '${selector}' with an approximate ${r.misMatchPercentage}% mismatch.`);
                };

                return api;
            };

            state.puppeteerPage = await browser.newPage();
            state.page = createPageAPI();

            state.puppeteerPage.on('request', request => {
                state.resourceRequests.push(request);
            });

            // default viewport
            await state.puppeteerPage.setViewport({width: 900, height: 900, deviceScaleFactor: 1});
            await state.puppeteerPage.goto(state.url);

            if (state.onLoad && state.onLoad.fn) {
                const args = state.onLoad.args || [];
                await state.page.evaluate(state.onLoad.fn, ...args);
            }

            state.visualRegression = VisualRegression({
                page: state.puppeteerPage,
                path: state.visualPath,
                visualThreshold: state.visualThreshold,
                shouldRebaseVisuals: state.shouldRebaseVisuals
            });

            return state;
        }
    };
};
