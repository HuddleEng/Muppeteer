const container = '.todoapp';
const inputSelector = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem+ ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';

describeComponent({name: 'todomvc', url: 'http://todomvc.com/examples/react/#/'}, function() {
    describe('Add a todo item', async function() {
        it('typing text and hitting enter key adds new item', async function() {
            await Mochateer.page.waitForSelector(inputSelector);
            await Mochateer.page.type(inputSelector, 'My first item');
            await Mochateer.page.keyboard.press('Enter');
            await Mochateer.page.waitForSelector(firstItem);
            const text = await Mochateer.page.getText(firstItem);
            await Mochateer.assert.equal(text, 'My first item');
            await Mochateer.assert.visual(container);
        });
        it('clicking checkbox marks item as complete', async function() {
            await Mochateer.page.waitForSelector(firstItemToggle);
            await Mochateer.page.click(firstItemToggle);
            await Mochateer.page.waitForNthSelectorAttributeValue('.todo-list li', 1, 'class', 'completed');
            await Mochateer.assert.visual(container);
        });
        it('typing more text and hitting enter adds a second item', async function() {
            await Mochateer.page.type(inputSelector, 'My second item');
            await Mochateer.page.keyboard.press('Enter');
            await Mochateer.page.waitForSelector(secondItem);
            const text = await Mochateer.page.getText(secondItem);
            await Mochateer.assert.equal(text, 'My second item');
            await Mochateer.assert.visual(container);
        });
        it('clicking on first item x button removes it from the list', async function() {
            await Mochateer.page.hover(firstItem);
            await Mochateer.page.click(firstItemRemoveButton);
            await Mochateer.page.waitForElementCount(listItem, 1);
            await Mochateer.assert.visual(container);
        });
    });
});
