/**
* the playerService will hold any business logic relating to the player.
* Directives will be in a seperate directive folder
*/
angular.module('turntify.player')
.factory('PlayerService', function PlayerService ($rootScope, RequestService, turntToFilter) {
  var PlayerService = {};
  PlayerService.playlists = [];
  PlayerService.playlist = [];  
  PlayerService.matches = [];
  PlayerService.turntness = 1;
  PlayerService.customPlaylist = [];

  /**
  * getListOfPlaylists is called on initialization, sends a get request from the request factory,
  * and sets the playlists property equal to the result.
  */

  PlayerService.getListOfPlaylists = function(){
    var context = this;
    return RequestService.getListOfPlaylists().then(function(data){
      context.playlists = data;
      console.log("playlists: ", context.playlists);
      console.log("playlists type: ", typeof context.playlists[0]);
    });
  };

  //this function updates the "matches", and is run every time any of the filters
  PlayerService.updateMatches = function(turntness){
    $rootScope.$broadcast('matchesUpdated', turntness);
  };

  //TODO: refactor to pass matches through an event instead of keeping them in service
  PlayerService.addMatches = function(matches){
    this.customPlaylist = _.uniq(this.customPlaylist.concat(matches));
    console.log("current playlist: ", this.customPlaylist);
    $rootScope.$broadcast('customPlaylistChanged');
  };

  PlayerService.getPlaylist = function(playlist){
    var context = this;
    return RequestService.getPlaylist(playlist.ownerId, playlist.playlistId).then(function(data){
      context.playlist = data;
      console.log("playerservice playlist: ", context.playlist);
    });
  };

  PlayerService.removeFromCustomPlaylist = function(songIndex){
    this.customPlaylist.splice(songIndex, 1);
  }
  

  /**
  * TODO: refactor 'generateWidget' into a custom directive. Perhaps it gets called from here?
  */
  PlayerService.generateWidget = function(argsObj){
    //Args object is in the following format: 
   // {queue: context.queue,
  //                       selectedPlaylist: selectedPlaylist,
  //                       selectedTurntness: turntness}

    var el = angular.element(document.querySelector('.widgetWrapper'));
    el.empty();
    var trackIds = [];
    var queue= argsObj.queue;
    for(var i=0; i<queue.length; i++){
      trackIds.push(queue[i]['spotify_id'].slice(14));
    }
    var queueName = argsObj.selectedPlaylist.name + ", turnt to " + argsObj.selectedTurntness;
    el.append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:'+queueName+':'+trackIds+'" frameborder="0" allowtransparency="true"></iframe>');
  };

  return PlayerService;
});
