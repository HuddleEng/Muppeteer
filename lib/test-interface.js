const Test = require('mocha/lib/test');
const Mochateer = require('../src/mochateer');

/*
    This is an interface that re-implements Mocha's default BDD test interface with extra hooks to configure Mochateer
 */

module.exports = (componentTestUrlFactory, componentTestVisualPathFactory, visualThreshold, shouldRebaseVisuals)  =>{
    return suite => {
        const suites = [suite];

        suite.on('pre-require', (context, file, mocha) => {
            const common = require('mocha/lib/interfaces/common')(suites, context);

            context.before = common.before;
            context.after = common.after;
            context.beforeEach = common.beforeEach;
            context.afterEach = common.afterEach;
            context.run = mocha.options.delay && common.runWithSuite(suite);
            context.Mochateer = null;

            context.describe = context.context = (title, fn) => {
                const suite = common.suite.create({
                    title: title,
                    file: file,
                    fn: fn
                });

                suite.beforeEach(async function() {
                    context.Mochateer.testId = suite.fullTitle() + '__' + this.currentTest.title;
                    context.Mochateer.testContext = this.currentTest.ctx;
                });

                suite.beforeAll(async () => {
                    await context.Mochateer.init();
                });

                // This pushes the new handlers to the beginning of the array
                // so that it gets called before the end user `before()` handlers.
                // This is a hack to avoid re-implementing Mocha internals.
                const lastBeforeAll = suite._beforeAll.pop();
                suite._beforeAll.unshift(lastBeforeAll);

                suite.afterAll(async () => {
                    context.Mochateer.resetRequests();
                    await context.Mochateer.finish();
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

                suite.beforeAll(async () => {
                    context.Mochateer = new Mochateer({
                        componentName: componentName,
                        url: componentTestUrlFactory(component),
                        visualThreshold: visualThreshold,
                        visualPath: componentTestVisualPathFactory(component),
                        shouldRebaseVisuals: shouldRebaseVisuals,
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
