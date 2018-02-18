## API

## Assert

Muppeteer exposes the `assert` module of Chai onto the `Muppeteer` object. This means
you can use all the standard Chai assertions, such as equal, notEqual, isBelow, etc. See 
[Assert](http://chaijs.com/api/assert/#method_assert) for the full API.

In addition, Muppeteer adds a `visual` function is patched onto the module. 

**assert.visual(selector)**
- `selector` \<string> Selector of the element to compare

Compares the baseline visual of the element to a newly taken screenshot


## Page
You can access all the native Puppeteer page functions on the `puppeteerPage` object. However, Muppeteer adds 
convenience functions onto `page` object, which is recommended for the majority of use cases.

- [Keyboard](#keyboard)
- [Waits](#waits)
- [Retrieval](#retrieval)
- [Visual](#visual)
- [Miscellaneous](#miscellaneous)


### Keyboard
**down(key)**
- `key` \<string> The key to fire the down event on

Fire down event on a particular keyboard key (see: [down](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboarddownkey-options))


**up(key)**
- `key` \<string> The key to fire the up event on

Fire up event on a particular keyboard key (see: [up](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardupkey-options))


**press(key)**
- `key` \<string> The key to fire the press event on

Fire press event on a particular keyboard key (see: [press](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardpress-options))


**naughtyPress(key)**
- `key` \<string> The key to fire the press event on

Fire press event on a particular keyboard key (alternative version).
This can be used for legacy code using keypress handlers (deprecated)
(see: [keypress](https://www.w3.org/TR/DOM-Level-3-Events/#event-type-keypress))


**type(text, options)**
- `text` \<string> The text to type
- `options` \<object> Keyboard options

Type some text into an input field (see: [type](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardtypetext-options))

**type(selector, text)**
- `selector` \<string> The selector of the element to type into
- `text` \<string> The text to enter into the field

Type into a field on the page (see: [type](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagetypeselector-text-options))


**sendCharacter(char)**
- `char` \<char> The key to fire the up event on

Send a particular character to an input field (see: [sendCharacter](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#keyboardsendcharacterchar))

### Mouse

**focus(selector)**
- `selector` \<string> The selector of the element to focus

Focus an element on the page (see: [focus](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagefocusselector))


**hover(selector)**
- `selector` \<string> The selector of the element to hover

Hover an element on the page (see: [hover](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagehoverselector))


**isElementFocused(selector)**
- `selector` \<string> The selector of the element to check for focus state
- **returns** \<boolean> Whether the element is focused or not

Check if element is focused


**click(selector)**
- `selector` \<string> The selector of the element to click

Click on an element on the page (see: [click](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options))


### Waits
**waitForResource(resource, timeout=defaultTimeout)**
- `resource` \<string> The URL of the resource (or a substring of it)
- `timeout` \<number> Timeout for the check

Wait for a resource request to be responded to


**waitForLoadedWebFontCountToBe(count, timeout=defaultTimeout)**
- `count` \<number> The number of web fonts to expect
- `timeout` \<number> Timeout for the check

Wait for a specific number of web fonts to be loaded and ready on the page


**waitForFunction(fn, options, ...args)**
- `fn` \<function> The function to execute on the page
- `options` \<object> Optional waiting parameters
- `args` \<...args> Arguments to be passed into the function

Wait for function to execute on the page (see [waitForFunction](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforfunctionpagefunction-options-args))


**waitForSelector(selector, timeout=defaultTimeout)**
- `selector` \<string> The selector for the element on the page
- `timeout` \<number> Timeout for the check

Wait for element with a given selector to exist on the page (see [waitForSelector](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options))


**waitUntilExistsAndVisible(selector)**
- `selector` \<string> The selector for the element on the page

Wait until an element exists on the page and is visible (i.e. not transparent) (see [waitForSelector](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options))


**waitWhileExistsAndVisible(selector)**
- `selector` \<string> The selector for the element on the page

Wait while an element still exists on the page and is visible (i.e. not transparent) (see [waitForSelector](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforselectorselector-options))


**waitUntilSelectorHasVisibleContent(selector)**
- `selector` \<string> The selector for the element on the page

Wait until the selector has visible content (i.e. the element takes up some width and height on the page) (i.e. not transparent)


**waitWhileSelectorHasVisibleContent(selector)**
- `selector` \<string> The selector for the element on the page

Wait while the selector has visible content (i.e. the element takes up some width and height on the page) (i.e. not transparent)


**waitForNthSelectorAttribute(selector, nth, attributeName)**
- `selector` \<string> The selector for the element on the page
- `nth` \<number> The nth element found by the selector
- `attributeName` \<string> The attribute name to look for

Wait for the nth element found from the selector has a particular attribute


**waitForSelectorAttribute(selector, attributeName)**
- `selector` \<string> The selector for the element on the page
- `attributeName` \<string> The attribute name to look for

Wait for the element found from the selector has a particular attribute


**waitForNthSelectorAttributeValue(selector, nth, attributeName, attributeValue)**
- `selector` \<string> The selector for the element on the page
- `nth` \<number> The nth element found by the selector
- `attributeName` \<string> The attribute name to look for
- `attributeValue` \<string> The attribute value to match the attributeName

Wait for the nth element found from the selector has a particular attribute value pair


**waitForSelectorAttributeValue(selector, attributeName, attributeValue)**
- `selector` \<string> The selector for the element on the page
- `attributeName` \<string> The attribute name to look for
- `attributeValue` \<string> The attribute value to match the attributeName

Wait for the element found from the selector has a particular attribute value pair


**waitForElementCount(selector, expectedCount)**
- `selector` \<string> The selector for the element on the page
- `expectedCount` \<number> The number of elements to expect

Wait for the element count to be a particular value


**waitForUrl(regex)**
- `regex` \<RegExp> The regular expression to match the URL on

Wait for the current window location to match a particular regular expression


**waitFor(milliseconds)**
- `milliseconds` \<number> The number of milliseconds to wait for

Wait for a given number of milliseconds


### Retrieval

**getValue(selector)**
- `selector` \<string> The selector for the element to get the value for
- **returns** \<string> The value property value for the element

Get the value property value for a particular element


**getText(selector)**
- `selector` \<string> The selector for the element to get the text for
- **returns** \<string> The text property value for the element

Get the text property value for a particular element


**getPropertyValue(selector, property)**
- `selector` \<string> The selector for the element to get the property value for
- `property` \<string> The property to look for
- **returns** \<string> The property value for the element

Get the value of a particular property for a particular element


### Visual
**screenshot(selector)**
- `selector` \<string> The selector for the element to take a screenshot of

Take a screenshot of a particular element on the page (see: [screenshot](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions))

### Miscellaneous

**turnOffAnimations()**

Turn off CSS animations on the page to help avoid flaky visual comparisons


**evaluate(fn, ...args)**
- `fn` \<function> The function to execute on the page
- `args` \<...args> Arguments to be passed into the function

Runs a function on the page


**setViewport(viewport)**
- `viewport` \<object> The viewport config object

Set the view port of the page (see: [setViewport](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport))


**addStyleTag(selector)**
- `options` \<object> The config options

Add style tag to the page (see: [addStyleTag](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageaddstyletagoptions))
