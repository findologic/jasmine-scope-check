describe('when polluting the global scope', function () {
  it('should fail on additions', function () {
    window.$ = function () {
      console.log('ha! you thought this was jQuery, right?');
    };

    expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
  });

  it('should fail on changes', function () {
    window.$ = function () {
      console.log('still not jQuery...');
    };

    expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
  });

  it('should fail on deletions', function () {
    delete window.$;

    expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
  });

  describe('in nested describe blocks', function () {
    it('should still work', function () {
      window.blubbergurken = true;

      expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
    });

    it('should still work... repeatedly', function () {
      window.blubbergurken = false;

      expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
    });
  });

  describe('when globalizing something white-listed', function () {
    it('should not cause problems', function () {
      window.legitimatelyGlobal = true;

      expect(true).toBe(true); // Jasmine would complain if there weren't any expectations.
    });
  })
});
