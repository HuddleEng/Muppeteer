const puppeteer = require('puppeteer');
const ResembleVRT = require('../src/resemble');
const {assert} = require('chai');
let browser, page, resemble;

// selectors
const containerSelector = '.container .hero-text';
const headingSelector = containerSelector + ' h2';
const betterResultsSection = '.section--better-results';

let currentTestName = '';

// wrapper function for asserting visuals
async function compareVisual(containerSelector) {
    let r = await resemble.compareVisual(containerSelector, currentTestName);
    assert.equal(r.result, 'pass', `Visuals should be equal for selector ${containerSelector}`);
}

describe('Huddle home page test ', async() => {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
        await page.goto('https://www.huddle.com');
        resemble = new ResembleVRT({page: page, path: '.'});
    });

    // get the current test name for the visual file
    beforeEach(function() {
        currentTestName = this.currentTest.fullTitle().replace(/\s/g, '_').toLowerCase();
    });

    it('Check header text', async() => {
        await page.waitForSelector(headingSelector);

        const text = await page.evaluate((headingSelector) => {
            return document.querySelector(headingSelector).textContent
        }, headingSelector);

        assert.equal(text, 'Secure document collaboration for government and enterprise.', 'Header text is correct');
    });

    it('Look at heading', async() => {
        await compareVisual(containerSelector)
    });

    it('Look at better results section', async() => {
        await compareVisual(betterResultsSection)
    });

    after(async () => {
        browser.close();
    })
});
