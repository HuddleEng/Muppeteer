# Muppeteer
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4a9ea3ccb8704d32b860d22a0e03bfaf)](https://app.codacy.com/app/Huddleoss/Muppeteer?utm_source=github.com&utm_medium=referral&utm_content=HuddleEng/Muppeteer&utm_campaign=badger)
[![Build Status](https://travis-ci.org/HuddleEng/Muppeteer.svg?branch=master)](https://travis-ci.org/HuddleEng/Muppeteer)

<p>
    <img src="https://i.imgur.com/oDiQ0ms.png" width="150px" height="150px" alt="Muppeteer" />
    <p><i>Logo by: <a href="https://twitter.com/hsincyeh">Hsin-chieh Yeh</a></i></p>
</p>

Muppeteer is a visual regression testing framework for running UI tests in Chrome. It's composed of a number of modules:

- [Mocha](https://mochajs.org/) - a test runner framework
- [Chai](http://chaijs.com/) - an assertion library
- [Puppeteer](https://github.com/GoogleChrome/puppeteer) - a library for interacting with Chrome and web pages
- [Puppeteer Extensions](https://github.com/HuddleEng/puppeteer-extensions) - an extension library for Puppeteer with convenience functions
- [Pixelmatch](https://github.com/mapbox/pixelmatch) - a pixel-level image comparison library

In addition, it provides the following core features:
- **Visual Regression Testing** - a screenshot-based image comparison module that hooks onto the assertion API. Read on for more discussion on this.
- **Test Interface** - a modification of Mocha's BDD interface with built-in browser setup steps and other user configurable hooks
- **Test Launcher** - a CLI and configuration function for launching test suites

Muppeteer's main goal is to abstract the, often, tedious boilerplate setup code needed to write tests with Puppeteer, and provide a convenient API for testing UI functionality. It was inspired by the [PhantomCSS](https://github.com/HuddleEng/PhantomCSS) and [CasperJS](http://casperjs.org/) libraries.

**This framework is in beta pre-release currently. It is subject to some breaking changes until the API is finalised. There is also little test coverage as of yet, but it is in the works. Use with caution.**

- ## [Configuration](#configuration-1)
    - ### [CLI](#cli-1)
    - ### [Configuration function](#configuration-function-1)
- ## [Puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)
- ## [Puppeteer Extensions](#puppeteer-extensions-1)
- ## [Example test case](#example-test-case-1)
    - ### [Passing test output](#passing-test-output-1)
    - ### [Failing test output](#failing-test-output-1)
    - ### [Understanding visual failures](#understanding-visual-failures-1)

## Configuration
You can configure Muppeteer via the CLI or a configuration function

### CLI
The CLI script can be referenced at
 [`lib/test-launcher-cli`](https://github.com/HuddleEng/Muppeteer/blob/local-test-server/lib/test-launcher-cli.js).
 
 It is run like `node <<path-to-muppeteer>>/lib/test-launcher-cli <<args>>`
 
 #### Example
```javascript
 "scripts": {
    "test": "node node_modules/muppeteer/lib/test-launcher-cli --p tests/*.test.js --r tests/report"
  }
```

See [Options](#options)
  
## Configuration function
The configuration can be referenced at 
 [`lib/test-launcher`](https://github.com/HuddleEng/Muppeteer/blob/master/lib/test-launcher.js).
 
 ### Example
```javascript
const ConfigureLauncher = require('../lib/test-launcher');
const path = require('path');

const launcher = await ConfigureLauncher({
        testPathPattern: `${__dirname}/tests/*.test.js`
        reportDir: `${__dirname}/tests/report`,
        visualThreshold: 0.05,
        useDocker: true,
        dockerChromeVersion: '67.0.3396.79',
        onFinish: () => {
            // do something after the tests have complete
        }
    }
);

await launcher.launch();
```
## Options
**Note:** Only options with `--` can be run with the proceeding flag in the CLI interface.

- `testPathPattern (--p)`: A glob match for test files. This is the new and recommended way.
- `testDir (--t)`: The directory for Mocha to look for the test files. This is the old way of matching tests.
- `testFilter (--f)`: Allows you to pass in some text to filter the test file name. This is the old way of matching tests.
- `shouldRebaseVisuals (--b)`: A flag to tell the visual regression engine to replace the existing baseline visuals
- `reportDir (--r)`: The directory for the Mocha reporter to dump the report files
- `componentTestUrlFactory`: A function that returns the url for the component test to run
- `componentTestVisualPathFactory`: A function that returns the path for visual tests to run in
- `visualThreshold (--v)`: A value between 0 and 1 to present the threshold at which a visual test may pass or fail
- `onFinish`: A function that can be used to do some extra work after Muppeteer is teared down
- `useDocker (--d)`: The option for telling Muppeteer to run Chrome in Docker to better deal with environmental inconsistencies (default)
- `dockerChromeVersion (--c)`: The version of Chrome to use in the Docker container. This **should** be set explicitly to avoid different environments having different versions of Chrome. By default, the latest version is pulled from the hub, which is **not** recommended.
- `headless (--h)`: Determines whether Chrome will be launched in a headless mode (without GUI) or with a head  (not applicable with `useDocker`)
- `disableSandbox (--s)`: Used to disable the sandbox checks if not using [SUID sandbox](https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md) (not applicable with `useDocker`)
- `executablePath (--e)`: The option to set the version of Chrome to use duning the tests. By default, it uses the bundled version (not applicable with `useDocker`)

## Puppeteer Extensions
You can access the [Puppeteer Extensions API](https://github.com/HuddleEng/puppeteer-extensions/blob/master/README.md) with `page.extensions` in your tests.
## Example test case

```javascript
describeComponent({ name: 'Panel' }, () => {
    describe('Simple mode', async () => {
        const panelContainer = '.first-usage .panel';
        const panelTitle = '.first-usage .panel-title';
        const panelBody = '.first-usage .panel-body';

        it('title and body exist', async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, 'My title');

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, 'This is some test data');
        });
        it('title and body appear correctly', async () => {
            await assert.visual(panelContainer);
        });
    });
    describe('Icon mode', async () => {
        const panelContainer = '.second-usage .panel';
        const panelTitle = '.second-usage .panel-title';
        const panelBody = '.second-usage .panel-body';

        it('title, body and icon exist', async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, 'My title');

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, 'This is a little bit more test data');
        });
        it('title, body and icon appear correctly', async () => {
            await assert.visual(panelContainer);
        });
    });
});

```

## Docker and test fixtures
Muppeteer uses Docker by default to run tests. This helps to avoid environmental differences that could affect the 
rendering of content on the page. You can opt out by configuring the `useDocker (--d)` option accordingly.

You can specify the version of Chrome to use by configuring with the `dockerChromeVersion` option. When you use this option,
the test launcher will automatically pull the correct Docker image from a repository and build the container for you. If you
don't specify this, the `latest` version will be used. This can result in unexpected behaviour, so it's advised to
pin the version with this property.

If you are hosting your test fixtures on a local web server, you'd typically set the URL in the test to
something like http://localhost:3000. When using Docker, the `localhost` will refer to the container,
not the host machine. The simplest solution would be to reference the local IP in the test instead. For example,
http://192.168.0.4:3000.

However, this breaks down when you are running on a device you don't know how to address, e.g. a cloud CI agent.
To solve this problem, you can use the `componentTestUrlFactory` function in launch configuration to generate the URL. 
You can lookup the IP address of the current host and pass that through. This is used to run the example tests in this repo. 
See [network](https://github.com/HuddleEng/Muppeteer/blob/master/tests/network.js) for an example.

```javascript
...
componentTestUrlFactory: () => `http://${IP}:${PORT}`
...
```

### Passing test output
![Passing tests](https://i.imgur.com/3Y0i03o.png "Passing tests")

### Failing test output
![Failing tests tests](https://i.imgur.com/bMfsY1M.png "Failing tests")

### Understanding visual failures

#### Baseline image ####
This is the visual that is versioned in your app repo. It is the source of truth.

![Baseline image](https://i.imgur.com/vUtfI0m.png "Baseline")

#### Current image ####
This is the screenshot taken during the test. In this example, we can see that some extra space on the left has 
pushed the title to the right

![Current image](https://i.imgur.com/kHwikgE.png "Current")

#### Difference image ####
This is an image showing where the differences are. Each difference is layered on top of one another.

![Difference image](https://i.imgur.com/L21lqog.png "Difference")

## Running example tests in this project
This project ships with an example unit and e2e test suite.

`npm run example-unit-tests`

`npm run example-e2e-tests`