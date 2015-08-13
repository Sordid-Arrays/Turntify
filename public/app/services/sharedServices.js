/** 
* This will contain information needed throughout the app, and methods to update and relate
* this information
*/
angular.module('turntify.services')
.factory('UserService', function($http, $state, $rootScope, $cookies) /*might require "RequestService" at some point*/{
  //"persistent data" could include:
  //    -user data (to start: could also be in a "session")
  //    -full song information for queue(i.e spotify track ids, and any other un-displayed information)

  //Functions could access different parts of the persistent data needed by different
  //parts of the app: the player view might need app id, but the queue might just list track
  // names, etc.
  
  /** 
  * This simply removes the cookies and redirects the user to login. TODO: add "hide" in view so that
  * it doesn't show in the 'login' view
  */
  var logoutUser = function(){
    $cookies.remove('connect.sid');
    $state.go('login');
  };

  var getUserCookies = function(){
    var sessionId = $cookies.get('connect.sid');
    console.log('cookies are:',JSON.stringify($cookies.getAll()));
    if(sessionId === undefined){
      console.log('No session ID found');
    }

    return {
      sessionId: sessionId
    };
  };
  


  return {
    //return functions to access persistent data. 
    //Probably don't want to return persistent data itself, just functions
    //also returns any view-agnostic and user-session-y functions
    getUserCookies: getUserCookies,
    logoutUser: logoutUser
  };
});
