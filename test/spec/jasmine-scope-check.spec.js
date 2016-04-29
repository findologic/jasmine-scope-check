/*global jasmineScopeCheck*/
describe('jasmine-scope-check.js', function () {
  beforeEach(function () {
    // add spies
  });

  it('should have a working test harness', function () {
    // arrange
    // act
    // assert
    expect(true).not.toBe(false);
  });

  it('should exist', function () {
    // arrange
    // act
    // assert
    expect(typeof jasmineScopeCheck).toBe('function');
  });

  it('should return nothing', function () {
    // arrange
    // act
    var result = jasmineScopeCheck();
    // assert
    expect(result).toBeUndefined();
  });

});
