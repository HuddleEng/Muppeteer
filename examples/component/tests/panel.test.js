/* eslint-disable no-undef */

describeComponent({ name: 'Panel' }, () => {
    describe('Simple mode', async () => {
        const panelContainer = '.first-usage .panel';
        const panelTitle = '.first-usage .panel-title';
        const panelBody = '.first-usage .panel-body';

        it('title and body exist', async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, 'My title');

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, 'This is some test data');
        });
        it('title and body appear correctly', async () => {
            await assert.visual(panelContainer);
        });
    });
    describe('Icon mode', async () => {
        const panelContainer = '.second-usage .panel';
        const panelTitle = '.second-usage .panel-title';
        const panelBody = '.second-usage .panel-body';

        it('title, body and icon exist', async () => {
            await page.waitForSelector(panelTitle);
            const titleText = await page.extensions.getText(panelTitle);
            assert.equal(titleText, 'My title');

            await page.waitForSelector(panelBody);
            const bodyText = await page.extensions.getText(panelBody);
            assert.equal(bodyText, 'This is a little bit more test data');
        });
        it('title, body and icon appear correctly', async () => {
            await assert.visual(panelContainer);
        });
    });
});
