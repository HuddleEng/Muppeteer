const puppeteer = require('puppeteer');
const addContext = require('mochawesome/addContext');
const waits = require('./api/waits');
const keyboard = require('./api/keyboard');
const retrieval = require('./api/retrieval');
const visual = require('./api/visual');
const serializeFunctionWithArgs = require('./external/serialization-utils');
const {browserInstance} = require('../lib/test-controller');
const VisualRegression = require('./visual-regression');
const {assert} = require('chai');
const createPageAPI = Symbol('createPageAPI');
const TIMEOUT_MS = 5000;

module.exports = class Mochateer {
    constructor({
            componentName = 'unnamed-component',
            testId,
            url,
            visualThreshold = 0.05,
            visualPath,
            shouldRebaseVisuals,
            onLoad} = {}) {
        this._testId = testId || componentName;
        this._testContext = null;
        this._url = url;
        this._onLoad = onLoad;
        this._visualThreshold = visualThreshold;
        this._visualPath = visualPath;
        this._shouldRebaseVisuals = shouldRebaseVisuals;
        this._resourceRequests = [];
    }
    [createPageAPI]() {
        let self = this;

        let api = Object.assign({}, {
                async turnOffAnimations () {
                    return self._puppeteerPage.evaluate(() => {
                        function disableAnimations() {
                            const jQuery = window.jQuery;
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
                async evaluate(fn, ...args) {
                    const fnStr = serializeFunctionWithArgs(fn, ...args);
                    return self._puppeteerPage.evaluate(fnStr);
                },
                async focus(selector) {
                    return self._puppeteerPage.focus(selector);
                },
                async hover(selector) {
                    return self._puppeteerPage.hover(selector);
                },
                async isElementFocused (selector) {
                    return self._puppeteerPage.evaluate(selector => {
                        const element = document.querySelector(selector);
                        return element === document.activeElement;
                    }, selector);
                },
                async type(selector, text) {
                    return self._puppeteerPage.type(selector, text);
                },
                async click(selector) {
                    return self._puppeteerPage.click(selector);
                },
                async setViewport(viewport) {
                    return self._puppeteerPage.setViewport(viewport);
                },
                async addStyleTag(options) {
                    return self._puppeteerPage.addStyleTag(options);
                }
            },
            waits(self._puppeteerPage, self._resourceRequests, TIMEOUT_MS),
            retrieval(self._puppeteerPage),
            keyboard(self._puppeteerPage),
            visual(self._puppeteerPage)
        );

        // convenience function to wrap around assert.equal
        assert.visual = async function(selector, options) {
            if (options && options.evalBeforeFn) {
                await self._puppeteerPage.evaluate(options.evalBeforeFn)
            }

            const buffer = await api.screenshot(selector);
            let r = await self.visualRegression.compareVisual(buffer, self._testId);

            if (r.passOrFail === 'fail' && r.diffScreenshot) {
                addContext(self._testContext, r.diffScreenshot);
            }

            assert.equal(r.passOrFail, 'pass', `Visual failure for selector '${selector}' with an approximate ${r.misMatchPercentage}% mismatch.`);
        };

        return api;
    }
    async init () {
        let browser = browserInstance.get();
        this._puppeteerPage = await browser.newPage();
        this._page = this[createPageAPI]();

        this._puppeteerPage.on('load', () => {
            this._page.turnOffAnimations();
        });

        this._puppeteerPage.on('request', request => {
            this._resourceRequests.push(request);
        });

        await this._puppeteerPage.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 });
        await this._puppeteerPage.goto(this._url);

        if (this._onLoad && this._onLoad.fn) {
            const args = this._onLoad.args || [];
            await this._page.evaluate(this._onLoad.fn, ...args);
        }

        this.visualRegression = VisualRegression({
            page: this._puppeteerPage,
            path: this._visualPath,
            visualThreshold: this._visualThreshold,
            shouldRebaseVisuals: this._shouldRebaseVisuals
        });
    }
    set testId(testId) {
        this._testId = testId;
    }
    set testContext(context) {
        this._testContext = context;
    }
    get puppeteerPage() {
        return this._puppeteerPage;
    }
    get page() {
        return this._page;
    }
    get assert() {
        return assert;
    }
    resetRequests() {
        this._resourceRequests = [];
    }
    async finish() {
        return this._puppeteerPage.close();
    }
};
