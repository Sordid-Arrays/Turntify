var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

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

  // get spotify access token
  spotify.getToken(code, redirect_uri)
  .then(function (body) {
    access_token = body.access_token;
    refresh_token = body.refresh_token;
    return spotify.getUser(access_token);
  })

  .then(function(user){
    // save the user data in db
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
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

module.exports = router;
