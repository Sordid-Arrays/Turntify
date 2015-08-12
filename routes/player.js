var express = require('express');
var request = require('request'); // "Request" library
var _ = require('underscore');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');

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
    res.json(playListArr);
  })
  .catch(function (e) {
    console.error('Got error: ',e);
  });
});

/**
* route for getting songs/tracks from playlist
*/
router.get('/user/playlist/:ownerId/:playlistId/:turntness', function(req, res) {
  var access_token = req.session.user.access_token;
  var target_userId = req.session.user.spotifyId;
  var target_ownerId = req.params.ownerId;
  var target_playlistId = req.params.playlistId;
  var target_turntness = req.params.turntness;

  spotify.getPlaylistTracks(target_ownerId, target_playlistId, access_token)
  .catch(spotify.OldTokenError, function () {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getPlaylistTracks(target_userId, target_playlistId, body.access_token);
    });
  })
  .then(function(playlist) {
    var songUris = playlist.items.map(function(item) {
      return item.track.uri;
    });
    return echonest.getTrackData(songUris);
  })
  .then(function(songs) {
    var tempSongs = _.sortBy(songs, function(song) {
        return song.audio_summary.danceability;
      });

    var turntness = {
      1: {lowLimit: 0, highLimit: 0.365},
      2: {lowLimit: 0.365, highLimit: 0.5},
      3: {lowLimit: 0.5, highLimit: 0.635},
      4: {lowLimit: 0.635, highLimit: 1}
    };
    res.json(_.filter(tempSongs, function(song) {
      return song.audio_summary.danceability >= turntness[target_turntness].lowLimit && song.audio_summary.danceability <= turntness[target_turntness].highLimit;
    }));
  })
  .catch(function (e) {
    console.error('Got error: ',e);
  });
});

module.exports = router;
