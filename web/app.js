
var app = angular.module("app", [
  "ngRoute",
  "firebase"
]);

//http://stackoverflow.com/questions/16310298/if-a-ngsrc-path-resolves-to-a-404-is-there-a-way-to-fallback-to-a-default
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);  
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
});

app.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider){
    $routeProvider.
      when('/candidate-list',{
      templateUrl: 'partials/index.html'
    }).
      otherwise({
      redirectTo:'/',
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    });

    $locationProvider.html5Mode(true);

  }
]);

app.factory('DataService', function ($firebase){
  
  var DataService = {};
  var ref = new Firebase("https://councilor.firebaseio.com/");
  
  DataService.candidates = function candidates(){

    var sync = $firebase(ref.child("candidates/"));
    //return sync.$asObject();
    return sync.$asArray();
    
  };
  return DataService;

  

})

app.controller('IndexCtrl', ['$scope', 'DataService', function ($scope, DataService){
  
   $scope.candidates = DataService.candidates();
   $scope.parsename = function(n){
      return decodeURI(encodeURI(n));
   }
   
   
}]);

app.controller('DistrictCtrl', ['$scope',function($scope){

  $scope.district = 'all';
  $scope.district = 3; //user.district
  $scope.districts = [{"district_no":1,"district_area":'士林北投'},
                     {"district_no":2,"district_area":'內湖南港'},
                     {"district_no":3,"district_area":'松山信義'},
                     {"district_no":4,"district_area":'中山大同'},
                     {"district_no":5,"district_area":'中正萬華'},
                     {"district_no":6,"district_area":'大安文山'},
                     {"district_no":7,"district_area":'平地原住民'},
                     {"district_no":8,"district_area":'山地原住民'}];

  $scope.selectDistrict = function(value){
    $scope.district = value;

  };
  $scope.getDistrictName = function(no){
    //return "text";
    var result = "unset";
    $.each($scope.districts, function(index,value){
        if(value.district_no == no){
           result = value.district_area;
        }

    });
    if(no=='all'||no=='search'){
       result = "所有選區";
    }
    return result;

  };
  $scope.isSelected = function(num){
    return $scope.district == num;
  };
  $scope.districtFilter = function(item){
    
    if(($scope.district === 'all')||( $scope.district === 'search')){
        return item;
    }else{
        if(item.district === $scope.district)
           return item;
    }
   
  };

}]);

