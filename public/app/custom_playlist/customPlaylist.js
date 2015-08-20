angular.module('turntify.player')
  .controller('CustomPlaylistController', function(PlayerService, $scope){
  //This handles the logic specific to our "custom playlist", such as:
  // 1) save to spotify: function called when user tries to save the playlist to spotify
  // 2) anything relating to the playlist name
  // 3) remove songs, clear playlist, etc.
  var vm = this;
  vm.customPlaylist = PlayerService.customPlaylist;

  vm.removeSong = function(songIndex){
    PlayerService.removeFromCustomPlaylist(songIndex);
    vm.customPlaylist = PlayerService.customPlaylist;
  }

  //listener for an event saying the playlist needs to update
  $scope.$on('customPlaylistChanged', function(){
    console.log('update playlist from controller ', vm.customPlaylist);
    vm.customPlaylist = PlayerService.customPlaylist;
  });
});
