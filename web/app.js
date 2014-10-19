
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
  
   $scope.isFocused = function(name){
      return $scope.focusedCandidate === name;
   };
   $scope.setFocused = function(name){
      console.log(name);
      $scope.focusedCandidate = name;
   };
   $scope.candidateChoose = function(n){
      console.log(n);
      $scope.focusedCandidateItem = n;
   }
   $scope.toggleSmallPary = function(){
      $scope.showSmallPartyOnly = !$scope.showSmallPartyOnly;
   };
   $scope.smallPartyFilter = function(n){
      if($scope.showSmallPartyOnly){
         if(n.partyEng !== 'KMT' && n.partyEng !== 'DPP'){
            return n;
         }
      }else{
         return n;
      }
   };
   $scope.togglePresent = function(){
      $scope.showPresent = !$scope.showPresent;
   };
   $scope.toggleSettings = function(){
      $scope.showSettings = !$scope.showSettings;
   };
   $scope.togglePartyName = function(){
      $scope.showPartyName = !$scope.showPartyName;
   };
   
   
}]);

app.controller('DistrictCtrl', ['$scope',function($scope){

  $scope.district = 'all';
  
  $scope.districts = [{"district_no":1,"district_area":'士林北投',"district_candidates":21,"district_seats":13},
                     {"district_no":2,"district_area":'內湖南港',"district_candidates":14,"district_seats":9},
                     {"district_no":3,"district_area":'松山信義',"district_candidates":17,"district_seats":10},
                     {"district_no":4,"district_area":'中山大同',"district_candidates":14,"district_seats":8},
                     {"district_no":5,"district_area":'中正萬華',"district_candidates":15,"district_seats":8},
                     {"district_no":6,"district_area":'大安文山',"district_candidates":22,"district_seats":13},
                     {"district_no":7,"district_area":'平地原住民',"district_candidates":2,"district_seats":1},
                     {"district_no":8,"district_area":'山地原住民',"district_candidates":3,"district_seats":1}];

  $scope.selectDistrict = function(district){
    $scope.district = district;

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
  $scope.isSelected = function(value){
    if(($scope.district === 'all')||( $scope.district === 'search')){
        return $scope.district === value;
    }else{
        return $scope.district.district_no === value;
    }

  };
  $scope.districtFilter = function(item){
    
    if(($scope.district === 'all')||( $scope.district === 'search')){
        return item;
    }else{
        if(item.district === $scope.district.district_no)
           return item;
    }
   
  };

}]);

