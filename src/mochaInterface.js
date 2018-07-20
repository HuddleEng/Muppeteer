/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-multi-assign: 0 */

/**
 *
 * This file contains functions taken, and sometimes modified, from the MochaJS repository, under MIT licence
 * https://github.com/mochajs/mocha/blob/master/LICENSE
 *
 * This is an interface that re-implements Mocha's default BDD test interface with extra hooks to configure Muppeteer
 * https://github.com/mochajs/mocha/blob/master/lib/interfaces/bdd.js
 *
 *
 * Example usage:
 *  Mocha.interfaces['muppeteer'] = muppeteerInterface(componentTestUrlFactory, componentTestVisualPathFactory, visualThreshold, shouldRebaseVisuals);
 *
 *  componentTestUrlFactory is a function that returns the url for the component test to run
 *  componentTestVisualPathFactory is a function that returns the path for visual tests to run in
 *  visualThreshold is a value between 0 and 1 to present the threshold at which a visual test may pass or fail
 *  shouldRebaseVisuals is a flag to tell the visual regression engine to replace the existing baseline visuals
 *
 * */

const Test = require('mocha/lib/test');
const TestInterface = require('./TestInterface');
const commonInterface = require('mocha/lib/interfaces/common');

module.exports = (
    componentTestUrlFactory,
    componentTestVisualPathFactory,
    visualThreshold,
    shouldRebaseVisuals
) => suite => {
    const suites = [suite];

    suite.on('pre-require', (context, file, mocha) => {
        const common = commonInterface(suites, context);

        context.before = common.before;
        context.after = common.after;
        context.beforeEach = common.beforeEach;
        context.afterEach = common.afterEach;
        context.run = mocha.options.delay && common.runWithSuite(suite);
        context.Muppeteer = null;
        context.TestInterface = null;

        context.describe = context.context = (title, fn) => {
            const s = common.suite.create({
                title,
                file,
                fn
            });

            s.beforeEach(async function onBeforeEach() {
                // Tell Muppeteer what test we are running
                context.Muppeteer.testId = `${s.fullTitle()}__${
                    this.currentTest.title
                }`;
                context.Muppeteer.testContext = this.currentTest.ctx;
            });

            s.beforeAll(async () => {
                // Initialize the Muppeteer instance and get the API
                await context.TestInterface.initialize();
                context.Muppeteer = context.TestInterface;
                context.page = context.Muppeteer.page;
                context.assert = context.Muppeteer.assert;
            });

            // This pushes the new handlers to the beginning of the array
            // so that it gets called before the end user `before()` handlers.
            // This is a hack to avoid re-implementing Mocha internals.
            const lastBeforeAll = s._beforeAll.pop();
            s._beforeAll.unshift(lastBeforeAll);

            s.afterAll(async () => {
                context.page.extensions.resetRequests();
                await context.Muppeteer.finish();
            });

            return s;
        };

        context.describeComponent = context.context = (component, fn) => {
            const componentName =
                typeof component === 'string' ? component : component.name;

            const s = common.suite.create({
                title: componentName,
                file,
                fn
            });

            // Create an instance of Muppeteer for tests run and configure it accordingly

            s.beforeAll(async () => {
                context.TestInterface = new TestInterface({
                    componentName,
                    url: componentTestUrlFactory(component),
                    visualPath: componentTestVisualPathFactory(component, file),
                    visualThreshold,
                    shouldRebaseVisuals,
                    onLoad: component.onLoad
                });
            });

            return s;
        };

        context.xdescribe = context.xcontext = context.describe.skip = (
            title,
            fn
        ) =>
            common.suite.skip({
                title,
                file,
                fn
            });

        context.describe.only = (title, fn) =>
            common.suite.only({
                title,
                file,
                fn
            });

        context.it = context.specify = (title, fn) => {
            const s = suites[0];
            if (s.isPending()) {
                fn = null;
            }
            const test = new Test(title, fn);
            test.file = file;
            s.addTest(test);
            return test;
        };

        context.it.only = (title, fn) =>
            common.test.only(mocha, context.it(title, fn));
        context.xit = context.xspecify = context.it.skip = title =>
            context.it(title);
        context.it.retries = n => context.retries(n);
    });
};
