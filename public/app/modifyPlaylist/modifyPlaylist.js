/** 
* instantiates a module for "main" logic, which will hold the turntometer and playlist selector
* TODO: consider renaming from "main"
* TODO: consider naming as a sub-sub-module (turntify.player.main). Is this a thing?
*/
angular.module('turntify.modifyPlaylist', [])
.controller('ModifyPlaylistController', function (ModifyPlaylistService) {
  // this should contain display logic for the turntometer, and the
  //ng-repeatable object for the playlist selector

  this.playlists = ModifyPlaylistService.getListOfPlaylists(); 

  this.turntLevels = [0,1,2,3,4,5,6,7,8,9,10,11];
  

});
