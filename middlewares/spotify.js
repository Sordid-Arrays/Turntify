var request = require('request');
var Promise = require('bluebird');

var config = require('../config.js');
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret

var tokenKey = 'OAuth';
var refreshToken = 'refreshToken';

/**
* Custom Error to throw when token is exipiered
*/
var OldTokenError = function () {
  this.name = "OldTokenError";
  Error.captureStackTrace(this, OldTokenError);
};
OldTokenError.prototype = Object.create(Error.prototype);
OldTokenError.prototype.constructor = OldTokenError;

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
    return request.get(options, function(error, response, body) {
      if (response.statusCode === 401) {
        reject(new OldTokenError());
        return;
      }
      if (error || response.statusCode !== 200) {
        console.error('get user ', error);
        console.log(response.statusCode);
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
    return request.get(options, function(error, response, body) {
      if (response.statusCode === 401) {
        console.log('401 in getPlaylist');
        reject(new OldTokenError());
        return;
      }
      if (error || response.statusCode !== 200) {
        console.error('error in getUserPlaylist ', error);
        console.log(response.statusCode);
        reject(error);
        return;
      }
      var playListArr = [];
      for (var i = 0; i < body.items.length; i++) {
        playListArr.push({name: body.items[i].name, playlistId: body.items[i].id, ownerId: body.items[i].owner.id});
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
    return request.get(options, function(error, response, body) {
      if (response.statusCode === 401) {
        console.log('401 in getPlaylistTracks');
        reject(new OldTokenError());
        return;
      }
      if (error || response.statusCode !== 200) {
        console.error('error in getPlaylistTracks',error);
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
  console.log('REFRESH TOKEN!');
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    json: true
  };

  return new Promise(function (resolve, reject) {
    request.post(authOptions, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error(error);
        console.log(authOptions);
        console.log('refreshToken failed? ',response.statusCode);
        reject(error);
        return;
      }
      console.log('EXPIRES IN ', body.expires_in);
      console.log('refresh token????  ', body.refresh_token);
      resolve(body);
    });
  });
};

module.exports = {
  getUser: getUser,
  getUserPlaylist: getUserPlaylist,
  getPlaylistTracks: getPlaylistTracks,
  getToken: getToken,
  refreshToken: refreshToken,
  OldTokenError: OldTokenError
};
