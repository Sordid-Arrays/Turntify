var request = require('request');
var config = require('../config');
var Promise = require('bluebird');

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
      var playListArr = [];
      for (var i = 0; i < body.items.length; i++) {
        playListArr.push({name: body.items[i].name, playlistId: body.items[i].id});
      }
      console.log('HERE: ', playListArr);
      resolve(playListArr);
    });

  });
};

module.exports = {
  getUser: getUser,
  getUserPlaylist: getUserPlaylist
};