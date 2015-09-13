var request = require('request-promise');
var queryString = require('query-string');
var Promise = require('bluebird');
var _ = require('underscore');

if(process.env.SPOTIFY_CLIENT_ID){
  var config = {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTFIY_CLIENT_SECRET: process.env.SPOTFIY_CLIENT_SECRET
  };
}else{
  var config = require('../config.js');
}
var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret

var tokenKey = 'OAuth';
var refreshToken = 'refreshToken';

/**
* Custom Error to throw when token is expired
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
  return request.get(options)

  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

/**
* get spotify user playlist information
*/
var getUserPlaylist = function(userId, token) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists?' + queryString.stringify({limit: 50}),
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return request.get(options)
  .then(function (data) {
    return  data.items.map(function (item) {
      return {
        name:       item.name,
        playlistId: item.id,
        ownerId:    item.owner.id};
    });
  })

  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

/**
* get spotify songs from playlist
*/
var getPlaylistTracks = function(userId, playlistId, token, index) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?offset=' + index,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return request.get(options)
  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

/**
* get new token
*/
var getToken = function (code, redirect_uri) {
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
  return request.post(authOptions)

  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
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
      refresh_token: refreshToken
    },
    json: true
  };

  return request.post(authOptions)

  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

/**
* insert song to particular user playlist
*/
var insertSong = function(token, userId, playlistId, songId) {
  var numSongs = songId.length;
  var songIdIndex = 0;
  var songIdSub;
  var promises = [];

  // while(songIdIndex < numSongs){
  var recurse = function(){
    console.log(songIdIndex);
    if(songIdIndex >= numSongs){
      return
    }
    songIdSub = songId.slice(songIdIndex, Math.min(songIdIndex+100, numSongs))
    songIdIndex = songIdIndex+100;

    var option = {
      url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks',
      headers: { 'Authorization': 'Bearer ' + token },
      body:{
        uris: songIdSub
      },
      json: true
    };

    request.post(option).then(function(){
      recurse();
    }).catch(function (err) {
      console.log('INSIDE ERROR SPOTIFY.JS');
      if (err.statusCode === 401) {
        throw new OldTokenError();
      }
      console.log(JSON.stringify(err.response.body.error));
      throw err;
    });

    // promises.push(request.post(option).catch(function(err){console.log('PROMISE ARRAY'); console.log(err);}));
  }
  recurse();

  // Promise.all(promises).then(function(done){
    return;
  // })
  
};

/**
* create playlist in spotify
*/
var createPlaylist = function(token, userId, playlistName) {
  var option = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists' ,
    headers: { 'Authorization': 'Bearer ' + token },
    body: {
      name: playlistName,
      public: 'true'
    },
    json: true
  };

  return request.post(option)
  .catch(function (err) {
    console.log("error in createPlaylist!");
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

/**
* remove tracks from playlist if user try to create same playlist name before inserting new tracks
* from req.body
*/
var removeTracks = function(userId, playlistId, token, tracksTobeRemoved) {

  var tracksBody = _.map(tracksTobeRemoved, function(track) {
    return {uri:track};
  });

  var option = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks'  ,
    headers: { 'Authorization': 'Bearer ' + token },
    body: {
      tracks: tracksBody
    },
    json: true
  };

  return request.del(option)
  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    throw err;
  });
};

var searchArtist = function(searchWords, token) {
  var qs = queryString.stringify({
    type: 'artist',
    limit: 10
  });
  // do not escape "+" and "*" with queryString
  qs += '&q=' + searchWords.join('+') + '*';
  var option = {
    url: 'https://api.spotify.com/v1/search?' + qs,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  return request.get(option)

  .catch(function (err) {
    if (err.statusCode === 401) {
      throw new OldTokenError();
    }
    console.error(err);
    throw err;
  });
};

module.exports = {
  getUser: getUser,
  getUserPlaylist: getUserPlaylist,
  getPlaylistTracks: getPlaylistTracks,
  getToken: getToken,
  refreshToken: refreshToken,
  OldTokenError: OldTokenError,
  insertSong: insertSong,
  createPlaylist: createPlaylist,
  removeTracks: removeTracks,
  searchArtist: searchArtist
};
