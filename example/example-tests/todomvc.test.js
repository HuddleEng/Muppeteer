const container = '.todoapp';
const input = 'header input';
const listItem = '.todo-list li';
const firstItem = listItem + ':nth-of-type(1)';
const firstItemToggle = firstItem + ' .toggle';
const firstItemRemoveButton = firstItem + ' button';
const secondItem = listItem + ':nth-of-type(2)';
const todoCount = '.todo-count';

describeComponent({name: 'todomvc', url: 'http://localhost:3000'}, () => {
    describe('Add a todo item', async () => {
        it('typing text and hitting enter key adds new item', async () => {
            await page.waitForSelector(input);
            await page.type(input, 'My first item');
            await page.keyboard.press('Enter');
            await page.waitForSelector(firstItem);
            assert.equal(await page.getText(firstItem), 'My first item');
            await assert.visual(container);
        });
        it('clicking checkbox marks item as complete', async () => {
            await page.waitForSelector(firstItemToggle);
            await page.click(firstItemToggle);

            // something to break the tests
            // await page.addStyleTag({ content: '.header { padding-top: 50px; }'});

            await page.waitForNthSelectorAttributeValue(listItem, 1, 'class', 'completed');
            await assert.visual(container);
        });
        it('typing more text and hitting enter adds a second item', async () => {
            await page.type(input, 'My second item');
            await page.keyboard.press('Enter');
            await page.waitForSelector(secondItem);
            assert.equal(await page.getText(secondItem), 'My second item');
            await assert.visual(container);
        });
        it('hovering over first item shows x button', async () => {
            await page.hover(firstItem);
            await assert.visual(container);
        });
        it('clicking on first item x button removes it from the list', async () => {
            await page.click(firstItemRemoveButton);
            await page.waitForElementCount(listItem, 1);
            assert.equal(await page.getText(todoCount), '1 item left');
            await assert.visual(container);
        });
    });
});