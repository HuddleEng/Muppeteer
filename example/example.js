const fs = require('mz/fs');
const {assert} = require('chai');
const puppeteer = require('puppeteer');
const Resemble = require('../src/resemble');
let browser, page;

describe('My visual test wooo', async function() {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });

        await page.goto('http://huddle.github.io/Resemble.js/', { waitUntil: 'networkidle' });
        await page.click('#example-images');
        await page.waitForSelector('#dropzone2 img');
    });

    it('Look at image', async function() {
        const visualTestName = this.test.fullTitle().replace(/\s/g, '_').toLowerCase();
        const selector = '#dropzone2 img';
        let res = await new Resemble({
            page: page,
            path: '.',
            name: visualTestName,
            debug: false,
        }).visualCompare(selector);
        assert.equal(res, true, `Visuals should be equal for selector ${selector}`);
    });

    after(async () => {
        browser.close();
    })
});
