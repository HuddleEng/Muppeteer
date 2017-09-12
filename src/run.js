const fs = require('mz/fs');
const {assert} = require('chai');
const puppeteer = require('puppeteer');
const Capture = require('./capture');
const Resemble = require('./resemble');
const r = new Resemble();

const debug = false;
let browser, page;

async function runCompare(selector) {
    await new Capture(page).screenshot({path: '../file2.jpg', selector: '#dropzone2 img'});

    const file1 = await fs.readFile('../file1.jpg');
    const file2 = await fs.readFile('../file2.jpg');
    let isSame = await r.compare(file1, file2);

    if (!debug) {
        try {
            await fs.unlink('../file2.jpg');
            await fs.unlink('../diff.jpg');
        } catch(e) {

        }
    }

    return isSame;
}

describe('Visual test', async function() {
    before(async() => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });

        await page.goto('http://huddle.github.io/Resemble.js/', { waitUntil: 'networkidle' });
        await page.click('#example-images');
        await page.waitForSelector('#dropzone2 img');
    });

    it('Look at image', async function() {
        const selector = '#dropzone2 img';
        let res = await runCompare(selector);
        assert.equal(res, true, `Visuals should be equal for selector ${selector}`);

    });

    after(async () => {
        browser.close();
    })
});
