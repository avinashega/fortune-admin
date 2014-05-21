'use strict';
(function(angular){
var directives = angular.module('fortuneAdmin.Directives', [
  'fortuneAdmin.umlDiagram'
]);

directives.directive('myNavbar', [ '$http', '$rootScope', 'fortuneAdmin', function($http, $rootScope, fortuneAdmin) {
  return {
    restrict: 'E',

    templateUrl: '/templates/views/mynavbar.html',

    replace: true,

    transclude: true,

    scope: {},

    link: function (scope, element, attrs) {
      scope.r = $rootScope.fortuneAdminRoute;
      scope.resources = [];
      var CONFIG = fortuneAdmin.getConfig();
      $http.get(CONFIG.baseEndpoint + '/resources').success(function(data){
        scope.resources = data.resources;
      });
    }

  }
}]);

directives.controller('faEditableCtrl', ['$scope', '$http', 'fortuneAdmin',
  function($scope, $http, fortuneAdmin){
    var CONFIG = fortuneAdmin.getConfig();
  $scope.apply = function(value){
    //Send PATCH to the server
    var cmd = [];
    cmd.push({
      op: 'replace',
      path: '/' + $scope.resourceName + '/0/links/' + $scope.path,
      value: value
    });

    $http({
      method: 'PATCH',
      url: CONFIG.getApiNamespace() + '/' + $scope.resourceName + '/' + $scope.resourceId,
      data: cmd
    }).success(function(data, status){
        console.log(data, status);
    });
  };
}]);

directives.directive('faEditable', [function(){
  return {
    restrict: 'E',
    replace: true,
    scope: {
      value: '=ngModel',
      path: '=',
      schemaType: '=',
      resourceName: '@',
      resourceId: '@'
    },
    templateUrl: '/templates/directives/faEditable.html',
    controller: 'faEditableCtrl'
  }
}]);


directives.directive('faRef', ['$http', '$compile', 'Inflect', 'fortuneAdmin',
  function($http, $compile, Inflect, fortuneAdmin){
  var CONFIG = fortuneAdmin.getConfig();
  return {
    restrict: 'E',
    replace: false,
    scope: {
      value: '=ngModel',
      ref: '=',
      resourceName: '@',
      resourceId: '@'
    },
    controller: 'faEditableCtrl',
    link: function(scope, elt){
      var refTo = scope.path = scope.ref.ref;
      var resources, currentResource;

      $http.get(CONFIG.baseEndpoint + '/resources').success(function(data){
        resources = data.resources;
        angular.forEach(resources, function(resource){
          if (resource.name === refTo){
            currentResource = resource;
          }
        });
        $http.get(CONFIG.getApiNamespace() + '/' + Inflect.pluralize(refTo))
          .success(function(data){
            var PK = currentResource.modelOptions ? currentResource.modelOptions.pk || 'id' : 'id';
            scope.list = data[Inflect.pluralize(refTo)];
            var tpl = ['<a href="#" editable-select="value" ',
              'e-ng-options="item.', PK || 'id',
              ' as item.', PK || 'id',
              ' for item in list" ',
              'onaftersave="apply(value)">',
              '{{ value || "Not set." }}',
              '</a>'
            ];
            var select = $compile(tpl.join(''))(scope);
            elt.append(select);
          });
      });
    }
  }
}]);

});