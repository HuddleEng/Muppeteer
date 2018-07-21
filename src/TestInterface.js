/**
 *
 * This file represents the Muppeteer interface. The initialize function exposes the final API that can be used
 * in test cases, including the native Puppeteer page object for cases where this API doesn't cover enough yet
 *
 * */

const addContext = require('mochawesome/addContext');
const { assert } = require('chai');
const TestController = require('./TestController');
const puppeteerExtensions = require('puppeteer-extensions');
const VisualRegression = require('./VisualRegression');

const TIMEOUT_MS = 5000;

module.exports = class TestInterface {
    constructor({
        componentName = 'unnamed-component',
        testId,
        url,
        visualThreshold = 0.05,
        visualPath,
        shouldRebaseVisuals,
        onLoad
    }) {
        this.testId = testId || componentName;
        this.testContext = null;
        this.url = url;
        this.onLoad = onLoad;
        this.visualThreshold = visualThreshold;
        this.visualPath = visualPath;
        this.shouldRebaseVisuals = shouldRebaseVisuals;
        this.page = null;
        this.assert = assert;
        this.testController = new TestController();
    }

    async initialize() {
        const browser = this.testController.getBrowser();

        const generateAPI = () => {
            /**
             * Compare the current state of an element to the baseline
             * @param {string} selector - Selector of the element to compare
             */
            assert.visual = async selector => {
                const element = await this.page.$(selector);
                const buffer = await element.screenshot();

                const r = await this.visualRegression.compareVisual(
                    buffer,
                    this.testId
                );

                if (r.passOrFail === 'fail' && r.diffScreenshot) {
                    addContext(this.testContext, r.diffScreenshot);
                }

                assert.equal(
                    r.passOrFail,
                    'pass',
                    `Visual failure for selector '${selector}' with an approximate ${
                        r.misMatchPercentage
                    }% mismatch.`
                );
            };

            return puppeteerExtensions(this.page, TIMEOUT_MS);
        };

        this.page = await browser.newPage();
        this.page.extensions = generateAPI();

        // default viewport
        await this.page.setViewport({
            width: 900,
            height: 900,
            deviceScaleFactor: 1
        });
        await this.page.goto(this.url);

        if (this.onLoad && this.onLoad.fn) {
            const args = this.onLoad.args || [];
            await this.page.extensions.evaluate(this.onLoad.fn, ...args);
        }

        this.visualRegression = new VisualRegression({
            page: this.page,
            extensions: this.page.extensions,
            path: this.visualPath,
            visualThreshold: this.visualThreshold,
            shouldRebaseVisuals: this.shouldRebaseVisuals
        });
    }

    async finish() {
        return this.page.close();
    }
};
