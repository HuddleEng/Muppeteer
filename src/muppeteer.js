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
const puppeteerExtensions = require('puppeteer-extensions');
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
        page: null,
        assert,
        async finish() {
            return state.page.close();
        }
    };

    return {
        async initialize () {
            const browser = browserInstance.get();

            const generateAPI = () => {
                /**
                 * Compare the current state of an element to the baseline
                 * @param {string} selector - Selector of the element to compare
                 */
                assert.visual = async function(selector) {
                    const element = await state.page.$(selector);
                    const buffer = await element.screenshot();

                    let r = await state.visualRegression.compareVisual(buffer, state.testId);

                    if (r.passOrFail === 'fail' && r.diffScreenshot) {
                        addContext(state.testContext, r.diffScreenshot);
                    }

                    assert.equal(r.passOrFail, 'pass', `Visual failure for selector '${selector}' with an approximate ${r.misMatchPercentage}% mismatch.`);
                };

                return puppeteerExtensions(state.page, TIMEOUT_MS);
            };

            state.page = await browser.newPage();
            state.page.extensions = generateAPI();

            // default viewport
            await state.page.setViewport({width: 900, height: 900, deviceScaleFactor: 1});
            await state.page.goto(state.url);

            if (state.onLoad && state.onLoad.fn) {
                const args = state.onLoad.args || [];
                await state.page.evaluate(state.onLoad.fn, ...args);
            }

            state.visualRegression = VisualRegression({
                page: state.page,
                extensions: state.page.extensions,
                path: state.visualPath,
                visualThreshold: state.visualThreshold,
                shouldRebaseVisuals: state.shouldRebaseVisuals
            });

            return state;
        }
    };
};

