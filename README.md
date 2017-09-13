# Resemble VRT
Resemble VRT is a Node Visual Regression Testing library, which uses [Resemble JS](https://github.com/Huddle/Resemble.js/) to compare 
differences between two screenshot visuals. Screenshots are created using Google Chrome in Headless mode via the 
[Puppeteer](https://github.com/GoogleChrome/puppeteer) interaction library. This library is loosely based on 
[PhantomCSS](https://github.com/Huddle/PhantomCSS).

## How it works
The first time a screenshot is taken of a selector, a baseline image is stored in your chosen path. The next time the same test runs,
a second screenshot is taken. A visual comparison is made, and a pass/fail state is returned along with the mismatch percentage.

## Example usage
This library doesn't rely on a particular test runner or assertion library. In this example, I'm using Mocha and Chai with a couple of
helper functions. If your visual has changed on purpose, you can delete the baseline image and run the test again to generate a new one. 
You should version the baseline images in GIT or similar.

```javascript
const puppeteer = require('puppeteer');
const Resemble = require('../src/resemble');
const {assert} = require('chai');
let browser, page, resemble;

// selectors
const containerSelector = '.container .hero-text';
const headingSelector = containerSelector + ' h2';

let currentTestName = '';

// wrapper function for asserting visuals
async function compareVisual(containerSelector) {
    let r = await resemble.compareVisual(containerSelector, currentTestName);
    assert.equal(r.result, 'pass', `Visuals should be equal for selector ${containerSelector}`);
}

describe('Huddle home page test ', async function() {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
        await page.goto('https://www.huddle.com');
        resemble = new Resemble({page: page, path: '.'});
    });

    // get the current test name for the visual file
    beforeEach(function() {
        currentTestName = this.currentTest.fullTitle().replace(/\s/g, '_').toLowerCase();
    });

    it('Check header text', async function() {
        await page.waitForSelector(headingSelector);

        const text = await page.evaluate((headingSelector) => {
            return document.querySelector(headingSelector).textContent
        }, headingSelector);

        assert.equal(text, 'Secure document collaboration for government and enterprise.', 'Header text is correct');
    });

    it('Look heading', async function() {
        await compareVisual(containerSelector)
    });

    after(async () => {
        browser.close();
    })
});
```

### Running the tests
```
mocha example --timeout=10000
````

![Example of test](https://i.imgur.com/6CWtGT2.png)
