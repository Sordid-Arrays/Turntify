/** 
* this module intantiates the "player" module, and holds the controller for the player and queue.
* these views will persist across many states of the app, so those states will be subviews of the player
*/

angular.module('turntify.player', [])
.controller('ProfileController', function (PlayerService) {
  //This will handle the song/queue display logic. Not sure where we will put the numerous hacks
  // needed to manhandle the spotify widgets, possibly a custom directive
});
