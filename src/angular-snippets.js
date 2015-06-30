/*!
 *  angular-snippets
 *  Version   : 2.0.0
 *  Date      : 2015-06-30
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html
 */
(function (angular) {
  angular.module('Snippets', [])

  /**
   * Configure snippets
   */
    .provider('snippets', function () {
      var self = {
        content: {
          before: [],
          after: []
        },
        options: {
          manifest: 'manifest.json',
          snippets: {
            template: ''
          },
          highlight: function (element) {
            angular.forEach(element.find("pre"), function (pre) {
              Prism.highlightElement(pre);
            });
          },
          type: function (extension) {
            var extensions = {
              'js': 'javascript',
              'html': 'markup',
              'svg': 'markup',
              'xml': 'markup',
              'py': 'python',
              'rb': 'ruby',
              'ps1': 'powershell',
              'psm1': 'powershell'
            };
            return extensions[extension] || extension;
          }
        }
      };

      this.configure = function (options) {
        angular.extend(self.options, options);
      };

      this.content = {
        before: function (template) {
          self.content.before.push(template);
        },
        after: function (template) {
          self.content.after.push(template);
        }
      };

      this.$get = function () {
        return self;
      };
    })

  /**
   * Allow to disable content insertion before transclusion
   */
    .directive('snippetsContentBefore', ['$compile', 'snippets', function ($compile, snippets) {
      return {
        restrict: 'E',
        require: '^snippets',
        link: function (scope, element, attrs, snippetsController) {
          if (snippets.content.before.length && !snippetsController.contentBeforeDisabled()) {
            element.html(snippets.content.before.join(""));
            $compile(element.contents())(scope);
          }
        }
      };
    }])

  /**
   * Allow to disable content insertion after transclusion
   */
    .directive('snippetsContentAfter', ['$compile', 'snippets', function ($compile, snippets) {
      return {
        restrict: 'E',
        link: function (scope, element, attrs) {
          if (snippets.content.after.length) {
            element.html(snippets.content.after.join(""));
            $compile(element.contents())(scope);
          }
        }
      };
    }])

  /**
   * Main directive
   */
    .directive('snippets', ['$q', '$http', '$templateRequest', '$timeout', '$parse', 'snippets', function ($q, $http, $templateRequest, $timeout, $parse, snippets) {
      return angular.extend({
        restrict: 'E',
        scope: true,
        transclude: true,
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
          var files = $parse($attrs.files)($scope),
            done = 0,
            items = [],
            path = $attrs.path ? $attrs.path.replace(/\/+$/, '') + '/' : '';

          this.contentBeforeDisabled = function () {
            return "contentBeforeDisabled" in $attrs;
          };

          this.contentAfterDisabled = function () {
            return "contentAfterDisabled" in $attrs;
          };

          $scope.current = {}; // to be used in theme
          $scope.done = false; // file is done (stay false if no file is listed (no matter of 404), and manifest is not available

          $q(function (resolve, reject) {
            if (files && files.length) { // file list from attributes
              resolve(files);
            } else {
              $http.get(path + snippets.options.manifest)
                .then(
                  function(response) {
                    if (response.data && response.data.files && response.data.files.length) {
                      resolve(response.data.files);
                    }
                  },
                reject);
            }
          })
          .then(
            function (files) {
              angular.forEach(files, function (name) {
                var item = {
                  name: name,
                  type: snippets.options.type(name.replace(/^.*\./, '').toLowerCase())
                };
                items.push(item);
                $templateRequest(path + name, true)
                  .then(
                    function (content) {
                      item.content = content;
                    },
                    function () {
                      item.error = true;
                    }
                  )
                  .finally(function () {
                    done++;
                    if (done === files.length) {  // when all files have been requested (no matter of 404), populate scope
                      $scope.items = items;
                      $scope.path = path;
                      $scope.done = true;
                      // then call for highlight function without $digest (3rd param to false)
                      $timeout(function () {
                        snippets.options.highlight($element);
                      }, 0, false);
                    }
                  });
              });
            }
          );
        }]
      }, snippets.options.snippets);
    }])

  ;
}(angular));