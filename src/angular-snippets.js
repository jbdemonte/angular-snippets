(function (angular) {
  angular.module('Snippets', [])

  /**
   * Configure snippets by providing templates / templatesUrl
   */
    .provider('snippets', function () {
      var options = {
        cls: {
          missing: 'error'
        },
        tabs: {
          // template: ''
          // templateUrl: ''
        },
        pane: {
          // template: ''
          // templateUrl: ''
        }
      };

      this.configure = function (opts) {
        angular.extend(options, opts);
      };

      this.$get = function () {
        return options;
      };
    })

  /**
   * usable on ng-repeat, execute its expression after last ng-repeat item
   */
    .directive('repeatDone', ['$timeout', '$parse', function ($timeout, $parse) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          if (scope.$last) {
            $timeout(function () {
              $parse(attrs.repeatDone)(scope);
            });
          }
        }
      }
    }])

  /**
   * main directive to add header tabs
   * based on http://jsfiddle.net/Wijmo/ywUYQ/
   * prepend content with ng-repeat file panes
   */
    .directive('tabs', ['snippets', function (snippets) {
      return angular.extend({
        restrict: 'E',
        transclude: true,
        scope: true,
        controller: ['$scope', function ($scope) {
          var first = true,
            forced = false,
            panes = $scope.panes = [];

          $scope.select = function (pane) {
            angular.forEach(panes, function (pane) {
              pane.selected = false;
            });
            pane.selected = true;
          };

          this.addPane = function (pane) {
            if (pane.selected || first || (pane.index === 0 && !forced)) {
              first = pane.disabled; // wait for first available
              forced = pane.snippet.selected;
              $scope.select(pane); // select at least first item (required if none are unavailable)
            }
            if (angular.isDefined(pane.index)) {
              panes.splice(pane.index, 0, pane);
            } else {
              panes.push(pane);
            }
          };
        }]
      }, snippets.tabs);
    }])

  /**
   * tabs panes
   *
   * @attribute path {string} (if current, use '.')
   * @attribute files {array(string)} file list
   *
   * provide / extend to scope:
   * scope.snippet {object}
   *    .name {string} file name
   *    .type {string} prism syntax type (base on file extension)
   * scope.selected {boolean}
   * scope.index {integer} ng-repeat index (from files)
   * scope.select {function (pane)}
   */
    .directive('pane', ['snippets', function (snippets) {
      return angular.extend({
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: {
          snippet: '=',
          index: '='
        },
        link: function (scope, element, attrs, tabsCtrl) {
          tabsCtrl.addPane(scope);
        }
      }, snippets.pane);
    }])

    .directive('snippets', ['$templateRequest', '$parse', 'snippets', function ($templateRequest, $parse, snippets) {
      return {
        restrict: 'E',
        scope: true,
        transclude: true,
        template: '<tabs>' +
        '<div>' +
        '<pane snippet="item" index="$index" ng-repeat="item in items" repeat-done="prism()"><pre class="code language-{{item.type}}" ng-bind="item.content"></pre></pane>' +
        '<div>' +
        '<div ng-transclude></div>' +
        '</tabs>',
        link: function (scope, elem, attrs) {
          var files = $parse(attrs.files)(scope),
            done = 0,
            items = [],

          // from Prism.fileHighlight
            extensions = {
              'js': 'javascript',
              'html': 'markup',
              'svg': 'markup',
              'xml': 'markup',
              'py': 'python',
              'rb': 'ruby',
              'ps1': 'powershell',
              'psm1': 'powershell'
            };

          scope.prism = function () {
            angular.forEach(elem.find("pre"), function (pre) {
              Prism.highlightElement(pre);
            });
          };

          if (files && files.length) {
            angular.forEach(files, function (name) {
              var ext = name.replace(/^.*\./, '').toLowerCase(),
                item = {name: name, type: extensions[ext] || ext};
              items.push(item);
              $templateRequest((attrs.path ? attrs.path + '/' : '') + name, true)
                .then(
                function (content) {
                  item.content = content;
                },
                function () {
                  item.cls = (item.cls || '') + ' ' + snippets.cls.missing;
                  item.disabled = true;
                }
              )
                .finally(function () {
                  done++;
                  if (done === files.length) {
                    scope.items = items;
                    scope.path = attrs.path + '/';
                  }
                });
            });
          }
        }
      }
    }])

  ;
}(angular));