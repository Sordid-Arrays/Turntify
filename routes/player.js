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
* route for getting playlists based on user id
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
    res.json(playListArr);
  })
  .catch(function (e) {
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* route for getting songs/tracks in a playlist
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
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});


/**
* route for adding a new playlist
* 1) get the user's playlist
* 2) prepare an empty playlist with specified name
* 3) add songs to the playlist
*/
router.post('/saveplaylist/:playlistName', function(req, res) {
  var userId = req.session.user.spotifyId;
  var playlistName = req.params.playlistName;
  var songs = req.body.songs;

  spotify.getUserPlaylist(userId, req.session.user.access_token)
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
    var songUris = _.map(songs, function(song) {
      return song.spotify_id;
    });
    var songsStr = songUris.toString();
    return spotify.insertSong(req.session.user.access_token, userId, playlistIdToPass, songsStr);
  })
  .then(function(done) {
    res.json({success: true});
  })
  .catch(function (e) {
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* route for searching for artists
*/
router.get('/searchartist', function(req, res) {
  var searchWords = req.query.artist;
  if(typeof searchWords === 'string'){
    searchWords = [searchWords];
  }

  return spotify.searchArtist(searchWords, req.session.user.access_token)
  .catch(spotify.OldTokenError, function(err) {
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
  })
  .catch(function (e) {
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
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
    res.json(artistSongs);
    console.log('FINISHED!: ', new Date(), artistSongs.length);
  })
  .catch(function (e) {
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

module.exports = router;
