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
router.get('/user/playlist/:ownerId/:playlistId/:turntness', function(req, res) {
  var access_token = req.session.user.access_token;
  var refresh_token = req.session.user.refresh_token;
  var target_userId = req.session.user.spotifyId;
  var target_ownerId = req.params.ownerId;
  var target_playlistId = req.params.playlistId;
  var target_turntness = req.params.turntness;

  helper.getTracks(target_ownerId, target_playlistId, access_token, refresh_token, target_turntness)
  .then(function (tracks) {
    console.log('HERE TRACK');
    console.log(tracks);
    var limitedTracks = tracks.map(function(track) {

    });
    User.findOneAndUpdate({ spotifyId: target_userId }, { songQueue: tracks })
    .then (function(user) {
      //console.log(user);
      //res.json(tracks);
    });
    // .catch(function(error) {
    //   console.log('ERROR UPDATE QUEUE ', error);
    // });
    res.json(tracks);
  })

  .catch(function (e) {
    console.error('Got error: ',e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

module.exports = router;
