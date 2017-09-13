const fs = require('mz/fs');
const puppeteer = require('puppeteer');
const Resemble = require('../src/resemble');
let browser, page, resemble;

function testName() {
    return this.test.fullTitle().replace(/\s/g, '_').toLowerCase();
}

describe('My visual test wooo', async function() {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });

        await page.goto('http://huddle.github.io/Resemble.js/');
        await page.click('#example-images');
        await page.waitForSelector('#dropzone2 img');

        resemble = new Resemble({page: page, path: '.'});

    });

    it('Look at image', async function() {
        await resemble.visualCompare('#dropzone2 img', testName.call(this));
    });

    after(async () => {
        browser.close();
    })
});
