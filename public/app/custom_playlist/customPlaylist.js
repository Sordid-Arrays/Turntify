angular.module('turntify.player')
  .controller('CustomPlaylistController', function(PlayerService, $scope, $mdDialog, turntToFilter){
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
  };

  /**
  * Perist the playlist to spotify, grabbing the custom name in the input field
  */
  vm.savePlaylist = function(){
    //PlayerService.savePlaylist(vm.name);
    PlayerService.savePlaylist(vm.newPlaylist);
    vm.newPlaylist = '';
  };

  /**
  * Generates a widget for a preview
  */

  vm.generateWidget = function(){
    PlayerService.generateWidget(vm.name);
  };

  vm.closeDialog = function() {
      // Easily hides most recent dialog shown...
      // no specific instance reference is needed.
      $mdDialog.hide();
  };

  vm.confirmPlaylistOverwrite = function(){
    $mdDialog.show(
          {
            // targetEvent: ev,
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
                      '<md-dialog>' +
                      '<md-dialog-content>' +
                      '  <h2 class="md-title">You already have a playlist with that name. Would you like to overwrite it?</h2>' +
                      '  <div class="md-actions">' +
                      '    <md-button ng-click="customPlaylist.savePlaylistDialog()" class="dialog-close">' +
                      '      Choose Another Name' +
                      '    </md-button>' +
                      '    <md-button ng-click="customPlaylist.savePlaylist(); customPlaylist.closeDialog()" class="">' +
                      '      Overwrite Existing Playlist' +
                      '    </md-button>' +
                      '  </div>' +
                      '</md-dialog-content>' +
                      '</md-dialog>',
          }
        );
  };

  vm.savePlaylistConfirm = function(){
      var playlistExists = false;
      // check if there is already a playlist with that name
      angular.forEach(PlayerService.playlists, function(playlist){
        if( angular.lowercase(playlist.name) === angular.lowercase(vm.newPlaylist) ){
          playlistExists = true;
        }
      });
      if(playlistExists){
        // if there is, display another dialog box asking if they want to overwrite
          vm.confirmPlaylistOverwrite();
          // if they want to overwrite, save the playlist
          // otherwise bring them back to the name-the-playlist dialog
      }else{
        // if not, save the playlist
        vm.savePlaylist();
      }
  };

  vm.savePlaylistDialog = function(ev) {
    console.log('called show alert');
    // Appending dialog to document.body to cover sidenav in docs app
    // Modal dialogs should fully cover application
    // to prevent interaction outside of dialog
    $mdDialog.show(
      {
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: $scope,
        preserveScope: true,
        template:
                    '<md-dialog>' +
                    '<md-dialog-content>' +
                    '  <h2 class="md-title">Name your new playlist</h2>' +
                    '  <md-input-container class="md-accent">' +
                    '    <label>playlist name</label>' +
                    '    <input type="text" name="playlistName" ng-model="customPlaylist.newPlaylist">' +
                    '  </md-input-container>' +
                    '  <div class="md-actions">' +
                    '    <md-button ng-click="customPlaylist.savePlaylistConfirm(); customPlaylist.closeDialog()" class="">' +
                    '      Save Playlist' +
                    '    </md-button>' +
                    '  </div>' +
                    '</md-dialog-content>' +
                    '</md-dialog>',
      }
    );
  };

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
