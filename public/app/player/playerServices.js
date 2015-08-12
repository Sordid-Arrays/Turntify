/**
* the playerService will hold any business logic relating to the player. 
* Directives will be in a seperate directive folder
*/
angular.module('turntify.player')
.factory('PlayerService', function PlayerService (RequestService) {
  var PlayerService = {};
  PlayerService.playlists = [];
  PlayerService.queue = [];

  /**
  * getListOfPlaylists is called on initialization, sends a get request from the request factory,
  * and sets the playlists property equal to the result.
  */ 
  
  PlayerService.getListOfPlaylists = function(){
    var context = this;
    return RequestService.getListOfPlaylists().then(function(data){
      context.playlists = data;
      console.log("playlists: ", context.playlists);
    });
  };
  
  /**
  * getQueue takes a playlist and turntness level, sends it to the RequestService, and updates the
  * current queue to reflect that change.
  */
  
  PlayerService.getQueue = function(playlist, turntness){
    var context = this;
    return RequestService.getQueue(playlist.ownerId, playlist.playlistId, turntness).then(function(data){
      context.queue = data;
      //checks to see if queue has songs, and a widget should be made
      if(context.queue.length>0){
        console.log('gotta song!');
        //this will have to be updated when 'generateWidget' is refactored.
        context.generateWidget({queue: context.queue,
                                selectedPlaylist: playlist,
                                selectedTurntness: turntness});
        return;
      }
      console.log('no tracks in playlist "'+playlist.name+'" at turntness '+turntness);
      return;
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
      trackIds.push(queue[i]['tracks'][0]['foreign_id'].slice(14));
    };
    var queueName = argsObj.selectedPlaylist.name + ", turnt to " + argsObj.selectedTurntness;
    el.append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:'+queueName+':'+trackIds+'" frameborder="0" allowtransparency="true"></iframe>');
  }

  return PlayerService;
});
