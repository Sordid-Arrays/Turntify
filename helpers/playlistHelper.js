var _ = require('underscore');
var Promise = require('bluebird');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');
var GhettoNest = require('../models/ghettoNest.js');

var UNKNOWN = 'unknown';

////////////////////////////////////////////////////
////  for getting tracks of playlists           ////
////////////////////////////////////////////////////
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
function getSpotifySongs(userId, playlistId, index, req) {
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
*  function to get data of songs
*  1) from DB
*  2) from Echonest API if they are not in DB and save them in DB
*  after getting data, concat and return them
*/
function getEchonestData (playlistSongs) {
  playlistSongs.items = util.solveDuplication(playlistSongs.items);
  var spotifyUris = mapUris(playlistSongs);
  var tracks = [];

  // 1) check database for existing songs
  return GhettoNest.find({spotify_id: { $in: spotifyUris}})
  .then(function(dbSongs) {
    // add db songs to tracks
    tracks = _.filter(dbSongs, function (dbSong) {
      return dbSong.echonest_id !== UNKNOWN;
    });

    // do not request for songs which are found in the database
    var dbSongUris = _.map(dbSongs, function(dbSong) {
      return dbSong.spotify_id;
    });
    spotifyUris = _.filter(spotifyUris, function(spotifyUri) {
      return !_.contains(dbSongUris, spotifyUri);
    });

    // 2) request echonest with songs
    if (spotifyUris.length > 0) {
      console.log(new Date(), 'Request Echonest API ' + spotifyUris.length + ' songs');
      return echonest.getTrackData(spotifyUris)
      .catch(echonest.TooManyRequestsError, function (error) {
        error.tracks = tracks;
        throw error;
      });
    }
    return [];
  })

  .then(function(echonestSongs) {
    // save the songs which are not in Echo Nest into Ghettonest as "unknown"
    var remainderUris = _.filter(spotifyUris, function (uri) {
      return !_.some(echonestSongs, function (echonestSong) {
        return echonestSong.tracks[0].foreign_id === uri;
      });
    });
    if (remainderUris.length > 0) {
      var unknownGhettonests = makeUpGhettonest(remainderUris, playlistSongs);
    }

    if (echonestSongs.length < 1) {
      return tracks;
    }

    console.log(new Date(), 'Got Echonest API response: ' + echonestSongs.length + ' songs');
    var newGhettoNests = saveGhettonest(echonestSongs, false);
    tracks = tracks.concat(newGhettoNests);

    return tracks;
  });
}

/*
*  Map the response form Echo Nest API and save it in DB
*  1) called with update = false in getPlaylistTracks
*  2) called with update = true in getArtistTracks
*/
function saveGhettonest(echonestSongs, update) {
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

  if (!update) {
    // 1) insert to the database
    GhettoNest.create(newGhettoNests);
    return newGhettoNests;
  }

  // 2) insert if not exist in DB
  var spotifyIdArr = _.map(newGhettoNests, function(newGhettoNest) {
    return newGhettoNest.spotify_id;
  });
  var query = {spotify_id: spotifyIdArr};

  GhettoNest.update(
    query,
    newGhettoNests,
    { upsert: true },
    function(err, doc) {
      if (err) {
        console.log('error inside GhettoNest.update: ', err);
      }
    }
  );
  return newGhettoNests;
}

/*
*  Make up Ghettonest data from Spotify data
*/
function makeUpGhettonest (remainderUris, spotifyDatas) {
  var newGhettoNests = [];
  // match the remainderUris with spotifyDatas
  _.each(spotifyDatas.items, function (spotifyData) {
    _.each(remainderUris, function (uri) {
      if (uri !== spotifyData.track.uri) {
        return;
      }
      // make up a Ghettonest Object if uri matches spotify data
      newGhettoNests.push( {
        spotify_id: uri,
        echonest_id: UNKNOWN,
        artist_name: spotifyData.track.artists[0].name,
        title: spotifyData.track.name,
        danceability: 0,  // set danceability and energy to 0 for now
        energy: 0,
        duration: spotifyData.track.duration_ms / 1000,
        album_name: spotifyData.track.album.name,
        turnt_bucket: 0
      });
    });
  });

  GhettoNest.create(newGhettoNests);
  console.log('madeUpGhettoNests: ', newGhettoNests.length);
  return newGhettoNests;
}

/*
*  1) Get Spotify URIs of songs in a playlist
*  2) Get Echo Nest data
*  Call spotify API multiple times asynchronously
*  because spotify API can return 100 songs at most for 1 request
*/
function getPlaylistTracks(userId, playlistId, req) {
  console.log(new Date(), 'getTracks START: ');
  var allTracks = [];  // push tracks when DB response or Echonest response come back
  var resCount = 0; // keep track of response count and request count
  var reqCount = 0;

  // wait until all response come back
  return new Promise(function (resolve, reject) {

    /*
    * recursive function
    * keep getting spotify URIs synchronously until get all songs in the playlist
    * and get Echo Nest data asynchronously
    */
    function get100Tracks(index, first) {
      reqCount ++;
      getSpotifySongs(userId, playlistId, index, req)
      .then(function (playlistSongs) {
        console.log(new Date(), 'got spotify URI ' + index + ' ~ ' + (index + 100));
        var totalTracks = playlistSongs.total;
        if (first) {
          console.log(totalTracks, 'songs in total');
        }

        // keep calling spotify API without waiting for the response
        // only on the first call, recurse to get spotify uri of all songs
        while (first && totalTracks > index + 100) {
          // Spotify send back 100 songs at most for 1 request
          index += 100;
          // recurse with second argument false not to get into this loop again
          get100Tracks(index, false);
        }

        return getEchonestData(playlistSongs);
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
      .catch(echonest.TooManyRequestsError, function (error) {
        resCount ++;
        // save the song data retrieved from DB
        allTracks = allTracks.concat(error.tracks);

        // reject when all response come back
        if (resCount === reqCount) {
          error.tracks = allTracks;
          console.log(new Date(), 'getTracks FINISH with TooManyRequestsError: return ' + allTracks.length + ' songs');
          reject(error);
        }
      })
      .catch(function (error) {
        reject(error);
      });
    }

    get100Tracks(0, true);
  });
}


////////////////////////////////////////////////////
////  for saving a new playlist in Spotify      ////
////////////////////////////////////////////////////
/*
* Check if playlist exist
* 1) If not exists, create a new playlist
* 2) If exists, delete all the tracks
* and return the playlistId
*/
var getEmptyPlaylist = function(req, userId, playlistName, playlists) {
  var playlistId;
  var accessToken = req.session.user.access_token;

  var targetPlaylist = _.filter(playlists, function(playlist) {
    return playlist.name === playlistName;
  })[0];

  var isPlaylistExist = !!targetPlaylist;

  // 1) if playlistName not exists in playlists, create a new playlist
  if (!isPlaylistExist) {
    return spotify.createPlaylist(accessToken, userId, playlistName)
    .then(function(playlist) {
      console.log("playlist created! with id: ", playlist.id);
      playlistId = playlist.id;
      return playlistId;
    });
  }

  // 2) if playlistName exist, get the playlist ID, delete all the songs
  playlistId = targetPlaylist.playlistId;

  // get all tracks to delete
  return getPlaylistTracks(userId, playlistId, req)
  .then(function(songs) {
    if (songs.length === 0) {
      return playlistId;
    }

    var songUris = _.map(songs, function(song) {
      return song.spotify_id;
    });
    //delete all songs from the playlist
    return spotify.removeTracks(userId, playlistId, accessToken, songUris);
  })
  .then(function() {
    return playlistId;
  });
};



/*
* Spotify limits adding 100 songs at a time to a playlist
* This function calls spotify.insertSong w/ max 100 songs at a time
*/
var addToSpotifyPlaylist = function(token, userId, playlistId, songId){
  var numSongs = songId.length;
  var songIdIndex = 0;
  var songIdSub;

  var recurse = function(){
    console.log(songIdIndex);
    if(songIdIndex >= numSongs){
      return
    }
    songIdSub = songId.slice(songIdIndex, Math.min(songIdIndex+100, numSongs))
    songIdIndex = songIdIndex+100;

    spotify.insertSong(token, userId, playlistId, songIdSub).then(function(){
      recurse();
    })
    .catch(function (err) {
      console.log('INSIDE ERROR SPOTIFY.JS');
      if (err.statusCode === 401) {
        throw new OldTokenError();
      }
      throw err;
    });
  }
  recurse();
  return;
};








////////////////////////////////////////////////////
//// for getting songs of an artist from Echo Nest//
////////////////////////////////////////////////////
/*
* Get all tracks of an artist
* Since Echonest API returns 100 songs at most for 1 request,
* request multiple times asynchronously
*/
var getArtistTracks = function (artistId) {
  var resultTracks = [];  // store all songs of the artist
  var reqCount = 0;       // keep track of response count and request count
  var resCount = 0;

  // wait until all response to come back
  return new Promise(function (resolve, reject) {

    echonest.getArtistTotal(artistId)
    .then(function (total) {
      // Echo Nest cannot accespt index over 1000
      total = Math.min(total, 1000);
      var index = 0;
      console.log('total: ', total);
      // make requests asynchronously to get all songs
      while (reqCount ===0 || index < total) {
        get100Tracks(index);
        index += 100;
      }
    })
    .catch(function (error) {
      reject(error);
    });

    // Internal function
    // Make an API request and  wait for all responses come back
    function get100Tracks (index) {
      reqCount ++;
      echonest.getArtistTracks(artistId, index)

      .then(function (echonestSongs) {
        resCount ++;
        var newGhettoNests = saveGhettonest(echonestSongs, true);
        resultTracks = resultTracks.concat(newGhettoNests);

        // resolve the Promise when all response came back
        if (reqCount === resCount) {
          resolve(resultTracks);
        }
      })
      .catch(echonest.TooManyRequestsError, function (error) {
        resCount ++;
        // reject and send back tracks returned so far
        if (reqCount === resCount) {
          error.tracks = resultTracks;
          reject(error);
        }
      })
      .catch(function (error) {
        reject(error);
      });
    }
  });
};

module.exports = {
  getPlaylistTracks: getPlaylistTracks,
  getEmptyPlaylist: getEmptyPlaylist,
  getArtistTracks: getArtistTracks,
  addToSpotifyPlaylist: addToSpotifyPlaylist
};
