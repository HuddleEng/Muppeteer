const Test = require('mocha/lib/test');
const Mochateer = require('./mochateer');

/*
    This is an interface that re-implements Mocha's default BDD test interface with extra hooks to configure Mochateer
 */

module.exports = function(componentTestUrlFactory, componentTestVisualPathFactory) {
    return function(suite) {
        let suites = [suite];

        suite.on('pre-require', function (context, file, mocha) {
            let common = require('mocha/lib/interfaces/common')(suites, context);

            context.before = common.before;
            context.after = common.after;
            context.beforeEach = common.beforeEach;
            context.afterEach = common.afterEach;
            context.run = mocha.options.delay && common.runWithSuite(suite);
            context.Mochateer = null;

            context.describe = context.context = function (title, fn) {
                let suite = common.suite.create({
                    title: title,
                    file: file,
                    fn: fn
                });

                suite.beforeEach(async function() {
                    context.Mochateer.testId = suite.fullTitle() + '__' + this.currentTest.title;
                });

                suite.beforeAll(async function() {
                    await context.Mochateer.init();
                });

                // This pushes the new handlers to the beginning of the array
                // so that it gets called before end user `before()` handlers.
                // This is a hack to avoid re-implementing Mocha internals.
                let lastBeforeAll = suite._beforeAll.pop();
                suite._beforeAll.unshift(lastBeforeAll);

                suite.afterAll(async function() {
                    await context.Mochateer.finish();
                });

                return suite;
            };

            context.describeComponent = context.context = function (component, fn) {
                const componentName = typeof component === 'string' ? component : component.name;

                let suite = common.suite.create({
                    title: componentName,
                    file: file,
                    fn: fn
                });

                suite.beforeAll(async function() {
                    context.Mochateer = new Mochateer({
                        componentName: componentName,
                        url: componentTestUrlFactory(component),
                        visualPath: componentTestVisualPathFactory(component),
                        onLoad: component.onLoad
                    });
                });

                return suite;
            };

            context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
                return common.suite.skip({
                    title: title,
                    file: file,
                    fn: fn
                });
            };

            context.describe.only = function (title, fn) {
                return common.suite.only({
                    title: title,
                    file: file,
                    fn: fn
                });
            };

            context.it = context.specify = function (title, fn) {
                let suite = suites[0];
                if (suite.isPending()) {
                    fn = null;
                }
                let test = new Test(title, fn);
                test.file = file;
                suite.addTest(test);
                return test;
            };

            context.it.only = function (title, fn) {
                return common.test.only(mocha, context.it(title, fn));
            };

            context.xit = context.xspecify = context.it.skip = function (title) {
                context.it(title);
            };

            context.it.retries = function (n) {
                context.retries(n);
            };
        });
    };
};
