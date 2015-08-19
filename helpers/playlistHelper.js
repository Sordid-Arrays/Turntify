var _ = require('underscore');
var Promise = require('bluebird');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');
var Songs = require('../models/songs.js');
var GhettoNest = require('../models/ghettoNest.js');

/*
*  map the spotify URI in the playlist and return an array of URIs
*/
function mapUris(playlist) {
  return _.chain(playlist.items)
  .map(function(item) {
    return item.track.uri;
  })
  .filter(function(uri) {
    // do not include URIs start with 'spotify:local', they are not in Echonest
    return uri.indexOf('spotify:track:') === 0;
  })
  .value();
}

/*
*  call spotify API to get tracks in the playlist
*/
function getSpotifyUris(userId, playlistId, index, req) {
  return spotify.getPlaylistTracks(userId, playlistId, req.session.user.access_token, index)
  .catch(spotify.OldTokenError, function () {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getPlaylistTracks(userId, playlistId, body.access_token, index);
    });
  });
}

/*
*  functions to get data of songs
*  1) from DB
*  2) from Echonest API if they are not in DB and save them in DB
*  after getting data, concat and return them
*/
function getEchonestData (spotifyUris) {
  var tracks = [];

  // 1) check database for existing song
  return GhettoNest.find({spotify_id: { $in: spotifyUris}})
  .then(function(dbSongs) {
    tracks = dbSongs;
    var dbSongUris = _.map(dbSongs, function(dbSong) {
      return dbSong.spotify_id;
    });
    // do not request for songs which are in the database
    spotifyUris = _.filter(spotifyUris, function(spotifyUri) {
      return !_.contains(dbSongUris, spotifyUri);
    });

    // 2) request echonest with songs
    if (spotifyUris.length > 0) {
      console.log(new Date(), 'Request Echonest API ' + spotifyUris.length + ' songs');
      return echonest.getTrackData(spotifyUris);
    }
    return [];
  })

  .then(function(echonestSongs) {
    if (echonestSongs.length < 1) {
      return tracks;
    }

    console.log(new Date(), 'Got Echonest API response: ' + echonestSongs.length + ' songs');
    var newGhettoNests = _.map(echonestSongs, function(echonestSong) {
      return {
        spotify_id: echonestSong.tracks[0].foreign_id,
        echonest_id: echonestSong.id,
        artist_name: echonestSong.artist_name,
        title: echonestSong.title,
        danceability: echonestSong.audio_summary.danceability,
        energy: echonestSong.audio_summary.energy,
        duration: echonestSong.audio_summary.duration,
        album_name: echonestSong.tracks[0].album_name,
        turnt_bucket: util.getTurntness(echonestSong)
      };
    });
    // insert to the database
    GhettoNest.create(newGhettoNests);
    tracks = tracks.concat(newGhettoNests);

    return tracks;
  });
}

/*
*  MAIN FUNCTION
*  get spotify URI and get Echonest data
*  call spotify API multiple times because spotify API cannot return
*  more than 100 songs at a time.
*/
function getTracks(userId, playlistId, req) {
  console.log(new Date(), 'getTracks START: ');
  var allTracks = [];  // push tracks when DB response or Echonest response come back
  var resCount = 0; // keep track of response count and request count
  var reqCount = 0;

  // wait until all response come back
  return new Promise(function (resolve, reject) {

    /*
    * recursive function
    * keep getting spotify URIs without waiting for spotify API, DB and Echonest API response
    * until get all songs in the playlist
    */
    function makeRequest(index, first) {
      reqCount ++;
      getSpotifyUris(userId, playlistId, index, req)
      .then(function (playlist) {
        console.log(new Date(), 'got spotify URI ' + index + ' ~ ' + (index + 100));
        var totalTracks = playlist.total;

        // keep calling spotify API without waiting for the response
        // only on the first call, recurse to get spotify uri of all songs
        while (first && totalTracks > index + 100) {
          index += 100;
          // recurse with second argument false to avoid recursing
          makeRequest(index, false);
        }

        return getEchonestData(mapUris(playlist));
      })
      .then(function (tracks) {
        resCount ++;
        allTracks = allTracks.concat(tracks);
        // resolve when all requests come back
        if (resCount === reqCount) {
          resolve(allTracks);
          console.log(new Date(), 'getTracks FINISH: return ' + allTracks.length + ' songs');
        }
      })
      .catch(function (err) {
        reject(err);
      });
    }

    makeRequest(0, true);
  });
}

var getEmptyPlaylist = function(accessToken, userId, playlistName, playListArr, refreshToken) {
  var isPlaylistExist;
  var playlistIdToPass;

  isPlaylistExist = _.some(playListArr, function(playlist) {
    return playlist.name === playlistName;
  });
  if (!isPlaylistExist) {
    return spotify.createPlaylist(accessToken, userId, playlistName)
    .then(function(playlist) {
      playlistIdToPass = playlist.id;
      return playlistIdToPass;
    });
  }
  //console.log('CREATE PLAYLIST ARR: ',playListArr);
  playlistIdToPass = _.chain(playListArr)
  .filter(function(playlist) {
    return playlist.name === playlistName;
  })
  .map(function(item) {
    return item.playlistId;
  })
  .value();
  playlistIdToPass = playlistIdToPass[0];
  //console.log('CREATE PLAYLIST ID: ', playlistIdToPass);

  return getTracks(userId, playlistIdToPass, accessToken, refreshToken)
  .then(function(songs) {
    if (isPlaylistExist && songs.length > 0) {
    //if (songs.length > 0) {
      //delete all songs from playlist
      var songUris = _.map(songs, function(song) {
        return song.spotify_id;
      });
      //console.log('SongUris: ', songUris);

      return spotify.removeTracks(userId, playlistIdToPass, accessToken, songUris).
      then(function(done) {
        return playlistIdToPass;
      });
    }
    return playlistIdToPass;
  });
};


module.exports = {
  getTracks: getTracks,
  getEmptyPlaylist: getEmptyPlaylist
};
