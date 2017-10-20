// TODO: script for setting up mocha interface with config like: Mocha.interfaces['mochateer'] = mochateerInterface(componentTestUrlFactory, componentTestVisualPathFactory);
// selectors
const containerSelector = '.container .hero-text';
const headingSelector = containerSelector + ' h2';
const betterResultsSection = '.section--better-results';

describeComponent({name: 'huddle-home', url: 'https://www.huddle.com'}, function() {
    describe('Huddle home page test', async function() {
        it('Check header text', async function() {
            await Mochateer.page.waitForSelector(headingSelector);
            const text = await Mochateer.page.getText(headingSelector);
            await Mochateer.assert.equal(text, 'Secure document collaboration for government and enterprise.', 'Header text is correct');
        });
        it('Look at better results section', async function() {
            await Mochateer.assert.visual(betterResultsSection);
        });
    });
});
