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

## [API](https://github.com/gidztech/Muppeteer/blob/master/API.md)

## Example Usage

```javascript
const container = '.todoapp';
const input = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem + ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';
const todoCount = '.todo-count';

ddescribeComponent({name: 'todomvc', url: 'http://todomvc.com/examples/react/#/'}, function() {
    describe('Add a todo item', async function() {
        it('typing text and hitting enter key adds new item', async function() {
            await Muppeteer.page.waitForSelector(input);
            await Muppeteer.page.type(input, 'My first item');
            await Muppeteer.page.keyboard.press('Enter');
            await Muppeteer.page.waitForSelector(firstItem);
            Muppeteer.assert.equal(await Muppeteer.page.getText(firstItem), 'My first item');
            await Muppeteer.assert.visual(container);
        });
        it('clicking checkbox marks item as complete', async function() {
            await Muppeteer.page.waitForSelector(firstItemToggle);
            await Muppeteer.page.click(firstItemToggle);
            await Muppeteer.page.waitForNthSelectorAttributeValue(listItem, 1, 'class', 'completed');
            await Muppeteer.assert.visual(container);
        });
        it('typing more text and hitting enter adds a second item', async function() {
            await Muppeteer.page.type(input, 'My second item');
            await Muppeteer.page.keyboard.press('Enter');
            await Muppeteer.page.waitForSelector(secondItem);
            Muppeteer.assert.equal(await Muppeteer.page.getText(secondItem), 'My second item');
            await Muppeteer.assert.visual(container);
        });
        it('hovering over first item shows x button', async function() {
            await Muppeteer.page.hover(firstItem);
            await Muppeteer.assert.visual(container);
        });
        it('clicking on first item x button removes it from the list', async function() {
            await Muppeteer.page.click(firstItemRemoveButton);
            await Muppeteer.page.waitForElementCount(listItem, 1);
            Muppeteer.assert.equal(await Muppeteer.page.getText(todoCount), '1 item left');
            await Muppeteer.assert.visual(container);
        });
    });
});

```

### Test Output
![Passed tests](https://i.imgur.com/TvNGwmU.png "Passed tests")

**Baseline images:**
![Baseline images](https://i.imgur.com/ohp58e5.png "Baseline images")

### Failed Visual
![Failed tests](https://i.imgur.com/WTWi80H.png "Failed tests")

![Failed visuals](https://i.imgur.com/7D8C5rf.gif "Failed Visuals")

