describe('Provider', function () {

  // https://stackoverflow.com/questions/14771810/how-to-test-angularjs-custom-provider/17378551#17378551
  var provider;

  beforeEach(function () {
    // Initialize the service provider
    // by injecting it to a fake module's config block
    var fakeModule = angular.module('test.app.config', function () {
    });

    fakeModule.config(function (snippetsProvider) {
      provider = snippetsProvider;
    });

    // Initialize test.app injector
    module('Snippets', 'test.app.config');

    inject(function () {});
  });

  it('tests the content inclusion', function () {

    expect(provider).not.to.be.an('undefined');

    provider.configure({});

    provider.content.before('AA');
    provider.content.before('BB');
    provider.content.after('CC');
    provider.content.after('DD');

    var snippets = provider.$get();

    expect(snippets.content.before).to.deep.equal(['AA', 'BB']);
    expect(snippets.content.after).to.deep.equal(['CC', 'DD']);
  });

});