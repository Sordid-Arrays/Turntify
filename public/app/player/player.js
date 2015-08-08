/** 
* this module intantiates the "player" module, and holds the controller for the player and queue.
* these views will persist across many states of the app, so those states will be subviews of the player
*/

angular.module('turntify.player', [])
.controller('PlayerController', function (PlayerService, UserService) {
  //This might be a problem from a "separation of concerns" perspective, since it has to do with
  //logout funcionality
  this.logout = function() {
    console.log("logout called!");
  }
  //This will handle the song/queue display logic. Not sure where we will put the numerous hacks
  // needed to manhandle the spotify widgets, possibly a custom directive
});
