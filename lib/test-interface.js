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
 **/

const Test = require('mocha/lib/test');
const Muppeteer = require('../src/muppeteer');

module.exports = (componentTestUrlFactory, componentTestVisualPathFactory, visualThreshold, shouldRebaseVisuals) => {
    return suite => {
        const suites = [suite];

        suite.on('pre-require', (context, file, mocha) => {
            const common = require('mocha/lib/interfaces/common')(suites, context);

            context.before = common.before;
            context.after = common.after;
            context.beforeEach = common.beforeEach;
            context.afterEach = common.afterEach;
            context.run = mocha.options.delay && common.runWithSuite(suite);
            context.Muppeteer = null;
            context._muppeteerInstance = null;

            context.describe = context.context = (title, fn) => {
                const suite = common.suite.create({
                    title: title,
                    file: file,
                    fn: fn
                });

                suite.beforeEach(async function() {
                    // Tell Muppeteer what test we are running
                    context.Muppeteer.testId = suite.fullTitle() + '__' + this.currentTest.title;
                    context.Muppeteer.testContext = this.currentTest.ctx;
                });

                suite.beforeAll(async () => {
                    // Initialize the Muppeteer instance and get the API
                    context.Muppeteer = await context._muppeteerInstance.initialize();
                });

                // This pushes the new handlers to the beginning of the array
                // so that it gets called before the end user `before()` handlers.
                // This is a hack to avoid re-implementing Mocha internals.
                const lastBeforeAll = suite._beforeAll.pop();
                suite._beforeAll.unshift(lastBeforeAll);

                suite.afterAll(async () => {
                    context.Muppeteer.resetRequests();
                    await context.Muppeteer.finish();
                });

                return suite;
            };

            context.describeComponent = context.context = (component, fn) => {
                const componentName = typeof component === 'string' ? component : component.name;

                const suite = common.suite.create({
                    title: componentName,
                    file: file,
                    fn: fn
                });

                // Create an instance of Muppeteer for tests run and configure it accordingly

                suite.beforeAll(async () => {
                    context._muppeteerInstance = Muppeteer({
                        componentName,
                        url: componentTestUrlFactory(component),
                        visualPath: componentTestVisualPathFactory(component),
                        visualThreshold,
                        shouldRebaseVisuals,
                        onLoad: component.onLoad
                    });
                });

                return suite;
            };

            context.xdescribe = context.xcontext = context.describe.skip = (title, fn) => {
                return common.suite.skip({
                    title: title,
                    file: file,
                    fn: fn
                });
            };

            context.describe.only = (title, fn) => {
                return common.suite.only({
                    title: title,
                    file: file,
                    fn: fn
                });
            };

            context.it = context.specify = (title, fn) => {
                const suite = suites[0];
                if (suite.isPending()) {
                    fn = null;
                }
                const test = new Test(title, fn);
                test.file = file;
                suite.addTest(test);
                return test;
            };

            context.it.only = (title, fn) => {
                return common.test.only(mocha, context.it(title, fn));
            };

            context.xit = context.xspecify = context.it.skip = title => {
                context.it(title);
            };

            context.it.retries = n => {
                context.retries(n);
            };
        });
    };
};
