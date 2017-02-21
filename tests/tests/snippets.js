describe('snippets', function () {
  var $compile, $rootScope, $httpBackend, $scope, $timeout,
    called, callback,
    element, scope, controller;

  /**
   * Compile template and populate "global" variable
   * @param template
   */
  function compile(template) {
    element = $compile(template)($scope);
    $scope.$digest();
    scope = element.scope();
    controller = element.controller('snippets');
  }

  /**
   * Initialise called to false and create a callback function
   * @param nbPre {Number} PRE element count expected
   */
  function makeCallback(nbPre) {
    called = false;
    callback = function (element) {
      expect(element).not.to.be.an('undefined');
      expect(element.find('pre').length).to.be.equal(nbPre);
      called = true;
    };
  }

  /**
   * Evaluate scope file item
   * @param item {object}
   * @param name {string}
   * @param type {string}
   * @param content {string|null}
   */
  function testFileItem(item, name, type, content) {
    expect(item.name).to.be.equal(name);
    expect(item.type).to.be.equal(type); // prism
    if (content !== null) {
      expect(item.content).to.be.equal(content);
      expect(item.error).to.be.an('undefined');
    } else {
      expect(item.content).to.be.an('undefined');
      expect(item.error).to.be.equal(true);
    }
  }

  /**
   * Evaluate controller content switcher
   * @param before {boolean}
   * @param after {boolean}
   */
  function testContentDisabled(before, after) {
    expect(controller.contentBeforeDisabled()).to.be.equal(before);
    expect(controller.contentAfterDisabled()).to.be.equal(after);
  }


  beforeEach(function () {

    var fakeModule = angular.module('test.app.config', [], function () {});
    fakeModule
      .config(function (snippetsProvider) {
        snippetsProvider.configure({
          highlight: function (element) {
            if (callback) {
              callback(element);
            }
          },
          snippets: {
            template: '<snippets-tabs ng-if="done">' +
                        '<div>' +
                          '<snippets-pane snippet="item" index="$index" ng-repeat="item in items"><pre class="code language-{{item.type}}" ng-bind="item.content"></pre></snippets-pane>' +
                        '<div>' +
                        '<snippets-content-before></snippets-content-before>' +
                        '<div ng-transclude></div>' +
                        '<snippets-content-after></snippets-content-after>' +
                      '</snippets-tabs>'
          }
        });
      });
    module('Snippets', 'test.app.config');

    inject(function () {});
  });

  beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _$timeout_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $scope = $rootScope.$new();
  }));
  it('test path + files + template', function () {

    makeCallback(2);

    $httpBackend.when('GET', 'path/index.html').respond('html');
    $httpBackend.when('GET', 'path/app.js').respond('js');

    compile("<snippets path='path' files='[\"index.html\", \"app.js\"]'></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('path/');
    expect(scope.items.length).to.be.equal(2);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testFileItem(scope.items[1], 'app.js', 'javascript', 'js');
    testContentDisabled(false, false);

  });

  it('test no path + files + template', function () {

    makeCallback(1);

    $httpBackend.when('GET', 'index.html').respond('html');

    compile("<snippets files='[\"index.html\"]'></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(1);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testContentDisabled(false, false);

  });

  it('test disable before content', function () {

    makeCallback(1);

    $httpBackend.when('GET', 'index.html').respond('html');

    compile("<snippets files='[\"index.html\"]' content-before-disabled></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(1);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testContentDisabled(true, false);

  });

  it('test disable after content', function () {

    makeCallback(1);

    $httpBackend.when('GET', 'index.html').respond('html');

    compile("<snippets files='[\"index.html\"]' content-after-disabled></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(1);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testContentDisabled(false, true);

  });

  it('test disable before & after content', function () {

    makeCallback(1);

    $httpBackend.when('GET', 'index.html').respond('html');

    compile("<snippets files='[\"index.html\"]' content-after-disabled content-before-disabled></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(1);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testContentDisabled(true, true);

  });

  it('test path + files with missing', function () {

    makeCallback(2);

    $httpBackend.when('GET', 'path/index.html').respond('html');
    $httpBackend.when('GET', 'path/app.js').respond(404, '');

    compile("<snippets path='path' files='[\"index.html\", \"app.js\"]'></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('path/');
    expect(scope.items.length).to.be.equal(2);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testFileItem(scope.items[1], 'app.js', 'javascript', null);
    testContentDisabled(false, false);

  });

  it('test using manifest', function () {

    makeCallback(2);

    $httpBackend.when('GET', 'manifest.json').respond('{"files": ["index.html", "app.js"]}');
    $httpBackend.when('GET', 'index.html').respond('html');
    $httpBackend.when('GET', 'app.js').respond('js');

    compile("<snippets></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(2);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testFileItem(scope.items[1], 'app.js', 'javascript', 'js');
    testContentDisabled(false, false);

  });

  it('test using manifest with missing files', function () {

    makeCallback(2);

    $httpBackend.when('GET', 'manifest.json').respond('{"files": ["index.html", "app.js"]}');
    $httpBackend.when('GET', 'index.html').respond('html');
    $httpBackend.when('GET', 'app.js').respond(404, '');

    compile("<snippets></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(true);
    expect(scope.done).to.be.equal(true);
    expect(scope.path).to.be.equal('');
    expect(scope.items.length).to.be.equal(2);
    testFileItem(scope.items[0], 'index.html', 'markup', 'html');
    testFileItem(scope.items[1], 'app.js', 'javascript', null);
    testContentDisabled(false, false);

  });

  it('test using missing manifest', function () {

    makeCallback(2);

    $httpBackend.when('GET', 'manifest.json').respond(404, '');

    compile("<snippets></snippets>");

    $httpBackend.flush();
    $timeout.flush();

    expect(called).to.be.equal(false);
    expect(scope.done).to.be.equal(false);
  });
});