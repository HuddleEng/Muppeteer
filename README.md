# Muppeteer
[![Build Status](https://travis-ci.org/HuddleEng/Muppeteer.svg?branch=master)](https://travis-ci.org/HuddleEng/Muppeteer)

Muppeteer is a test framework for running UI tests in Chrome. It is composed of:

- [Mocha](https://mochajs.org/) - a test runner
- [Chai](http://chaijs.com/) - an assertion library
- [Puppeteer](https://github.com/GoogleChrome/puppeteer) - a Node library for interacting with Chrome via RDP
- [Pixelmatch](https://github.com/mapbox/pixelmatch) - a pixel-level image comparison library

Muppeteer provides a convenient test API which abstracts away boilerplate setup code. It's loosely based on
[PhantomCSS](https://github.com/Huddle/PhantomCSS), which runs visual comparisons of images in a (deprecated)
[PhantomJS](http://phantomjs.org/) world.

**This framework is in beta pre-release. While in beta, it is subject to breaking changes. There is also little test coverage as of yet. This is in progress. It is not recommended for use in production while in beta.**

- ## [Configuration](#configuration-1)
    - ### [CLI](#cli-1)
    - ### [Configuration function](#configuration-function-1)
- ## [API](https://github.com/HuddleEng/Muppeteer/blob/master/API.md)
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
    "test": "node node_modules/muppeteer/lib/test-launcher-cli --t tests --f test.js --r tests/report"
  }
```

See [Options](#options)
  
## Configuration function
The configuration can be referenced at 
 [`src/test-launcher`](https://github.com/HuddleEng/Muppeteer/blob/local-test-server/src/test-launcher.js).
 
 ### Example
```javascript
const ConfigureLauncher = require('../src/test-launcher');
const path = require('path');
const testsPath = path.join(__dirname, 'tests');

ConfigureLauncher({
        testDir: testsPath,
        testFilter: 'test.js',
        reportDir: `${testsPath}/report`,
        visualThreshold: 0.05,
        headless: true,
        disableSandbox: false,
        onFinish: () => {
            // do something after the tests have complete
        }
    }
).launch();
```
## Options
**Note:** Only options with `--` can be run with the proceeding flag in the CLI interface.

- `testDir (--t)`: The directory for Mocha to look for the test files
- `testFilter (--f)`: Allows you to pass in some text to filter the test file name, it's just a substring match, nothing fancy
- `shouldRebaseVisuals`: A flag to tell the visual regression engine to replace the existing baseline visuals
- `reportDir (--r)`: The directory for the Mocha reporter to dump the report files
- `componentTestUrlFactory`: A function that returns the url for the component test to run
- `componentTestVisualPathFactory`: A function that returns the path for visual tests to run in
- `visualThreshold (--v)`: A value between 0 and 1 to present the threshold at which a visual test may pass or fail
- `onFinish`: A function that can be used to do some extra work after Muppeteer is teared down
- `headless (--h)`: Determines whether Chrome will be launched in a headless mode (without GUI) or with a head
- `disableSandbox (--s)`: Used to disable the sandbox checks if not using [SUID sandbox](https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md)
- `executablePath (--e)`: The option to set the version of Chrome to use duning the tests. By default, it uses the bundled version

## Example test case

```javascript
const container = '.todoapp';
const input = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem + ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';
const todoCount = '.todo-count';

describeComponent({name: 'todomvc', url: 'http://localhost:3000'}, () => {
    describe('Add a todo item', async () => {
        it('typing text and hitting enter key adds new item', async () => {
            await page.waitForSelector(input);
            await page.type(input, 'My first item');
            await page.keyboard.press('Enter');
            await page.waitForSelector(firstItem);
            assert.equal(await page.getText(firstItem), 'My first item');
            await assert.visual(container);
        });
        it('clicking checkbox marks item as complete', async () => {
            await page.waitForSelector(firstItemToggle);
            await page.click(firstItemToggle);

            // something to break the tests
            // await page.addStyleTag({ content: '.header { padding-top: 50px; }'});

            await page.waitForNthSelectorAttributeValue(listItem, 1, 'class', 'completed');
            await assert.visual(container);
        });
        it('typing more text and hitting enter adds a second item', async () => {
            await page.type(input, 'My second item');
            await page.keyboard.press('Enter');
            await page.waitForSelector(secondItem);
            assert.equal(await page.getText(secondItem), 'My second item');
            await assert.visual(container);
        });
        it('hovering over first item shows x button', async () => {
            await page.hover(firstItem);
            await assert.visual(container);
        });
        it('clicking on first item x button removes it from the list', async () => {
            await page.click(firstItemRemoveButton);
            await page.waitForElementCount(listItem, 1);
            assert.equal(await page.getText(todoCount), '1 item left');
            await assert.visual(container);
        });
    });
});

```

### Passing test output
![Passing tests](https://i.imgur.com/EOA3rJ6.png "Passing tests")

### Failing test output
![Failing tests tests](https://i.imgur.com/rPY6Bjq.png "Failing tests")

### Understanding visual failures

#### Baseline image ####
This is the visual that is versioned in your app repo. It is the source of truth.

![Baseline image](https://i.imgur.com/8dlSqyT.png "Baseline")

#### Current image ####
This is the screenshot taken during the test. In this example, we can see that some padding has 
pushed the text input field down.

![Current image](https://i.imgur.com/DVV3jvZ.png "Current")

#### Difference image ####
This is an image showing where the differences are. Each difference is layered on top of one another. Here we can see 
that the "What needs to be done?" placeholder has moved down, and so it's sitting on top of where "My first item" 
previously was. 

![Difference image](https://i.imgur.com/C1wpxc5.png "Difference")
