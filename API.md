## API

## Assertions
Mochateer exposes the `assert` module of Chai onto the `Mochateer` object. This means
you can use all the standard Chai assertions, such as equal, notEqual, isBelow, etc. See 
[Assert](http://chaijs.com/api/assert/#method_assert) for the full API.

In addition, Mochateer adds a `visual` function is patched onto the module. 

**assert.visual(selector)**
- `selector` \<string> Selector of the element to compare

Compares the baseline visual of the element to a newly taken screenshot


## Page

**turnOffAnimations()**

Turn off CSS animations on the page to help avoid flaky visual comparisons


**evaluate(fn, ...args)**
- `fn` \<function> The function to execute on the page
- `args` \<...args> Arguments to be passed into the function

Runs a function on the page


**focus(selector)**
- `selector` \<string> The selector of the element to focus

Focus an element on the page (see: [Focus](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagefocusselector))


**hover(selector)**
- `selector` \<string> The selector of the element to hover

Hover an element on the page (see: [Hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector))


**isElementFocused(selector)**
- `selector` \<string> The selector of the element to check for focus state
- **returns** \<boolean> Whether the element is focused or not

Check if element is focused


**type(selector, text)**
- `selector` \<string> The selector of the element to type into
- `text` \<string> The text to enter into the field

Type into a field on the page (see: [Hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagetypeselector-text-options))


**click(selector)**
- `selector` \<string> The selector of the element to click

Click on an element on the page (see: [Hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options))


**setViewport(viewport)**
- `viewport` \<object> The viewport config object

Set the view port of the page (see: [Hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport))


**addStyleTag(selector)**
- `options` \<object> The config options

Add style tag to the page (see: [Hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions))


### Waits

### Retrieval

### Visual

### Keyboard