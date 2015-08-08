var express = require('express');
var router = express.Router();

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var config = require('../config.js');
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
var redirect_uri = 'http://localhost:8888/player/modifyPlaylist'; // Your redirect uri
var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var _ = require('underscore');

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
var tokenKey = 'OAuth';
var refreshToken = 'refreshToken';
var userId = 'userId';

router.get('/login', function(req, res) {

  var state = generateRandomString(16);
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

router.get('/player/modifyPlaylist', function(req, res) {

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
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    //request to get the actual token
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token,
            expires_in = body.expires_in;
        spotify.getUser(access_token)
        .then(function(user){
          res.cookie(userId,user.id);
          return spotify.getUserPlaylist(user.id, access_token);
        })
        .then(function(playListArr) {
          res.cookie(tokenKey, access_token);
          res.cookie(refreshToken, refresh_token);
          res.json(playListArr);
        });

        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        //   }));
      } else {
        res.redirect('/refresh_token');
      }
    });
  }
});

router.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.cookies[refreshToken];
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

/**
* route for getting playlist based on user id
*/
router.get('/user/:id/playlist', function(req,res) {
  var access_token = req.cookies[tokenKey];
  var target_id = req.params.id;

  spotify.getUserPlaylist(target_id, access_token)
  .then(function(playListArr) {
    res.json(playListArr);
  });
});

/**
* route for getting songs/tracks from playlist
*/
router.get('/user/playlist/:playlistId', function(req, res) {
  var access_token = req.cookies[tokenKey];
  var target_userId = req.cookies[userId];
  //target_userId = 'rickyhendrawan';
  var target_playlistId = req.params.playlistId;

  spotify.getPlaylistTracks(target_userId, target_playlistId, access_token)
  .then(function(playlist) {
    var songUris = playlist.items.map(function(item) {
      return item.track.uri;
    });
    echonest.getTrackData(songUris)
    .then(function(songs) {
      res.json(_.sortBy(songs, function(song) {
        return song.audio_summary.danceability;
      }));
    });
  });
});

module.exports = router;
