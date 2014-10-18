
var app = angular.module("app", [
  "ngRoute",
  "firebase"
]);

app.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider){
    $routeProvider.
      when('/candidate-list',{
      templateUrl: 'partials/candidate-list.html'
    }).
      otherwise({
      redirectTo:'/',
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    });

    $locationProvider.html5Mode(false)
                     .hashPrefix('!');

  }
]);

app.controller('IndexCtrl', ['$scope', function ($scope){
  
   $scope.test = "abcde";
}]);

