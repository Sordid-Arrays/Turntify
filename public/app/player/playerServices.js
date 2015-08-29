/**
* the playerService will hold any business logic relating to the player.
* Directives will be in a seperate directive folder.
* TODO: move view-specific logic to view-specific service.
*/
angular.module('turntify.player')
.factory('PlayerService', function PlayerService ($rootScope, RequestService, turntToFilter) {
  var PlayerService = {};
  PlayerService.playlists = [];
  PlayerService.basePlaylist = [];
  PlayerService.playlistCollection = {};
  PlayerService.turntness = 1;
  PlayerService.customPlaylist = [];
  PlayerService.username = "";

/**
* PLAYER CONTROLLER services:
*/
  //on initialization,
  PlayerService.getListOfPlaylists = function(){
    var context = this;
    return RequestService.getListOfPlaylists().then(function(data){
     context.playlists = data.playlists;
     context.username = data.username;
     // console.log("playlists: ", context.playlists);
     // console.log("playlists type: ", typeof context.playlists[0]);
    });
  };

  //this gets a playlist from our server, and sets the loading property on the input for the duration
  PlayerService.getPlaylist = function(playlist){
    playlist.loading = true;
    var context = this;
    return RequestService.getPlaylist(playlist.ownerId, playlist.playlistId).then(function(data){
      // context.playlist = _.uniq(context.playlist.concat(data));
      playlist.loading = false;
      context.playlistCollection[playlist.name].songs = data;
      console.log("playerservice playlist collection:", context.playlistCollection);
      context.updateCustomPlaylist();
    });
  };

  // Call this when user "unchecks" a playlist
  PlayerService.removePlaylist = function(playlist){
    //changes the "checked" property of the selected playlist to false
    this.playlistCollection[playlist.name].checked = false;
    this.updateCustomPlaylist();
  };

  // call this when user "checks" a playlist
  PlayerService.addPlaylist = function(playlist){
    if(this.playlistCollection[playlist.name]){
      this.playlistCollection[playlist.name].checked = true;
      this.updateCustomPlaylist();
    } else {
      this.playlistCollection[playlist.name] = { checked: true , songs: [] };
      this.getPlaylist(playlist);
    };
  };

  //CALL THIS from param view, passing in the selected playlist and the checked property
  PlayerService.toggleCheck = function(playlist, checked){
    if(checked){
      this.addPlaylist(playlist);
    } else {
      this.removePlaylist(playlist);
    }
  };

/**
* CUSTOMPLAYLIST CONTROLLER services:
*/
  //removes song from custom playlist:
  PlayerService.removeFromCustomPlaylist = function(songIndex){
    this.customPlaylist.splice(songIndex, 1);
  };

  //saves playlist to spotify:
  PlayerService.savePlaylist = function(playlistName){
    RequestService.savePlaylist(playlistName, this.customPlaylist);
    console.log("savePlaylist args: ", playlistName, this.customPlaylist);
  };

  //swaps songs as they are dragged
  PlayerService.onDropComplete = function(index, song){
    var otherSong = this.customPlaylist[index];
    var otherIndex = this.customPlaylist.indexOf(song);
    this.customPlaylist[index] = song;
    this.customPlaylist[otherIndex] = otherSong;
  };

/**
* OTHER services:
*/
  //this function updates the "matches", and is run every time any of the filters changes
  PlayerService.updateTurntness = function(turntness){
    if(arguments.length > 0){
      this.turntness = turntness;
    };
    this.customPlaylist = turntToFilter(this.basePlaylist, this.turntness);
    $rootScope.$broadcast('playlistCollectionUpdated', this.turntness);
  };

  PlayerService.updateCustomPlaylist = function(){
    var allBeforeUniq = [];
    for(var key in this.playlistCollection){
      if(this.playlistCollection[key].checked){
        console.log("checked!");
        console.log("this.playlistCollection[key]: ", this.playlistCollection[key]);
        allBeforeUniq = allBeforeUniq.concat(this.playlistCollection[key].songs);
      }
    };
    console.log("allBeforeUniq: ", allBeforeUniq);
    this.basePlaylist = _.uniq(allBeforeUniq);
    console.log("this.baseplaylist in customPlaylist: ", this.basePlaylist);
    this.customPlaylist = turntToFilter(this.basePlaylist, this.turntness);
    $rootScope.$broadcast('playlistCollectionUpdated');
  };

  PlayerService.loadAllMatches = function(){
    $rootScope.$broadcast('loadAllMatches');
  };
  PlayerService.destroyExtras = function(){
    $rootScope.$broadcast('playlistCollectionUpdated');
  }
  // PlayerService.addMatches = function(matches){
  //   this.customPlaylist = _.uniq(this.customPlaylist.concat(matches));
  //   console.log("current playlist: ", this.customPlaylist);
  //   $rootScope.$broadcast('customPlaylistChanged');
  // };

  //TODO: get this to get info about the song (echonest data missing);
  // PlayerService.addFromSearch = function(song){
  //   this.customPlaylist.push(song);
  //   $rootScope.$broadcast('customPlaylistChanged');
  // };


  /**
  * TODO: refactor 'generateWidget' into a custom directive. Perhaps it gets called from here?
  */
  PlayerService.generateWidget = function(name){
    var el = angular.element(document.querySelector('.widgetWrapper'));
    el.empty();
    var trackIds = [];
    var playlist = PlayerService.customPlaylist;
    var length = playlist.length<25 ? playlist.length : 25;
    for(var i=0; i<length; i++){
      trackIds.push(playlist[i]['spotify_id'].slice(14));
    }
    el.append('<iframe src="https://embed.spotify.com/?uri=spotify:trackset:'+name+':'+trackIds+'" frameborder="0" allowtransparency="true"></iframe>');
  };

  // add an artist playlist on playlist list and load song to custom playlist
  PlayerService.addFromSearch = function (artist) {
    var context = this;
    // do not add new playlist if it already exist
    var isExist = _.some(context.playlists, function (playlist) {
      return playlist.spotify_id === artist.artist_uri;
    });
    if (isExist) {
      return;
    }

    var artistPlaylist = {name: artist.artist_name, spotify_id: artist.artist_uri, checked: true, loading: true};
    context.playlists.push(artistPlaylist);
    context.playlistCollection[artist.artist_name] = {checked: true,
                                                      songs: []};
    RequestService.getArtistSongs(artist.artist_uri)
    .then(function (songs) {
      artistPlaylist.loading = false;
      context.playlistCollection[artist.artist_name].songs = songs;
      context.updateCustomPlaylist();
    });
  };

  return PlayerService;
});
