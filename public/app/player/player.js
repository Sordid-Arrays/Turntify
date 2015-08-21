/** 
* this module intantiates the "player" module, and holds the controller for the player and queue.
* these views will persist across many states of the app, so those states will be subviews of the player
*/


/** 
* TODO: refactor into multiple controllers
*/
angular.module('turntify.player', ['ngMaterial', 'ngDraggable'])
.controller('PlayerController', function (PlayerService, turntToFilter) {
  
  /**
  * 'vm' is short for 'view-model': it is used to designate context within the controller.
  */
  var vm = this;

  /**
  * loading up different playlists is probably our most expensive operation.
  * Because of this, a soothing spinner lets the user know that our app didn't
  * forget about them as it looks up their songs.
  */
  vm.playlistLoading = false;

  /**
  * The name of the current 
  */
  vm.name = "";

  /**
  * Update the list of playlists. This is only called on initialization.
  */
  vm.init = function(){
    PlayerService.getListOfPlaylists().then(function(){    
      vm.playlists = PlayerService.playlists;
      return;
    }); 

  };
  
  vm.sideNavIsOpen = true;
  vm.toggleSideNav = function(){
    console.log('called toggle side nav');
    vm.sideNavIsOpen = vm.sideNavIsOpen ? false : true;
  };

  /**
  * Update the view queue while the user is sliding the slider/turning the knob/radial-ing the radial.
  * This is to allow for a flickering visual of the potential queue before the queue is locked in.
  * This DOES NOT write anything to the service/business logic end, and and shouldn't effect the widget.
  */
  this.updateViewQueue = function(turntness){
    vm.viewQueue = turntToFilter(PlayerService.playlist, turntness);
  };


  /**
  * Persists the view queue to PlayerService.
  */
  this.persistViewQueue = function(viewQueue, turntness, selectedPlaylist){
    var playlist = JSON.parse(selectedPlaylist);
    PlayerService.persistViewQueue(viewQueue, turntness, playlist);
    console.log("persisting View Queue!");
  };

  /**
  * Called from view, this takes a stringified version of a selected playlist's description
  * and calls the  playerService to update playlists
  */
  vm.getPlaylist = function(playlistString){
    vm.playlistLoading = true;
    var playlist = JSON.parse(playlistString);
    vm.name = playlist.name;
    PlayerService.getPlaylist(playlist).then(function(){
      vm.playlistLoading = false;
    });
  };
  // Dummy List of Playlists
  // this.playlists = [{"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"},{"name":"Minimal // Deep House","playlistId":"2POsysj8dTuOCAMPYVsgeO"},{"name":"Sample","playlistId":"5zA1FfniCXXT2e7gLu8igS"},{"name":"Soul Classics","playlistId":"3q9TPV3tR3sW30ChwNUInG"},{"name":"soul/funk/jazz/afro/latin/60's psychedelia","playlistId":"6iwuMjD6RPaFG0vBENgYaK"},{"name":"Electro Swing","playlistId":"0ZdkjCY51DTu7wjrcReIIl"},{"name":"Neo Disco","playlistId":"0jXuFjs93Tavfsy19s1lk6"},{"name":"Soulfunkisticated","playlistId":"7vKhVBM3kMcuPjtwrHZB8Q"},{"name":"Neo-Disco","playlistId":"3qOoxtnh8AHJV7jQODk9PJ"},{"name":"Gammal Hederlig Reggae","playlistId":"1mxFzXQr7S892OeO4ttz47"},{"name":"All Reggae until 2015 from Roots to Dancehall","playlistId":"3dhsw3G11F9nVbPU72lQiA"},{"name":"Liked from Radio","playlistId":"4MpZz1jhAoV6BSHr1m7i3M"},{"name":"October 1st Show","playlistId":"67nnPuurEMPR6AX1b5MoiB"},{"name":"Starred in Moodsnap","playlistId":"6pjbGz7ryFBRthokhUmQzw"}];

  vm.init();
});
