/** 
* instantiates a module for "main" logic, which will hold the turntometer and playlist selector
* TODO: consider renaming from "main"
* TODO: consider naming as a sub-sub-module (turntify.player.main). Is this a thing?
*/
angular.module('turntify.modifyPlaylist', [])
.controller('ModifyPlaylistController', function (ModifyPlaylistService) {
  // this should contain display logic for the turntometer, and the
  //ng-repeatable object for the playlist selector
  this.updateQueue = function(){
    var playlistId = this.selectedPlaylist.playlistId;
    var turntness = this.selectedTurntness;

    console.log(playlistId);
    ModifyPlaylistService.getQueue(playlistId);
  };

  // this.playlists = ModifyPlaylistService.getListOfPlaylists(); 

  // Dummy List of Playlists
  this.playlists = [{"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"},{"name":"Minimal // Deep House","playlistId":"2POsysj8dTuOCAMPYVsgeO"},{"name":"Sample","playlistId":"5zA1FfniCXXT2e7gLu8igS"},{"name":"Soul Classics","playlistId":"3q9TPV3tR3sW30ChwNUInG"},{"name":"soul/funk/jazz/afro/latin/60's psychedelia","playlistId":"6iwuMjD6RPaFG0vBENgYaK"},{"name":"Electro Swing","playlistId":"0ZdkjCY51DTu7wjrcReIIl"},{"name":"Neo Disco","playlistId":"0jXuFjs93Tavfsy19s1lk6"},{"name":"Soulfunkisticated","playlistId":"7vKhVBM3kMcuPjtwrHZB8Q"},{"name":"Neo-Disco","playlistId":"3qOoxtnh8AHJV7jQODk9PJ"},{"name":"Gammal Hederlig Reggae","playlistId":"1mxFzXQr7S892OeO4ttz47"},{"name":"All Reggae until 2015 from Roots to Dancehall","playlistId":"3dhsw3G11F9nVbPU72lQiA"},{"name":"Liked from Radio","playlistId":"4MpZz1jhAoV6BSHr1m7i3M"},{"name":"October 1st Show","playlistId":"67nnPuurEMPR6AX1b5MoiB"},{"name":"Starred in Moodsnap","playlistId":"6pjbGz7ryFBRthokhUmQzw"}];


  this.turntLevels = [0,1,2,3,4,5,6,7,8,9,10,11];
  

});
