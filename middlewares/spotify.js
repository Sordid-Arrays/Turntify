var request = require('request');
var Promise = require('bluebird');

var config = require('../config.js');
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret

/**
* get spotify user information
*/
var getUser = function(token) {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.get(options, function(error, resonse, body) {
      if (error) {
        console.error('get user ', error);
        console.log(response.statusCode);
        console.log(body);
        reject(error);
        return;
      }
      resolve(body);
    });
  });
};

/**
* get spotify user playlist information
*/
var getUserPlaylist = function(userId, token) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body) {
      if (error) {
        console.error(error);
        console.log(response.statusCode);
        reject(error);
        return;
      }
      var playListArr = [];
      for (var i = 0; i < body.items.length; i++) {
        playListArr.push({name: body.items[i].name, playlistId: body.items[i].id});
      }
      resolve(playListArr);
    });

  });
};

/**
* get spotify songs from playlist
*/
var getPlaylistTracks = function(userId, playlistId, token) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body) {
      if (error) {
        console.error(error);
        console.log(response.statusCode);
        reject(error);
        return;
      }
      resolve(body);
    });
  });
};

/**
* get new token
*/
var getToken = function (code, redirect_uri) {
  console.log(code);
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
  return new Promise(function (resolve, reject) {
    request.post(authOptions, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error('get token ', error);
        console.log(response.statusCode);
        console.log(body);

        reject(error);
        return;
      }
      resolve(body);
    });
  });
};

/**
* refresh token
*/
var refreshToken = function (refreshToken) {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  return new Promise(function (resolve, reject) {
    requ.post(authOptions, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error(error);
        console.log(response.statusCode);
        reject(error);
        return;
      }
      resolve(body);
    });
  });
};

module.exports = {
  getUser: getUser,
  getUserPlaylist: getUserPlaylist,
  getPlaylistTracks: getPlaylistTracks,
  getToken: getToken,
  refreshToken: refreshToken
};
