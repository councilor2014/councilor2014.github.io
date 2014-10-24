
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
      when('/mylist',{
      templateUrl: 'partials/mylist.html',
      controller: 'MyListCtrl'
    }).
      when('/mylist',{
      templateUrl: 'partials/alllist.html'
    }).
      when('/mylist/:focusArea/:key',{
      templateUrl: 'partials/mylist.html',
      controller: 'MyListCtrl'
    }).
      when('/about',{
      templateUrl: 'partials/about.html'
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
  
  DataService.getPreferences = function (){
    var sync = $firebase(ref.child("preferences/"));
    return sync.$asObject();
    };

  DataService.candidates = function (){
    var sync = $firebase(ref.child("candidates/"));
    //return sync.$asObject();
    return sync.$asArray();
    
  };

  DataService.getCandidatesObj = function (){
    var sync = $firebase(ref.child("candidates/"));
    return sync.$asObject();
  
  };
  DataService.getDistricts = function (){
    var sync = $firebase(ref.child("districts/"));
    return sync.$asArray();
    
  };
  DataService.getDistrictsObj = function (){
    var sync = $firebase(ref.child("districts/"));
    return sync.$asObject();
    
  };

  return DataService;
})
app.controller('NavCtrl', ['$scope', '$location', function ($scope, $location){
   $scope.go = function(path){
      $location.path(path);
   };
}]);
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
app.controller('DistrictCtrl', ['$scope', 'DataService',function ($scope, DataService){

  $scope.district = 'all';
  $scope.districts = DataService.getDistricts();
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

app.controller('MyListCtrl', ['$scope', 'DataService', '$routeParams', function ($scope, DataService, $routeParams){
    
    $scope.candidatesObj = DataService.getCandidatesObj();
    $scope.preference = DataService.getPreferences();

    $scope.candidates = [];
    $scope.candidatesObj.$loaded().then(function(){
        
        $.getJSON("https://spreadsheets.google.com/feeds/list/"+$routeParams.key+"/od6/public/values?alt=json", function(data) {
            console.log(data.feed.entry[0]);
            $.map(data.feed.entry,function(value, index){

               var candidate_name = value.gsx$name.$t;
               var candidate_status = value.gsx$state.$t;
               console.log(candidate_name);

               if($scope.candidatesObj[candidate_name]){
                  if(candidate_status){
                     $scope.candidatesObj[candidate_name].status = candidate_status;
                  }

                  $scope.candidatesObj[candidate_name].reason = [];
                  var current_reason = {};
                  $.map(value, function(v, i){
                      if(i.indexOf('source')!==-1){
                         current_reason.src = v.$t;
                      }
                      if(i.indexOf('reason')!==-1){
                         current_reason.des = v.$t;
                      }
                      if(current_reason.src && current_reason.des){
                         $scope.candidatesObj[candidate_name].reason.push(current_reason);
                         current_reason = {};
                      }
                  });
                  console.log($scope.candidatesObj[candidate_name]);

               }
               
               
            });
            //console.log($scope.candidatesObj);
            $scope.candidates =  $.map($scope.candidatesObj, function(value, index) {
                if(typeof(value) === 'object' && value && value.name){
                   return [value];
                }    
            });

            console.log($scope.candidates);
            $scope.setListFocused('all');

        });//end of getJson
    
    });
    
    /*
    $scope.candidatesObj.$loaded().then(function(){

        $scope.preference.$loaded().then(function(){
            var p = {};
            $.map($scope.preference, function(value, index) {
                if(typeof(value) === 'object' && value && value.status){
                   p[index] = value;
                }    
            });
            $.map(p, function(value, index) {
                $.map(value, function(v, i) {
                    $scope.candidatesObj[index][i] = v; 
                });
            });

            //console.log($scope.candidatesObj);
            $scope.candidates =  $.map($scope.candidatesObj, function(value, index) {
                if(typeof(value) === 'object' && value && value.name){
                   //console.log("index:"+index);
                   //console.log(value);
                   //console.log($scope.preference);
                   //console.log("==============");
                   return [value];
                }    
            });

        });
        
    });
    */

    

    $scope.listFilter = function(n){
       if($scope.focusedList === 'all'){
          return n;

       }else{
          if(n.status === $scope.focusedList)
              return n;
       }
    };
   
   
    $scope.isListFocused = function(value){
        return $scope.focusedList === value;
    };
    $scope.setListFocused = function(value){
        $scope.focusedList = value;
    };


    var list = DataService.getDistricts();
    list.$loaded().then(function() {
        $scope.districts = list;
        if($routeParams.focusArea && $routeParams.focusArea > 0){
           if(list[$routeParams.focusArea-1])
              $scope.selectDistrict(list[$routeParams.focusArea-1]);
        }
    });   

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
          if($scope.district){
             return $scope.district.district_no === value;

          }else{
             return false;
          }   
      }
  
    };
    $scope.districtFilter = function(item){
      
      if(($scope.district === 'all')||( $scope.district === 'search')){
          return item;
      }else{
          if($scope.district){
            if(item.district === $scope.district.district_no)
              return item;
          } 
      }
    };
  
  
    $(document).ready(function(){
        var  $menuItem = $('.menu a.item, .menu .link.item');
      
        handler = {
          activate: function() {
            
              $(this)
                .addClass('active')
                .closest('.ui.menu')
                .find('.item')
                  .not($(this))
                  .removeClass('active')
            ;
        }
      };
      $menuItem.on('click', handler.activate);

    });

    $scope.districts = DataService.getDistrictsObj();
    $scope.getCouncilorDistrict = function(name){
        
        if($scope.candidates[name]){
          var district_no = $scope.candidates[name].district;
          if($scope.districts[district_no]){
             return $scope.districts[district_no].district_area;

          }
        }
    };

    $scope.toggleStatus = function(){
        $scope.hideStatus = !$scope.hideStatus;
    };

  

}]);


