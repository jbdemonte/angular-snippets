describe('Unit testing repeat-done', function() {
  var $compile,
    $rootScope;

  beforeEach(module('Snippets'));

  beforeEach(inject(function(_$compile_, _$timeout_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
  }));

  it('test call only once', function() {

    var scope = $rootScope.$new();

    var called = 0;

    scope.call = function () {
      called++;
    };

    $compile('<ul><li ng-repeat="item in [1,2,3]" repeat-done="call()">{{item}}</li></ul>')(scope);
    scope.$digest();
    $timeout.flush();

    expect(called).to.be.equal(1);
  });
});