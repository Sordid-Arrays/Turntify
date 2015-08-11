/**
* the playerService will hold any business logic relating to the player. 
* Directives will be in a seperate directive folder
*/
angular.module('turntify.player')
.factory('PlayerService', function (RequestService) {
  // This will handle the song/queue display logic. Not sure where we will put the numerous hacks
  // needed to manhandle the spotify widgets, possibly in custom directives

  var getListOfPlaylists = function(){
    console.log('in lpayer service');
    return RequestService.getListOfPlaylists().then(function(data){
      console.log('in service, list is', data);
      return data;
      // return list;
    });
  };

  var getQueue = function(ownerId, playlistId, turntness){
    return RequestService.getQueue(ownerId, playlistId, turntness).then(function(data){
      return data;
    });
  };
  var generateWidget = function(argsObj){
    var el = angular.element(document.querySelector('.widgetWrapper'));
    el.empty();
    var trackIds = [];
    var queue= argsObj.queue;
    for(var i=0; i<queue.length; i++){
      trackIds.push(queue[i]['tracks'][0]['foreign_id'].slice(14));
    };
    var queueName = argsObj.selectedPlaylist.name + ", turnt to " + argsObj.selectedTurntness;
    el.append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:'+queueName+':'+trackString+'" frameborder="0" allowtransparency="true"></iframe>');
  }

  return {
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue,
    generateWidget: generateWidget
  };
});
