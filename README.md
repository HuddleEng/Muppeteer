# Mochateer
Mochateer is a test framework for running UI tests in Chrome. It is composed of:

- [Mocha](https://mochajs.org/) - a test runner
- [Chai](http://chaijs.com/) - assertion library
- [Puppeteer](https://github.com/GoogleChrome/puppeteer)  - a Node library for interacting with Chrome via RDP
- [Resemble.js](https://github.com/Huddle/Resemble.js/) - a Node library for running visual comparisons of images

Mochateer doesn't try to do too much itself, but it provides a convenient test API which abstracts away boilerplate setup code. It's loosely based on [PhantomCSS](https://github.com/Huddle/PhantomCSS), which runs visual comparisons of images in a (deprecated) [PhantomJS](http://phantomjs.org/) world.

This currently work in progress.
