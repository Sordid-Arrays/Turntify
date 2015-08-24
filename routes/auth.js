var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

if(process.env.SPOTIFY_CLIENT_ID){
  var config = {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTFIY_CLIENT_SECRET: process.env.SPOTFIY_CLIENT_SECRET
  };
}else{
  var config = require('../config.js');
}
var spotify = require('../middlewares/spotify.js');
var util = require('../helpers/util');
var User = require('../models/users.js');

var router = express.Router();
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
if(process.env.PORT){
  var redirect_uri = process.env.SPOTIFY_REDIRECT_URI; // Your redirect uri
}else{
  var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
}

var stateKey = 'spotify_auth_state';

/**
* route for login
*/
router.get('/login', function(req, res) {
  // no need to authenticate if the user is already logged in
  if (req.session.user) {
    res.redirect('/#/player');
    return;
  }

  var state = util.generateRandomString(16);
  res.cookie(stateKey, state);

  // application requests authorization
  var scope = 'user-read-private playlist-modify-public playlist-modify-private';
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

  // check to see the request is redirected form Spotify
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
    // remember the user data in session
    req.session.user = {
      spotifyId: user.spotifyId,
      access_token: access_token,
      refresh_token: refresh_token
    };
    req.session.save();
    // save the user data in database
    var query = {spotifyId : user.id};
    var newUser = {
      spotifyId : user.id,
      name: user.display_name || user.id
    };
    return User.findOneAndUpdate(query, newUser, {upsert: true});
  })
  .then(function(user) {
    res.redirect('/#/player');
  })

  .catch(function (e) {
    console.error('Got error: ', e, e.stack);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* destroy session on logout
*/
router.get('/logout', function(req, res) {
  req.session.destroy();
  res.json({success: true});
});

module.exports = router;
