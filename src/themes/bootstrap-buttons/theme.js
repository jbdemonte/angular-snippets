/*!
 * angular-snippets theme: Bootstrap Buttons
 *  Version   : 1.0.0
 *  Date      : 2015-06-30
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html
 */
(function (angular) {
  angular.module('SnippetsThemeBootstrapButtons', ['Snippets'])

    .config(['snippetsProvider', function (snippetsProvider) {
      snippetsProvider.configure({
        snippets: {
          template: '<snippets-tabs ng-if="done">' +
                      '<div>' +
                      '<snippets-pane snippet="item" index="$index" ng-repeat="item in items"><pre class="code language-{{item.type}}"><code class="code language-{{item.type}}" ng-bind="item.content"></code></pre></snippets-pane>' +
                      '<div>' +
                      '<snippets-content-before></snippets-content-before>' +
                      '<div ng-transclude></div>' +
                      '<snippets-content-after></snippets-content-after>' +
                    '</snippets-tabs>'
        }
      });
    }])

    /**
     * main directive to add header tabs
     * based on http://jsfiddle.net/Wijmo/ywUYQ/
     * prepend content with ng-repeat file panes
     */
    .directive('snippetsTabs', function () {
      return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template: '<nav>' +
                    '<a ng-repeat="pane in panes" href="" class="btn {{pane.snippet.cls}}" ng-class="{error: pane.snippet.error, active:pane.selected}" ng-click="!pane.snippet.error && select(pane)">' +
                      '<i ng-if="pane.snippet.icon" class="{{pane.snippet.icon}}"></i>' +
                      '<span>{{pane.snippet.name}}</span>' +
                    '</a>' +
                  '</nav>' +
                  '<div class="tab-content" ng-transclude></div>',
        controller: ['$scope', function ($scope) {
          var selectNext = true,
            panes = $scope.panes = [];

          $scope.select = function (pane) {
            angular.forEach(panes, function (pane) {
              pane.selected = false;
            });
            pane.selected = true;
            $scope.current.snippet = pane.snippet;
          };

          this.addPane = function (pane) {
            var fromLoop = angular.isDefined(pane.index);
            if (!pane.snippet.error && (selectNext || pane.snippet.selected)) {
              selectNext = !fromLoop && !pane.snippet.selected;
              $scope.select(pane); // select at least first item (required if none are unavailable)
            }
            if (fromLoop) {
              panes.splice(pane.index, 0, pane);
            } else {
              panes.push(pane);
            }
          };
        }]
      };
    })

    .directive('snippetsPane', function () {
      return {
        require: '^snippetsTabs',
        restrict: 'E',
        transclude: true,
        scope: {
          snippet: '=',
          index: '='
        },
        template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',
        link: function (scope, element, attrs, tabsCtrl) {
          tabsCtrl.addPane(scope);
        }
      };
    })
  ;
}(angular));