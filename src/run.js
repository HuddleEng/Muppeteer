const resemble = require('resemblejs');
const fs = require('mz/fs');
const puppeteer = require('puppeteer');
const Capture = require('./capture');

const compare = (file1, file2) => {
    return new Promise(async(resolve, reject) => {
        let diff = resemble(file1).compareTo(file2).onComplete(data => {
            fs.writeFile('../file3.jpg', data.getBuffer(), err => {
                if (err) {
                    reject(err);
                }

                resolve(true);
            });
        });

        diff.ignoreAntialiasing();

    });
};

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({width: 1000, height: 1000, deviceScaleFactor: 1});

    await page.goto('http://huddle.github.io/Resemble.js/',{waitUntil: 'networkidle'});
    await page.click('#example-images');
    await page.waitForSelector('#dropzone2 img');
    await new Capture(page).screenshot({
        path: '../file2.jpg',
        selector: '#dropzone2 img',
        padding: 0
    });

    const file1 = await fs.readFile('../file1.jpg');
    const file2 = await fs.readFile('../file2.jpg');
    await compare(file1, file2);

    browser.close();
})();
