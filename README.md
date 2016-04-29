# jasmine-scope-check

[![Build Status][build-image]][build-url]
[![Code GPA][gpa-image]][gpa-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][depstat-image]][depstat-url]
[![NPM version][npm-image]][npm-url]

This Jasmine extension is intended for browser code.
It runs between each spec and verifies that the global scope (`window` object) was not changed by comparing its state
before and after the spec, detecting additions, modifications and deletions of `window` properties.

Use jasmine-scope-check if your code is used by third parties and/or runs in environments out of your control in,
because modifying `window` may break other people's stuff.

## How to use it

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
[npm-image]: https://badge.fury.io/js/jasmine-scope-check.png
