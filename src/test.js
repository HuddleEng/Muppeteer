const puppeteer = require('puppeteer');
const {detectType, quoteString, keyCodeForKey} = require('./testUtils');
const {browserInstance, debugMode} = require('./testController');
const ResembleVRT = require('./resemble');
const {assert} = require('chai');
const createExtensionFunctions = Symbol('createExtensionFunctions');

module.exports = class Test {
    constructor({
            componentName = 'unnamed-component',
            testId,
            url,
            visualPath,
            onLoad} = {}) {
        this.testId = testId || componentName;
        this.url = url;
        this.name = componentName;
        this.onLoad = onLoad;
        this.visualPath = visualPath;
        this.resourceRequests = [];
    }
    [createExtensionFunctions]() {
        let self = this;
        return {
            turnOffAnimations: () => {
                self._page.evaluate(() => {
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
            waitForResource (resource) {
                return new Promise((resolve, reject) => {
                    let request = this.resourceRequests.find(r => r.url.indexOf(resource) !== -1);

                    if (request && request.response()) {
                        resolve();
                    }

                    const startTime = new Date().getTime();
                    const timer = setInterval(() => {
                        if ((new Date().getTime() - startTime) < 10000) {
                            request = this.resourceRequests.find(r => r.url.indexOf(resource) !== -1);

                            if (request && request.response()) {
                                clearInterval(timer);
                                resolve();
                            }
                        } else {
                            clearInterval(timer);
                            reject('Timeout waiting for resource match.');
                        }
                    }, 100);
                });
            },
            // Taken and modified from: from https://github.com/ariya/phantomjs/blob/master/src/modules/webpage.js#L354-L388
            async betterEvaluate(fn, ...args) {
                if (!(fn instanceof Function || typeof fn === 'string' || fn instanceof String)) {
                    throw new Error('Wrong use of betterEvaluate');
                }

                let str = '(function() { return (' + fn.toString() + ')(';

                args.forEach(arg => {
                    let argType = detectType(arg);

                    switch (argType) {
                        case 'object':      //< for type "object"
                        case 'array':       //< for type "array"
                            str += JSON.stringify(arg) + ',';
                            break;
                        case 'date':        //< for type "date"
                            str += 'new Date(' + JSON.stringify(arg) + '),';
                            break;
                        case 'string':      //< for type "string"
                            str += quoteString(arg) + ',';
                            break;
                        default:            // for types: "null", "number", "function", "regexp", "undefined"
                            str += arg + ',';
                            break;
                    }
                });

                str = str.replace(/,$/, '') + '); })()';
                return await self._page.evaluate(str);
            },
            async getPropertyValue(selector, property) {
                try {
                    return await self._page.evaluate((selector, property) => {
                        const element = document.querySelector(selector);
                        return element[property];
                    }, selector, property);
                } catch(e) {
                    throw new Error(`Unable able to get ${property} from ${selector}.`, e);
                }
            },
            async waitForElementCount(selector, expectedCount) {
                return new Promise(async(resolve, reject) => {
                    self._page.waitForFunction((selector, expectedCount) => {
                        return document.querySelectorAll(selector).length === expectedCount;
                    }, {timeout: 10000}, selector, expectedCount).then(() => {
                        resolve(true);
                    }).catch(() => {
                        reject(new Error(`Timeout exceeded: Element count for selector ${selector} is not ${expectedCount}.`));
                    });
                });
            },
            async naughtyPress(selector, key) {
                const keyCode = keyCodeForKey(key);
                await self._page.evaluate((selector, keyCode) => {
                    const element = document.querySelector(selector);
                    const evt = new CustomEvent('keypress');
                    evt.keyCode = keyCode;
                    element.dispatchEvent(evt);
                }, selector, keyCode);
            },
            waitFor(milliseconds) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, milliseconds);
                });
            },
            async compareVisual(selector) {
                let r = await self.resemble.compareVisual(selector, self.testId);
                assert.equal(r.result, 'pass', `Visual fail: { selector: #{{name}}, misMatchPercentage: ${r.misMatchPercentage} }`);
            }
        };
    }
    async init () {
        let browser = await browserInstance.getBrowser(puppeteer);
        this._page = await browser.newPage();
        this._extensions = this[createExtensionFunctions]();

        this._page.on('load', () => {
            this._extensions.turnOffAnimations();
        });

        this._page.on('request', request => {
            this.resourceRequests.push(request);
        });

        await this._page.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 });
        await this._page.goto(this.url);

        if (this.onLoad && this.onLoad.fn) {
            const args = this.onLoad.args || [];
            await this._extensions.betterEvaluate(this.onLoad.fn, ...args);
        }

        this.resemble = new ResembleVRT({
            page: this._page,
            path: this.visualPath,
            visualThresholdPercentage: 0.05,
            debug: debugMode()
        });
    }
    setTestId(testId) {
        this.testId = testId;
    }
    get page() {
        return this._page;
    }
    get extensions() {
        return this._extensions;
    }
    get assert() {
        return assert;
    }
    async finish() {
        await this.page.close();
    }
};
