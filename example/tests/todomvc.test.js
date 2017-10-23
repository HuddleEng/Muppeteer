const container = '.todoapp';
const input = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem + ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';
const todoCount = '.todo-count';

describeComponent({name: 'todomvc', url: 'http://todomvc.com/examples/react/#/'}, function() {
    describe('Add a todo item', async function() {
        it('typing text and hitting enter key adds new item', async function() {
            await Mochateer.page.waitForSelector(input);
            await Mochateer.page.type(input, 'My first item');
            await Mochateer.page.keyboard.press('Enter');
            await Mochateer.page.waitForSelector(firstItem);
            Mochateer.assert.equal(await Mochateer.page.getText(firstItem), 'My first item');
            await Mochateer.assert.visual(container);
        });
        it('clicking checkbox marks item as complete', async function() {
            await Mochateer.page.waitForSelector(firstItemToggle);
            await Mochateer.page.click(firstItemToggle);
            
            // something to break the tests
            //await Mochateer.page.addStyleTag({ content: '.header { background: black; }'});

            await Mochateer.page.waitForNthSelectorAttributeValue(listItem, 1, 'class', 'completed');
            await Mochateer.assert.visual(container);
        });
        it('typing more text and hitting enter adds a second item', async function() {
            await Mochateer.page.type(input, 'My second item');
            await Mochateer.page.keyboard.press('Enter');
            await Mochateer.page.waitForSelector(secondItem);
            Mochateer.assert.equal(await Mochateer.page.getText(secondItem), 'My second item');
            await Mochateer.assert.visual(container);
        });
        it('hovering over first item shows x button', async function() {
            await Mochateer.page.hover(firstItem);
            await Mochateer.assert.visual(container);
        });
        it('clicking on first item x button removes it from the list', async function() {
            await Mochateer.page.click(firstItemRemoveButton);
            await Mochateer.page.waitForElementCount(listItem, 1);
            Mochateer.assert.equal(await Mochateer.page.getText(todoCount), '1 item left');
            await Mochateer.assert.visual(container);
        });
    });
});
