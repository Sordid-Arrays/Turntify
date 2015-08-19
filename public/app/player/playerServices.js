/**
* the playerService will hold any business logic relating to the player.
* Directives will be in a seperate directive folder
*/
angular.module('turntify.player')
.factory('PlayerService', function PlayerService (RequestService) {
  var PlayerService = {};
  PlayerService.playlists = [];
  PlayerService.playlist = [];  
  PlayerService.viewQueue = [];
  PlayerService.turntness = 1;

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

  PlayerService.persistViewQueue = function(viewQueue, turntness, selectedPlaylist){
    var context = this;
    console.log("viewQueue: ", viewQueue);
    context.queue = viewQueue;
    if(context.queue.length>0){
      context.generateWidget({queue: context.queue,
                        selectedPlaylist: selectedPlaylist,
                        selectedTurntness: turntness});
    }
  };

  PlayerService.getPlaylist = function(playlist){
    var context = this;
    return RequestService.getPlaylist(playlist.ownerId, playlist.playlistId).then(function(data){
      context.playlist = data;
      console.log("playerservice playlist: ", context.playlist);
    });
  };
  

  /**
  * TODO: refactor 'generateWidget' into a custom directive. Perhaps it gets called from here?
  */
  PlayerService.generateWidget = function(argsObj){
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
