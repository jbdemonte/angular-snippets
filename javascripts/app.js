angular.module('MyApp', ['Snippets'])

  .config(function(snippetsProvider) {
    snippetsProvider.configure({
      tabs: {
        templateUrl: 'partials/tabs.html'
      },
      pane: {
        templateUrl: 'partials/pane.html'
      }
    });
  })

  .filter('safe', ['$sce', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }])

  .directive('params', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      templateUrl: 'partials/params.html',
      controller: function($scope) {
        var items = $scope.items = [];
        this.add = function(item) {
          items.push(item);
        }
      }
    };
  })

  .directive('item', function () {
    return {
      restrict: 'E',
      require: '^params',
      link: function (scope, element, attrs, ctrl) {
        var item = {
          name: attrs.name,
          types: attrs.type.split(','),
          optional: 'optional' in attrs,
          contents: "<p>" + element.html() + "</p>"
        };
        element.remove();
        ctrl.add(item);
      }
    };
  })

;