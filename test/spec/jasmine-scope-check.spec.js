/*global JasmineScopeCheck,describe,it,xit,expect,beforeEach,afterEach,spyOn,jasmine,_*/
describe('jasmine-scope-check.js', function () {
  var scopeCheck;
  var settings;

  beforeEach(function () {
    var expectReturnValue = {
      toEqual: jasmine.createSpy('expect.toEqual')
    };
    settings = {
      globalObject: {},
      expect: function () {
        return expectReturnValue;
      },
      whiteList: [
        /scopeCheck.*/
      ]
    };

    spyOn(settings, 'expect').and.callThrough();

    scopeCheck = new JasmineScopeCheck(settings);
  });

  describe('when constructing the scope check', function () {
    it('should create an instance', function () {
      expect(new JasmineScopeCheck({
          globalObject: {}
        }) instanceof JasmineScopeCheck).toBe(true);
    });
  });

  describe('when calling the scope check like a function instead of construction', function () {
    it('should create an instance anyway', function () {
      /* jshint ignore:start */
      expect(JasmineScopeCheck({
          globalObject: {}
        }) instanceof JasmineScopeCheck).toBe(true);
      /* jshint ignore:end */
    });

    it('should not attach methods to the window object', function () {
      //noinspection JSUnresolvedVariable
      expect(window.compareGlobalSnapshotWithReality).toBeUndefined();
    });
  });

  describe('when changes have been found', function () {
    beforeEach(function () {
      // Prepare fake tracked changes.
      scopeCheck.addedProperties = ['window.jQuery'];
      scopeCheck.changedProperties = ['window.require'];
      scopeCheck.removedProperties = ['window.test'];
    });

    it('should clear the change tracking data structures when resetting', function () {
      scopeCheck.reset();

      expect(scopeCheck.addedProperties.length).toEqual(0);
      expect(scopeCheck.changedProperties.length).toEqual(0);
      expect(scopeCheck.removedProperties.length).toEqual(0);
    });

    it('should run expectations against the change tracking data structures when asserting', function () {
      expect(settings.expect.calls.count()).toEqual(0);

      scopeCheck.assertCleanScope();

      expect(settings.expect.calls.count()).toEqual(3);
      expect(settings.expect().toEqual.calls.count()).toEqual(3);
    });
  });

  describe('when changes in an actual object graph are made', function () {
    beforeEach(function () {
      var objectGraph = {
        obj: {
          obj: {
            obj: {
              primitive1: 123,
              primitive2: 'foobar',
              obj: {
                obj: {
                  obj: {
                    primitiveBeyondRecursionLimit: true
                  }
                }
              }
            }
          }
        },
        func: function () {
        },
        primitive: 'foo',
        scopeCheck: {
          primitive: false
        }
      };
      objectGraph.func.primitive = 456;

      scopeCheck = new JasmineScopeCheck({
        globalObject: objectGraph,
        whiteList: settings.whiteList
      });

      // Modifications to the live object tree:
      objectGraph.obj.addedProperty = 'test'; // Added property
      objectGraph.primitive = 'barfoo'; // Changed property
      delete objectGraph.obj.obj.obj.primitive2; // Removed property
      objectGraph.func.primitive++; // Change property of a function
      objectGraph.obj.obj.obj.obj.obj.obj.primitiveBeyondRecursionLimit = false; // Change beyond observed depth
      objectGraph.jQuery12345 = function () {}; // Added property that is white-listed via string
      objectGraph.scopeCheck.primitive = true; // Changed property that is white-listed via regex

      // Compare the snapshot with the modified graph, so we can expect certain things to have been detected.
      scopeCheck.compareGlobalSnapshotWithReality();
    });

    it('should detect additions', function () {
        expect(scopeCheck.addedProperties).toEqual(['obj.addedProperty']);
    });

    it('should detect changes', function () {
        expect(scopeCheck.changedProperties).toContain('primitive');
    });

    it('should detect deletions', function () {
        expect(scopeCheck.removedProperties).toEqual(['obj.obj.obj.primitive2']);
    });

    // TODO: Re-enable once https://github.com/flitbit/diff/issues/69 is resolved.
    xit('should detect changes to a property of a function', function () {
      expect(scopeCheck.changedProperties).toContain('func.primitive');
    });

    it('should not detect any changes beyond the recursion depth limit', function () {
        expect(scopeCheck.changedProperties).not.toContain(
          'obj.obj.obj.obj.obj.obj.primitiveBeyondRecursionLimit');
    });

    it('should allow changes under white-listed entries specified as string', function () {
        expect(scopeCheck.addedProperties).not.toContain('jQuery12345');
    });

    it('should allow changes under white-listed entries specified as regular expression', function () {
        expect(scopeCheck.changedProperties).not.toContain('scopeCheck');
    });
  });

  describe('when calling compareGlobalSnapshotWithReality', function () {
    it('should not break things', function () {
      scopeCheck.compareGlobalSnapshotWithReality();
      // No exceptions? That's great.
    });
  });

  describe('when installing the scope check', function () {
    var beforeEachSpy;
    var afterEachSpy;

    beforeEach(function () {
      beforeEachSpy = jasmine.createSpy('beforeEach');
      afterEachSpy = jasmine.createSpy('afterEach');

      scopeCheck.install(beforeEachSpy, afterEachSpy);
    });

    it('should call beforeEach and afterEach', function () {
      expect(beforeEachSpy.calls.count()).toEqual(1);
      expect(afterEachSpy.calls.count()).toEqual(1);
    });

    describe('when the beforeEach callback is called', function () {
      beforeEach(function () {
        spyOn(scopeCheck, 'reset');
        var beforeEachCallback = beforeEachSpy.calls.argsFor(0)[0];
        beforeEachCallback();
      });

      it('should reset the scope check state state', function () {
        expect(scopeCheck.reset).toHaveBeenCalled();
      });
    });

    describe('when the afterEach callback is called', function () {
      beforeEach(function () {
        spyOn(scopeCheck, 'compareGlobalSnapshotWithReality');
        spyOn(scopeCheck, 'assertCleanScope');
        var afterEachCallback = afterEachSpy.calls.argsFor(0)[0];
        afterEachCallback();
      });

      it('should compare the snapshot with the global object', function () {
        expect(scopeCheck.compareGlobalSnapshotWithReality).toHaveBeenCalled();
      });

      it('should assert that the global object is clean', function () {
        expect(scopeCheck.assertCleanScope).toHaveBeenCalled();
      });
    });
  });

  describe('when not using the default white list', function () {
    var globalObject = {};
    var expectedWhiteListedProperty = 'somethingThatReallyNeedsToBeGlobal';
    var expectedNonWhiteListedProperty = 'jQuery1234';

    beforeEach(function () {
      scopeCheck = new JasmineScopeCheck(_.defaults({
        globalObject: globalObject,
        useDefaultWhiteList: false,
        whiteList: [expectedWhiteListedProperty]
      }, settings));

      globalObject[expectedWhiteListedProperty] = true;
      globalObject[expectedNonWhiteListedProperty] = true;
    });

    it('should consider only the provided entries', function () {
      expect(scopeCheck.whiteList.length).toEqual(1);
      expect(scopeCheck.whiteList).toContain(expectedWhiteListedProperty);

      scopeCheck.compareGlobalSnapshotWithReality();
      expect(scopeCheck.addedProperties).toEqual([expectedNonWhiteListedProperty]);
    });
  });

  describe('when using the default white list', function () {
    var globalObject = {};
    var expectedWhiteListedProperty = 'somethingThatReallyNeedsToBeGlobal';

    beforeEach(function () {
      scopeCheck = new JasmineScopeCheck(_.defaults({
        globalObject: globalObject,
        useDefaultWhiteList: true,
        whiteList: [expectedWhiteListedProperty]
      }, settings));

      globalObject[expectedWhiteListedProperty] = true;
    });

    it('should consider provided entries in addition to the default rules', function () {
      expect(scopeCheck.whiteList.length).toBeGreaterThan(1);
      expect(scopeCheck.whiteList).toContain(expectedWhiteListedProperty);

      scopeCheck.compareGlobalSnapshotWithReality();
      expect(scopeCheck.addedProperties.length).toEqual(0);
    });
  });

  describe('when providing a white list entry that is neither string nor regular expression', function () {
    beforeEach(function () {
      var globalObject = {
        foo: 'bar'
      };

      scopeCheck = new JasmineScopeCheck(_.defaults({
        globalObject: globalObject,
        useDefaultWhiteList: false,
        whiteList: [{}]
      }, settings));
    });

    it('should throw an exception', function () {
      expect(function () {
        scopeCheck.compareGlobalSnapshotWithReality();
      }).toThrow(new Error('Only strings and regular expressions may be used as white list rules.'));
    });
  });
});
