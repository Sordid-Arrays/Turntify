//NOTE: This currently isn't required by the app
angular.module('turntify.login', [])
.controller('LoginController', function (UserService) {
  this.logout = function(){
    console.log("logging out! lel");
    //UserService.logout();
  }
});
