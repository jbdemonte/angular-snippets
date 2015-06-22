angular.module('SnippetThemeBootstrap', ['Snippets'])

  .config(['snippetsProvider', function (snippetsProvider) {
    snippetsProvider.configure({
      tabs: {
        template: '<div class="tabbable">' +
                    '<ul class="nav nav-tabs">' +
                      '<li ng-repeat="pane in panes" class="{{pane.snippet.cls}}" ng-class="{active:pane.selected}">' +
                        '<a href="" ng-click="!pane.snippet.disabled && select(pane)">{{pane.snippet.name}}</a>' +
                      '</li>' +
                    '</ul>' +
                    '<div class="tab-content" ng-transclude></div>' +
                  '</div>'
      },
      pane: {
        template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>'
      }
    });

  }])
;