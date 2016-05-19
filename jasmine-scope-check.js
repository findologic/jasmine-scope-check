/*global _*/

/**
 * A check to ensure that code executed as part of a Jasmine spec does not pollute the global scope by accident.
 *
 * Typical usage:
 *
 *    // When setting up the test environment:
 *    var scopeCheck = new JasmineScopeCheck({
 *      globalObject: window,
 *    };
 *
 *    // Before a spec:
 *    scopeCheck.reset();
 *    // After a spec:
 *    scopeCheck.compareGlobalSnapshotWithReality();
 *    scopeCheck.assertCleanScope();
 *
 *    // Or just install for the global beforeEach() and afterEach():
 *    scopeCheck.install(beforeEach, afterEach);
 *
 *
 * @param {{}} settings
 * @param {{}} [settings.globalObject=window] The object to watch for modifications.
 * @param {function} [settings.expect] The Jasmine expect function, to check if the global scope remained clean.
 * @param {string[]|RegExp[]} [settings.whiteList=[]] Object paths as string or regular expression. If properties (and their children)
 *    matching a white list entry are changed, it is ignored.
 * @param {number} [settings.maxRecursionDepth=4] How deeply the scope check descends into the object graph.
 * @param {boolean} [settings.useDefaultWhiteList=true] If true (default), a set of curated default white list rules is
 *    used. Otherwise, the white-listing depends solely on the user-provided values.
 * @returns {JasmineScopeCheck}
 * @constructor
 */
function JasmineScopeCheck(settings) {
  if (!(this instanceof JasmineScopeCheck)) {
    return new JasmineScopeCheck(settings);
  }

  settings = _.defaults(settings, {
    // Default settings.
    globalObject: window,
    expect: window.expect,
    whiteList: [],
    maxRecursionDepth: 4,
    useDefaultWhiteList: true
  });

  var self = this;

  /**
   * Changes to properties with the paths below are ignored. Additional properties can be white-listed using settings.
   * The default values are based on real-life experience with a large set of specs, but of course it can be improved.
   * @type {string[]|RegExp[]}
   */
  var defaultWhiteList = [
    // Ignore the recursive reference to the window object.
    'window',
    // Generated by jQuery.
    /jQuery[0-9]+/,
    // Created by PhantomJS:
    'frameElement', 'event', 'scrollY', 'pageYOffset', /frames\..*/, /console\.(profiles|memory)/,
    // Internal jQuery state.
    /\$\.cache\..*/, /\$\.timers\..*/,
    // Jasmine spy stuff.
    /\$(\.\w+)+\.(identity|isSpy|plan|mostRecentCall|argsForCall|calls|andCallThrough|andReturn|andThrow|andCallFake|reset|wasCalled|callCount|baseObj|methodName|originalValue)/,
    // Jasmine globals:
    'cleanup', 'isCommonJS', 'spyOn', 'it', 'xit', 'expect', 'runs', 'waits', 'waitsFor', 'beforeEach', 'afterEach',
    'describe', 'xdescribe', 'readFixtures', 'setFixtures', 'spyOnEvent', 'loadStyleFixtures', 'preloadStyleFixtures',
    'loadJSONFixtures', 'htmlReporter', 'console_reporter', 'preloadFixtures', 'getJSONFixture', 'loadFixtures',
    'appendLoadFixtures', 'appendSetFixtures', 'appendLoadStyleFixtures', 'setStyleFixtures', 'appendSetStyleFixtures',
    'sandbox', /jasmine.*/, 'getJasmineRequireObj', 'fdescribe', 'fit', 'beforeAll', 'pending', 'fail', 'jsApiReporter',
    // Browser stuff:
    'external', 'chrome', 'document', 'location', 'setInterval', 'setTimeout', 'top', 'clearTimeout', 'clearInterval',
    'innerWidth', 'TEMPORARY', 'PERSISTENT', 'addEventListener', 'removeEventListener', 'dispatchEvent',
    // Firefox stuff:
    'mozAnimationStartTime', 'mozPaintCount', 'scrollMaxY'
  ];

  if (settings.useDefaultWhiteList) {
    this.whiteList = defaultWhiteList.concat(settings.whiteList);
  } else {
    this.whiteList = settings.whiteList;
  }

  /**
   * Checks if the property with the given name at the given path is white-listed by checking against strings and
   * regular expressions in the white list. A property also counts as white-listed if it is outside of the maximum
   * recursion depth.
   *
   * @param {string[]} path Object path to the property.
   * @param {string} property Name of the property.
   * @returns {boolean} Whether the property is white-listed or not.
   */
  function isWhiteListed(path, property) {
    var isPropertyWhiteListed = false;
    var fullPath = path.concat([property]).join('.');

    // Consider white-listed if the recursion depth has been reached.
    if (path.length >= settings.maxRecursionDepth) {
      return true;
    }

    _.each(self.whiteList, function (entry) {
      if (typeof entry === 'string') {
        isPropertyWhiteListed = fullPath === entry;
      } else if (entry instanceof RegExp) {
        isPropertyWhiteListed = fullPath.match(entry) !== null;
      } else {
        throw new Error('Only strings and regular expressions may be used as white list rules.');
      }

      // Once the property matches a white list item, we don't have to check any further.
      return !isPropertyWhiteListed;
    });

    return isPropertyWhiteListed;
  }

  /**
   * Properties that were added to the global scope since taking a snapshot.
   *
   * @type {string[]}
   */
  this.addedProperties = undefined;

  /**
   * Properties whose value changed since taking a snapshot.
   *
   * @type {string[]}
   */
  this.changedProperties = undefined;

  /**
   * Properties that have been deleted from the global scope since taking a snapshot.
   *
   * @type {string[]}
   */
  this.removedProperties = undefined;

  /**
   * Resets the internal state of the scope check, including detected changes, and visited nodes. The snapshot of the
   * global object is updated as well.
   */
  this.reset = function () {
    this.addedProperties = [];
    this.changedProperties = [];
    this.removedProperties = [];

    this.globalSnapshot = _.merge({}, settings.globalObject);
  };

  /**
   * Uses Jasmine expectations to ensure that the global scope remains clean. This should be called after
   * compareGlobalSnapshotWithReality().
   */
  this.assertCleanScope = function () {
    settings.expect(this.addedProperties.length).toEqual(0,
      'Properties added to global scope: ' + this.addedProperties.join(', '));
    settings.expect(this.changedProperties.length).toEqual(0,
      'Properties changed in global scope: ' + this.changedProperties.join(', '));
    settings.expect(this.removedProperties.length).toEqual(0,
      'Properties removed from global scope: ' + this.removedProperties.join(', '));
  };

  /**
   * Compares a previously taken snapshot of the global object, and compares it to the current state of the latter.
   * After this method is run, you can access detected changes in the properties addedProperties, changedProperties and
   * removedProperties.
   *
   * When calling this method multiple times with the same instance of JasmineScopeCheck, call reset() after inspecting
   * the changes for a fresh start.
   */
  this.compareGlobalSnapshotWithReality = function () {
    // Compare the snapshot to the current state of the global object, and track the changes.
    window.DeepDiff.diff(this.globalSnapshot, settings.globalObject, isWhiteListed, {
      push: function (change) {
        var fullPath = change.path.join('.');

        switch (change.kind) {
          case 'N': // Added
          case 'A': // Added to array
            self.addedProperties.push(fullPath);
            break;
          case 'E': // Edited
            self.changedProperties.push(fullPath);
            break;
          case 'D': // Deleted
            self.removedProperties.push(fullPath);
            break;
        }
      }
    });
  };

  /**
   * Ensures that a scope check is run for every spec. This operation is not reversible without interfering with Jasmine
   * internals.
   *
   * @param {function} jasmineBeforeFunc Jasmine's beforeEach() function.
   * @param {function} jasmineAfterFunc Jasmine's afterEach() function.
   */
  this.install = function (jasmineBeforeFunc, jasmineAfterFunc) {
    jasmineBeforeFunc(function () {
      // Reset the internal state before every spec, so only changes within the spec are detected.
      self.reset();
    });

    jasmineAfterFunc(function () {
      // After each spec, expect to have a clean scope.
      self.compareGlobalSnapshotWithReality();
      self.assertCleanScope();
    });
  };

  this.reset();
}
