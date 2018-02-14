const container = '.todoapp';
const input = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem + ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';
const todoCount = '.todo-count';

describeComponent({name: 'todomvc', url: 'http://localhost:3000'}, function() {
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

            // something to break the tests
            //await Muppeteer.page.addStyleTag({ content: '.header { background: black; }'});

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
