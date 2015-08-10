/** this module will: 
* 1) create a module ("services") for services shared between apps 
* 2) handle RESTful interaction between the client and the server. Other services that store 
* information or functions required across the app can be added to the turntify.services namespace in another file.
* any logic/data filters longer than a couple lines should be required in another factory file
*/
angular.module('turntify.services', [])
.factory('RequestService', function($http, $state, $rootScope, $q, UserService /*logic files injected here*/) {
  //posts, gets, puts, etc.
  // CORS PROBLEMS. MIGHT WORK LATER.
  // var loginUser = function(){
  //   console.log('logging in user...');
  //   $http({
  //     method: 'GET',
  //     url: 'login',
  //     headers: {
  //       Accept: 'application/json',
  //       "Access-Control-Allow-Origin": '*'
  //     }
  //   }).then(function(res){
  //     console.log("logged in!", res);
  //     return res;
  //   },function(error) {
  //     // throw Error(error);
  //     console.log(error);
  //   });
  // };
  
  var getListOfPlaylists = function(){
    console.log('calling get list');
    return $q(function(resolve, reject){
      $http({
        method: 'GET',
        url: 'user/playlists',
      }).then(function(res){
        console.log(res);
        resolve( res.data);
      },function(error) {
        console.log(error);
        reject(error);
      });

    });
  };

  var getQueue = function(ownerId, playlistId, turntness){
    return $q(function(resolve, reject){
      $http({
        method: 'GET',
        url: 'user/playlist/'+ ownerId +'/' + playlistId + '/' + turntness,
      }).then(function(res){
        console.log(res);
        resolve(res.data);
      },function(error) {
        console.log(error);
        reject(error);
      });
    });
  };



  return {
    //return get/post functions. shouldn't contain persistent data: that should be sent elsewhere
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue,
    // loginUser: loginUser
  };
});
