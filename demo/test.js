describe('when polluting the global scope', function () {
  it('should fail on additions', function () {
    window.$ = function () {
      console.log('ha! you thought this was jQuery, right?');
    };
  });

  it('should fail on changes', function () {
    window.$ = function () {
      console.log('still not jQuery...');
    };
  });

  it('should fail on deletions', function () {
    delete window.$;
  });

  describe('in nested describe blocks', function () {
    it('should still work', function () {
      window.blubbergurken = true;
    });

    it('should still work... repeatedly', function () {
      window.blubbergurken = false;
    });
  });

  describe('when globalizing something white-listed', function () {
    it('should not cause problems', function () {
      window.legitimatelyGlobal = true;
    });
  })
});
