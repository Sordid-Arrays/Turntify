/**
* this module will:
* 1) create a module ("services") for services shared between apps
* 2) handle RESTful interaction between the client and the server. Other services that store
* information or functions required across the app can be added to the turntify.services namespace in another file.
* any logic/data filters longer than a couple lines should be required in another factory file
*/
angular.module('turntify.services', [])
.factory('RequestService', function($http, $q) {

  var getListOfPlaylists = function(){
    // console.log('calling get list');
    return $http({
      method: 'GET',
      url: 'user/playlists',
    }).then(function(res){
      // console.log("getListOfPLaylists: ",res.data);
      return res.data;
    },function(error) {
      console.log(error);
      return;
    });
  };

  var getPlaylist = function(ownerId, playlistId){
    return $http({
      method: 'GET',
      url: 'user/playlist/'+ ownerId +'/' + playlistId,
    }).then(function(res){
      // console.log(JSON.stringify(res.data));
      return res.data;
    },function(error) {
      console.log(error);
      return;
    });
  };

  var savePlaylist = function(playlistName, playlist){
    return $http({
      method: 'POST',
      url: 'savePlaylist/'+ playlistName,
      data: {songs: playlist},
    }).then(function(res){
      console.log("did it??", res.data);
    },function(error) {
      console.log("effed up", error);
      return;
    });
  };

  var searchTracks = function (qs) {
    return $http({
      method: 'GET',
      url: 'song?' + qs
    }).then(function (res) {
      return res.data;
    }).catch(function (error) {
      console.log(error);
    });
  };

  var searchArtists = function (qs) {
    return $http({
      method: 'GET',
      url: 'searchartist?' + qs
    }).then(function (res) {
      return res.data;
    }).catch(function (error) {
      console.log(error);
    });
  };

  var getArtistSongs = function (artistUri) {
    return $http({
      method: 'GET',
      url: 'song/artist/' + artistUri
    }).then(function (res) {
      return res.data;
    }).catch(function (error) {
      console.log(error);
    })
  }

/**
* Dummy request to practice to testing the mock backend.
* Can be fiddled with as needed.
*/
  var dummyTest = function(){
    return $http({
      method: 'GET',
      url: 'dummyyolo/',
    }).then(function(res){
      return res.data;
    });
  };



  return {
    //return get/post functions. shouldn't contain persistent data: that should be sent elsewhere
    getListOfPlaylists: getListOfPlaylists,
    getPlaylist: getPlaylist,
    searchTracks: searchTracks,
    searchArtists: searchArtists,
    savePlaylist: savePlaylist,
    getArtistSongs: getArtistSongs,
    dummyTest: dummyTest
  };
});
