# Muppeteer

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/bd0f4e89b90a48f19bf2115374479e99)](https://www.codacy.com/app/gidztech/Muppeteer?utm_source=github.com&utm_medium=referral&utm_content=HuddleEng/Muppeteer&utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/HuddleEng/Muppeteer.svg?branch=master)](https://travis-ci.org/HuddleEng/Muppeteer)

<p>
    <img src="https://i.imgur.com/oDiQ0ms.png" width="150px" height="150px" alt="Muppeteer" />
    <p><i>Logo by: <a href="https://twitter.com/hsincyeh">Hsin-chieh Yeh</a></i></p>
</p>

**I recently released [`jest-puppeteer-docker`](https://github.com/gidztech/jest-puppeteer-docker), a Jest preset plugin that allows you to run your Jest tests against a Chromium instance running in Docker. I highly recommend this library over Muppeteer if you are using Jest.**

Muppeteer is a visual regression testing framework for running UI tests in Chromium. It's uses a number of modules:

-   [Mocha](https://mochajs.org/) - a test runner framework
-   [Chai](http://chaijs.com/) - an assertion library
-   [Puppeteer](https://github.com/GoogleChrome/puppeteer) - a library for interacting with Chromium and web pages
-   [Puppeteer Extensions](https://github.com/HuddleEng/puppeteer-extensions) - an extension library for Puppeteer with convenience functions
-   [Pixelmatch](https://github.com/mapbox/pixelmatch) - a pixel-level image comparison library

In addition, it provides the following core features:

-   **Visual Regression Testing** - a screenshot-based image comparison module that hooks onto the assertion API.
-   **Test Interface** - a modification of Mocha's BDD interface with built-in browser setup steps and other user configurable hooks
-   **Test Launcher** - a CLI and configuration function for launching test suites

Muppeteer's main goal is to abstract the, often, tedious boilerplate setup code needed to write tests with Puppeteer, and provide a convenient API for testing UI functionality. It was inspired by the [PhantomCSS](https://github.com/HuddleEng/PhantomCSS) and [CasperJS](http://casperjs.org/) libraries.

## Configuration

You can configure Muppeteer via the CLI or a configuration function

### CLI

The CLI script can be referenced at
[`node_modules/.bin/muppeteer`](https://github.com/HuddleEng/Muppeteer/blob/master/bin/launcherCli.js).


#### Example

```javascript
 "scripts": {
    "test": "./node_modules/.bin/muppeteer --p tests/*.test.js --r tests/report"
  }
```

See [Options](#options)

## Configuration function

### Example

```javascript
const Launcher = require('muppeteer');
const path = require('path');

const launcher = new Launcher({
        testPathPattern: `${__dirname}/tests/*.test.js`
        reportDir: `${__dirname}/tests/report`,
        visualThreshold: 0.05,
        useDocker: true,
        onFinish: () => {
            // do something after the tests have complete
        }
    }
);

launcher.run();
```

## Options

**Note:** Only options with `--` can be run with the proceeding flag in the CLI interface.

-   `testPathPattern (--p)`: A glob match for test files. This is the new and recommended way.
-   `testDir (--t)`: The directory for Mocha to look for the test files. This is the old way of matching tests.
-   `testFilter (--f)`: Allows you to pass in some text to filter the test file name. This is the old way of matching tests.
-   `shouldRebaseVisuals (--b)`: A flag to tell the visual regression engine to replace the existing baseline visuals
-   `reportDir (--r)`: The directory for the Mocha reporter to dump the report files
-   `componentTestUrlFactory`: A function that returns the url for the component test to run
-   `componentTestVisualPathFactory`: A function that returns the path for visual tests to run in
-   `visualThreshold (--v)`: A value between 0 and 1 to present the threshold at which a visual test may pass or fail
-   `onFinish`: A function that can be used to do some extra work after Muppeteer is teared down
-   `useDocker (--d)`: The option for telling Muppeteer to run Chromium in Docker to better deal with environmental inconsistencies (default)
-   `headless (--h)`: Determines whether Chromium will be launched in a headless mode (without GUI) or with a head (not applicable with `useDocker`)
-   `disableSandbox (--s)`: Used to disable the sandbox checks if not using [SUID sandbox](https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md) (not applicable with `useDocker`)
-   `executablePath (--e)`: The option to set the version of Chromium to use duning the tests. By default, it uses the bundled version (not applicable with `useDocker`)

## Puppeteer Extensions

You can access the [Puppeteer Extensions API](https://github.com/HuddleEng/puppeteer-extensions/blob/master/README.md) with `page.extensions` in your tests.

## Example test case

```javascript
describeComponent({ name: "Panel" }, () => {
    describe("Simple mode", async () => {
        const panelContainer = ".first-usage .panel";
        const panelTitle = ".first-usage .panel-title";
        const panelBody = ".first-usage .panel-body";

        it("title and body exist", async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, "My title");

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, "This is some test data");
        });
        it("title and body appear correctly", async () => {
            await assert.visual(panelContainer);
        });
    });
    describe("Icon mode", async () => {
        const panelContainer = ".second-usage .panel";
        const panelTitle = ".second-usage .panel-title";
        const panelBody = ".second-usage .panel-body";

        it("title, body and icon exist", async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, "My title");

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, "This is a little bit more test data");
        });
        it("title, body and icon appear correctly", async () => {
            await assert.visual(panelContainer);
        });
    });
});
```

## Docker and test fixtures

By default, Docker is used to host the Chromium browser. This helps to avoid environmental differences that could affect the
rendering of content on the page. You can opt out by configuring the `useDocker (--d)` option accordingly.

Muppeteer will pull down a Docker image with Chromium installed with the version matching the one associated with the Puppeteer dependency in your project.

If you are running a web server on your host environment, you should be able to access it from the browser in the container at `host.docker.internal`.

For example, if you have a server running at http://localhost:3000, you can do the following in your test:

```
http://host.docker.internal:3000/my-component
```

### Passing test output

![Passing tests](https://i.imgur.com/3Y0i03o.png "Passing tests")

### Failing test output

![Failing tests tests](https://i.imgur.com/bAWAyIy.png "Failing tests")

### Understanding visual failures

#### Baseline image

This is the visual that is versioned in your app repo. It is the source of truth.

![Baseline image](https://i.imgur.com/TNOV730.png "Baseline")

#### Current image

This is the screenshot taken during the test. In this example, we can see that some extra space on the left has
pushed the title to the right

![Current image](https://i.imgur.com/S1GyQ04.png "Current")

#### Difference image

This is an image showing where the differences are. Each difference is layered on top of one another.

![Difference image](https://i.imgur.com/gIbus9X.png "Difference")

## Running example tests in this project

This project ships with an example unit and e2e test suite.

`npm run example-unit-tests`

`npm run example-e2e-tests`
