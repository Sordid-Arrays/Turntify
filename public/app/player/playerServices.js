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

  var getQueue = function(playlistId, turntness){
    return RequestService.getQueue(playlistId, turntness).then(function(data){
      return data;
    });
  };

  return {
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue
  };
});
