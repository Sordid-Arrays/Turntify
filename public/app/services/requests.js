/** this module will: 
* 1) create a module ("services") for services shared between apps 
* 2) handle RESTful interaction between the client and the server. Other services that store 
* information or functions required across the app can be added to the turntify.services namespace in another file.
* any logic/data filters longer than a couple lines should be required in another factory file
*/
angular.module('turntify.services', [])
.factory('RequestService', function($http, $state, $rootScope, $cookies, UserService /*logic files injected here*/) {
  //posts, gets, puts, etc.

  var getListOfPlaylists = function(){
    var userCookies = UserService.getUserCookies();
    $http({
      method: 'GET',
      url: 'user/playlists',
      headers: {
        Accept: 'application/json',
        userId: userCookies.userId,
        userOAuth: userCookies.userOAuth
      }
    }).then(function(res){
      console.log(res);
      return res;
    },function(error) {
      throw Error(error);
    });
  };

  var getQueue = function(playlistId){
    var userCookies = UserService.getUserCookies();
    $http({
      method: 'GET',
      url: 'user/playlist/' + playlistId,
      headers: {
        Accept: 'application/json',
        userId: userCookies.userId,
        userOAuth: userCookies.userOAuth
      }
    }).then(function(res){
      console.log(res);
      return res;
    },function(error) {
      throw Error(error);
    });
  };



  return {
    //return get/post functions. shouldn't contain persistent data: that should be sent elsewhere
    getListOfPlaylists: getListOfPlaylists
  };
});
