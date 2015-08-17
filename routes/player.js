var express = require('express');
var _ = require('underscore');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var helper = require('../helpers/playlistHelper');
var util = require('../helpers/util');
var User = require('../models/users.js');

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
  var targetUserId = req.session.user.spotifyId;
  var targetOwnerId = req.params.ownerId;
  var targetPlaylistId = req.params.playlistId;

  console.log('BEGIN ', new Date());
  helper.getTracks(targetOwnerId, targetPlaylistId, accessToken, refreshToken, req)
  .then(function (tracks) {
    User.findOneAndUpdate({ spotifyId: target_userId }, { songQueue: tracks }).exec();

    res.json(tracks);
  })

  .catch(function (e) {
    console.error('Got error: ',e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* route for searching song from all spotify
*/
router.get('/song', function(req, res) {
  var targetSong = req.query.song;
  //var targetSong = 'hotel california';
  var accessToken = req.session.user.access_token;
  var refreshToken = req.session.user.refresh_token;

  spotify.searchSong(targetSong, accessToken)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.searchSong(targetSong, body.access_token);
    });
  })

  .then(function(songs) {
    //console.log(songs.tracks.items[0]);
    var searchResult = _.map(songs.tracks.items, function(song) {
      return {
        album: song.album.name,
        artist: song.artists[0].name,
        songName: song.name,
        duration: song.duration_ms,
        spotifyUri: song.uri
      };
    });
    console.log(searchResult);
    res.json(searchResult);
  })
  .catch(function(e) {
    console.log('Got error: ', e.stack);
  });
});

/**
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

module.exports = router;
