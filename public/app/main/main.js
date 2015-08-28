/**
*This will hold whatever functionality is needed in the navbar/index view. Might not be much for now,
*since tabs can manage state, but will contain logout function.
*/

angular.module('turntify.main', [])
.controller('MainController', function (UserService)/*probably requires 'UserService' from services*/ {
  this.logout = function(){
    console.log("logging out!");
    UserService.logoutUser();
  };
});
