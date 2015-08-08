//business logic specific to the turnt-o-meter and the playlist selector
//TODO: consider refactoring these into seperate factories, within the same file
angular.module('turntify.modifyPlaylist')
.factory('ModifyPlaylistService', function (RequestService, $q) {

  var getListOfPlaylists = function(){
    return RequestService.getListOfPlaylists().then(function(data){
      console.log('in service, list is', data);
      return data;
      // return list;
    });
  };

  var getQueue = function(playlistId){
    return RequestService.getQueue(playlistId);
  };

  return {
    getListOfPlaylists: getListOfPlaylists,
    getQueue: getQueue
  };
});
