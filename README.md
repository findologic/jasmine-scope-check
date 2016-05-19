# jasmine-scope-check

[![Build Status][build-image]][build-url]
[![Code GPA][gpa-image]][gpa-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][depstat-image]][depstat-url]
[![NPM version][npm-image]][npm-url]

This Jasmine extension is intended for browser code.
It runs between each spec and verifies that the global scope (`window` object) was not changed by comparing its state
before and after the spec, detecting additions, modifications and deletions of `window` properties.

Static code analysis catches a lot of accidental globals, but if the assignment happens indirectly, you'd have to run
the code to find what's wrong. This is what jasmine-scope-check does.

jasmine-scope-check is for you if your code runs in a context out of your control. For example:

1. Your app is embedded in a third party site.
2. Other software uses your library.
3. You just want to write damn good code.

## How to use it

Install the scope check before running any specs:

```
new JasmineScopeCheck({
  globalObject: window
}).install(beforeEach, afterEach);
```

Used like this, a default white list is used that fits a typical browser-Jasmine environment.

See the `demo` directory for a real-world example.

### Options

The following properties can be passed to the `JasmineScopeCheck` constructor:

* `globalObject` (default = `window`): The object to check for changes.
* `expect` (default = `globalObject.expect`): Jasmine's `expect` function.
* `whiteList` (default = `[]`): An array of strings and/or regular expressions that specify property paths that may
  change without causing broken expectations. A property path consists of hierarchical property names from top to
  bottom, separated by dots.
* `maxRecursionDepth` (default = `4`): Properties that are this number of steps removed from `globalObject` are no
  longer checked for changes, which is necessary for performance.
* `useDefaultWhiteList` (default = `true`): By setting this to `false`, only `whiteList` is used for ignoring properties
  that may be changed legitimately. Otherwise, the default white list is used in conjunction with `whiteList`.

### Manual use

In an environment where mechanisms such as Jasmine 2's global `beforeEach()` and `afterEach()` are not available, the
scope check can be invoked manually:

```
var myScope = {};
var scopeCheck = new JasmineScopeCheck({
  globalObject = myScope
});
// Change things in myScope.
scopeCheck.compareGlobalSnapshotWithReality();
// Changes are tracked in: scopeCheck.addedProperties, scopeCheck.changedProperties, scopeCheck.removedProperties.
// Before doing some more changes that should be tracked independently, reset the state:
scopeCheck.reset();
```

### Which file to include

* `dist/jasmine-scope-check.js` if you're not afraid of library conflicts (see TODO below).
* `dist/jasmine-scope-check.min.js` if for whatever reason your test helpers need to be smaller.
* `jasmine-scope-check.js` if you bring the dependencies (lodash, deep-diff) yourself.

## TODO

* Currently, properties belonging to functions are not checked for changes due to an
  [upstream issue](https://github.com/flitbit/diff/issues/69).
* Dependencies are currently exposed in `dist/*.js`, which may lead to conflicts with other versions of lodash and
  deep-diff.
* The default white-list is rather specific and could do with some enhancements.

## Development

```
# Clone the repo.
git clone git@github.com:findologic/jasmine-scope-check.git
# Install dependencies from NPM.
npm install
# Make sure that the gulp command is installed globally.
npm install -g gulp
# Run builds and tests to check that everything works.
gulp
# (optional) Build documentation.
gulp docs
```
  
## Change Log

### v1.0.0

* Additions, changes and removal of properties are tracked.
* `install()` method to wrap around all specs for comprehensive scope check coverage.

## Acknowledgements

* The author and contributors of [flitbit/diff](https://github.com/flitbit/diff) take the pain out of recursive object
  comparison.
* FINDOLOGIC dedicated manpower to create and publish this initially internal tool.

## License

(The MIT License)

Copyright (c) 2016 FINDOLOGIC GmbH

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[build-url]: https://travis-ci.org/findologic/jasmine-scope-check
[build-image]: http://img.shields.io/travis/findologic/jasmine-scope-check.png

[gpa-url]: https://codeclimate.com/github/findologic/jasmine-scope-check
[gpa-image]: https://codeclimate.com/github/findologic/jasmine-scope-check.png

[coverage-url]: https://codeclimate.com/github/findologic/jasmine-scope-check/code?sort=covered_percent&sort_direction=desc
[coverage-image]: https://codeclimate.com/github/findologic/jasmine-scope-check/coverage.png

[depstat-url]: https://david-dm.org/findologic/jasmine-scope-check
[depstat-image]: https://david-dm.org/findologic/jasmine-scope-check.png?theme=shields.io

[issues-url]: https://github.com/findologic/jasmine-scope-check/issues
[issues-image]: http://img.shields.io/github/issues/findologic/jasmine-scope-check.png

[downloads-url]: https://www.npmjs.org/package/jasmine-scope-check
[downloads-image]: http://img.shields.io/npm/dm/jasmine-scope-check.png

[npm-url]: https://www.npmjs.org/package/jasmine-scope-check
[npm-image]: https://img.shields.io/npm/v/npm.svg?maxAge=2592000
