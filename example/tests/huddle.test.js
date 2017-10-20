const contactUsLink = '.navbar-nav .menu-link-contact-us';
const betterResultsSection = '.section--better-results';

describeComponent({name: 'huddle-home', url: 'https://www.huddle.com'}, function() {
    describe('Huddle home page test', async function() {
        it('Check contact us link text', async function() {
            await Mochateer.page.waitForSelector(contactUsLink);
            const text = await Mochateer.page.getText(contactUsLink);
            await Mochateer.assert.equal(text, 'Contact Us');
        });
        it('Look at better results section', async function() {
            await Mochateer.assert.visual(betterResultsSection);
        });
    });
});
