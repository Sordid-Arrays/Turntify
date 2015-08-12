var express = require('express');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
//var session = require('express-session');

var config = require('../config.js');
var spotify = require('../middlewares/spotify.js');
var util = require('../helpers/util');
var User = require('../models/users.js');

var router = express.Router();
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var stateKey = 'spotify_auth_state';

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
    return spotify.getUser(access_token);
  })
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getUser(body.access_token);
    });
  })
  .then(function(user){
    var query = {spotifyId : user.id};
    var newData = {
      spotifyId : user.id,
      access_token : access_token,
      refresh_token : refresh_token
    };

    return User.findOneAndUpdate(query, newData, {upsert: true});
  }).then(function(user) {
    req.session.user = user;
    req.session.save();
    res.redirect('/#/player');
  })
  .catch(function (e) {
    console.error('Got error: ',e);
  });
});

module.exports = router;
