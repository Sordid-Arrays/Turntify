//business logic specific to the turnt-o-meter and the playlist selector
//TODO: consider refactoring these into seperate factories, within the same file
angular.module('turntify.modifyPlaylist')
.factory('ModifyPlaylistService', function (RequestService) {

  var getListOfPlaylists = function(){
    return RequestService.getListOfPlaylists();
  };

  var getQueue = function(playlistId){
    return RequestService.getQueue(playlistId);
  };

  return {
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue
  };
});
