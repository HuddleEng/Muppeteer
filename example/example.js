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
