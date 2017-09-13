const puppeteer = require('puppeteer');
const Resemble = require('../src/resemble');
const {assert} = require('chai');
let browser, page, resemble;
const headingSelector = '.container .hero-text h2';
const containerSelector = '.container';

function testName() {
    return this.test.fullTitle().replace(/\s/g, '_').toLowerCase();
}

describe('My ', async function() {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
        await page.goto('https://www.huddle.com');
        resemble = new Resemble({page: page, path: '.'});
    });

    it ('Check header text', async function() {
        await assert.waitForSelector(headingSelector);
        assert.equal(headingSelector, 'Secure document collaboration for government and enterprise.');
    });

    it('Look heading', async function() {
        await resemble.visualCompare(containerSelector, testName.call(this));
    });

    after(async () => {
        browser.close();
    })
});
