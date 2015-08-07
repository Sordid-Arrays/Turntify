/** 
* instantiates a module for "main" logic, which will hold the turntometer and playlist selector
* TODO: consider renaming from "main"
* TODO: consider naming as a sub-sub-module (turntify.player.main). Is this a thing?
*/
angular.module('turntify.playlistControl', [])
.controller('PlaylistControlController', function (MainService) {
  // this should contain display logic for the turntometer, and the
  //ng-repeatable object for the playlist selector
});
