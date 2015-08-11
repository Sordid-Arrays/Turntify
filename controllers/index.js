var express = require('express');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var _ = require('underscore');
var session = require('express-session');

var config = require('../config.js');
var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');
var User = require('../models/users.js');

var router = express.Router();
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
* keys for cookies
*/
var stateKey = 'spotify_auth_state';
var tokenKey = 'OAuth';
var refreshToken = 'refreshToken';
var userId = 'userId';
var returnKey = 'returnKey';

/**
* route for login
*/
router.get('/login', function(req, res) {

  var state = util.generateRandomString(16);
  res.cookie(stateKey, state);

  // application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })
  );
});

/**
* save new token cookie
*/
function updateCookieToken (res, newAccessToken, newRefreshToken) {
  res.cookie(tokenKey, newAccessToken);
  console.log(newAccessToken);
  if (newRefreshToken) {
    res.cookie(refreshToken, newRefreshToken);
  }
}

/**
* redirect route after authorized by spotify login
*/
router.get('/callback', function(req, res) {

  // application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  }

  var access_token, refresh_token;
  res.clearCookie(stateKey);
  spotify.getToken(code, redirect_uri)
  .then(function (body) {
    access_token = body.access_token;
    refresh_token = body.refresh_token;
    updateCookieToken(res, access_token, refresh_token);
    return spotify.getUser(access_token);
  })
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(refresh_token)
    .then(function (body) {
      updateCookieToken(res, body.access_token, body.refresh_token);
      return spotify.getUser(body.access_token);
    });
  })
  .then(function(user){
    //search if db exist in db and update
    var randomKey = util.generateRandomString(20);
    var query = {'spotifyId' : user.id};
    var newData = {
      'spotifyId' : user.id,
      'access_token' : access_token,
      'refresh_token' : refresh_token,
      'returnKey' : randomKey
    };
    //res.cookie(returnKey, randomKey);

    console.log('USER: ' + user.id);
    return User.findOneAndUpdate(query, newData, {upsert: true});
  }).then(function(user) {
    //req.session.user = newData;
    console.log('REQ: ',req);
    console.log('REQ SESSION: ',req.session);
    console.log('USER INSIDE: ' + user);
    res.redirect('/#/player');
  })
  .catch(function (e) {
    console.error('Got error: ',e);
  });
});

/**
* route for getting playlist based on user id
*/
router.get('/user/playlists', function(req,res) {
  var access_token = req.cookies[tokenKey];
  var target_id = req.cookies[userId];

  spotify.getUserPlaylist(target_id, access_token)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.cookies[refreshToken])
    .then(function (body) {
      updateCookieToken(res, body.access_token, body.refresh_token);
      return spotify.getUserPlaylist(target_id, body.access_token);
    });
  })
  .then(function(playListArr) {
    console.log()
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
  var access_token = req.cookies[tokenKey];
  var target_userId = req.cookies[userId];
  var target_ownerId = req.params.ownerId;
  var target_playlistId = req.params.playlistId;
  var target_turntness = req.params.turntness;

  spotify.getPlaylistTracks(target_ownerId, target_playlistId, access_token)
  .catch(spotify.OldTokenError, function () {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.cookies[refreshToken])
    .then(function (body) {
      updateCookieToken(res, body.access_token, body.refresh_token);
      return spotify.getPlaylistTracks(target_userId, target_playlistId, body.access_token);
    });
  })
  .then(function(playlist) {
    console.log('HERE IS PLAYLIST: ' + playlist);
    var songUris = playlist.items.map(function(item) {
      return item.track.uri;
    });
    return echonest.getTrackData(songUris);
  })
  .then(function(songs) {
    console.log('HERE IS SONG: ' + songs);
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
