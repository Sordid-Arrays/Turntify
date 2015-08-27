angular.module('turntify.player')
  .controller('CustomPlaylistController', function(PlayerService, $scope, turntToFilter){
  /**
  * The user's custom playlist is managed here, along with any functions to add or remove songs from WITHIN this view.
  * The listeners ("$scope.$on") listen for changes outside the state and simply tell the playlist to match the playlist in
  * the view to the playlist in PlayerService.
  */
  var vm = this;
  vm.customPlaylist = PlayerService.customPlaylist;
  //vm.newPlaylist = '';

  /**
  * A button within the view allows the user to remove songs from the custom playlist.
  * We pass a "song index" to find and splice out the song easily without having to iterate through the custom
  * playlist array.
  */
  vm.removeSong = function(songIndex){
    PlayerService.removeFromCustomPlaylist(songIndex);
    vm.customPlaylist = PlayerService.customPlaylist;
  }

  /**
  * Perist the playlist to spotify, grabbing the custom name in the input field
  */
  vm.savePlaylist = function(){
    //PlayerService.savePlaylist(vm.name);
    PlayerService.savePlaylist(vm.newPlaylist);
    vm.newPlaylist = '';
  }

  /**
  * Generates a widget for a preview
  */

  vm.generateWidget = function(){
    PlayerService.generateWidget(vm.name);
  }

  /**
  * When sibling views make changes to custom playlist, they fire an event
  * that lets the customPLaylist view know to update it's view.
  * More performant than a "$scope.$watch" operation.
  */
  $scope.$on('playlistCollectionUpdated', function(event){
    console.log("playlistUpdated received!");
    vm.customPlaylist = PlayerService.customPlaylist.slice(0,9);
  });
  $scope.$on('loadAllMatches', function(event){
    console.log("loadingAllMatches!");
    vm.customPlaylist = PlayerService.customPlaylist;
  });
});
