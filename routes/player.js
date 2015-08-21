var express = require('express');
var _ = require('underscore');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var helper = require('../helpers/playlistHelper');
var util = require('../helpers/util');
var User = require('../models/users.js');
var GhettoNest = require('../models/ghettoNest.js');

var router = express.Router();

/**
* route for getting playlist based on user id
*/
router.get('/user/playlists', function(req,res) {
  var access_token = req.session.user.access_token;
  var target_id = req.session.user.spotifyId;

  spotify.getUserPlaylist(target_id, access_token)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getUserPlaylist(target_id, body.access_token);
    });
  })
  .then(function(playListArr) {
    //console.log(playListArr);
    res.json(playListArr);
  })
  .catch(function (e) {
    console.error('Got error: ',e);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* route for getting songs/tracks from playlist
*/
router.get('/user/playlist/:ownerId/:playlistId/', function(req, res) {
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;
  var userId = req.session.user.spotifyId;
  var targetOwnerId = req.params.ownerId;
  var targetPlaylistId = req.params.playlistId;

  helper.getTracks(targetOwnerId, targetPlaylistId, req)
  .then(function (tracks) {
    User.findOneAndUpdate({ spotifyId: userId }, { songQueue: tracks }).exec();
    res.json(tracks);
  })

  .catch(function (e) {
    console.error('Got error: ',e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* (Not used)
* route for searching song from all spotify
*/
router.get('/song', function(req, res) {
  var searchWords = req.query.song;
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;
  var resultSongs = [];

  if (typeof searchWords === 'string') {
    searchWords = [searchWords];
  }

  var dbSearchText = '"' + searchWords.join('" "') + '"';
  GhettoNest.find( { $text: { $search: dbSearchText}})
  .then(function(dbSongs) {
    resultSongs = _.map(dbSongs, function(dbsong) {
      return {
        album_name: dbsong.album_name,
        artist_name: dbsong.artist_name,
        title: dbsong.title,
        duration:dbsong.duration,
        spotify_id: dbsong.spotify_id};
    });

    if (dbSongs.length >= 10) {
      res.json(resultSongs);
      return;
    }

    //if result from db is less than 10 then do api request
    return spotify.searchSong(searchWords, accessToken, 10 - dbSongs.length)
    .catch(spotify.OldTokenError, function (err) {
      // statusCode 401:  Unauthorized
      return spotify.refreshToken(req.session.user.refresh_token)
      .then(function (body) {
        util.saveToken(req, body.access_token, body.refresh_token);
        return spotify.searchSong(searchWords, body.access_token, 10 - dbSongs.length);
      });
    });
  })
  .then(function(songs) {
    var searchResult = _.map(songs.tracks.items, function(song) {
      return {
        album_name: song.album.name,
        artist_name: song.artists[0].name,
        title: song.name,
        duration: song.duration_ms,
        spotify_id: song.uri
      };
    });
    res.json(resultSongs.concat(searchResult));
  });
});

/**
* (Not used)
* route for adding song to specific playlist
*/
//this should be a post when connect to front end
//router.get('/addsong/:playlistId', function(req, res) {
//router.post('/add/:ownerId/:playlistId/song', function(req, res) {
router.post('/addsong/:playlistId', function(req, res) {
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;
  var targetUserId = req.session.user.spotifyId;
  var targetPlaylistId = req.params.playlistId;
  var targetSongId = req.body.songId;
  //this is for teting, uncomment 3 lines on top when working with front end
  //var targetSongId = 'spotify:track:40riOy7x9W7GXjyGp4pjAv';  //hotel california
  // var targetSongId = 'spotify:track:5bC230viUaRu4uXGQkQDRV';  //temple of the king
  // var targetPlaylistId = '7obYR1XGAi1XqnyOpRiorR';
  // var targetOwnerId = 'rickyhendrawan';

  spotify.insertSong(accessToken, targetUserId, targetPlaylistId, targetSongId)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.insertSong(body.access_token, targetUserId, targetPlaylistId, targetSongId);
    });
  })
  .then(function(done) {
    res.json({success: true});
  })
  .catch(function(e) {
    console.log('Got error: ', e.stack);
    res.json({success:false});
  });
});


/**
* route for adding new playlist
*/
//router.get('/saveplaylist/:playlistName/:turntness', function(req, res) {
router.post('/saveplaylist/:playlistName', function(req, res) {
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;
  var userId = req.session.user.spotifyId;
  var playlistName = req.params.playlistName;
  var songs = req.body.songs;

  spotify.getUserPlaylist(userId, accessToken)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getUserPlaylist(userId, body.access_token);
    });
  })
  .then(function(playListArr) {
    return helper.getEmptyPlaylist(req, userId, playlistName, playListArr);
  })
  .then(function(playlistIdToPass) {
    var songArr = _.map(songs, function(song) {
      return song.spotify_id;
    });
    var songsStr = songArr.toString();
    return spotify.insertSong(accessToken, userId, playlistIdToPass, songsStr);
  })
  .then(function(done) {
    res.json({success: true});
  })
  .catch(function(e) {
    console.log('Got error: ', e.stack);
    res.json({success:false});
  });
});

/**
* route for searching for artists
*/
router.get('/searchartist', function(req, res) {
  //var searchWords = ['chicago'];
  var searchWords = req.query.artist;
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;
  if(typeof searchWords === 'string'){
    searchWords = [searchWords];
  }

  return spotify.searchArtist(searchWords, accessToken)
  .catch(function(err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.searchArtist(searchWords, body.access_token);
    });
  })
  .then(function(artists) {
    var searchResult = _.map(artists.artists.items, function(artist) {
      return {
        artist_name: artist.name,
        artist_uri: artist.uri
      };
    });
    res.json(searchResult);
  });
});

/**
* route for getting songs of an artist
*/
router.get('/song/artist/:artistId', function(req, res) {
  var artistId = req.params.artistId;
  console.log('BEGIN!: ', new Date());

  helper.getArtistTracks(artistId)
  .then(function(artistSongs) {
    console.log('FINISHED! ', artistSongs.length);
    res.json(artistSongs);
    console.log('FINISHED!: ', new Date());
  });
});

module.exports = router;
