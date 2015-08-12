var expect = require('chai').expect;
var request = require('request');
var http = require('http');
var Promise = require('bluebird');
var assert = require('assert');

var spotify = require('../../../middlewares/spotify.js');
var config = require('../../../config.js');

var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret

var accessToken;
var userId = '22cw4tmccteifpehid5awbaki';
var playlistId = '0SzuoS1rVNdMR0Yj7RNPc0';
var oldToken = 'old token';

/**
* !! FOR TESTING !!
* get new token
*/
var getTestingToken = function () {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'client_credentials'
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
        reject(error);
        return;
      }
      resolve(body);
    });
  });
};

beforeEach(function (done) {
  getTestingToken()
  .then(function (body) {
    console.log('GOT TOKEN', accessToken);
    accessToken = body.access_token;
    done();
  })
  .catch(function (err) {
    console.error(err);
  });
});

// describe('getUser', function () {
//   it('should get user information', function (done) {
//     spotify.getUser(accessToken)
//     .then(function (user) {
//       expect(user).to.have.property('id').that.is.a('string');
//       done();
//     });
//   });
// });

describe('getUserPlaylist', function () {
  it('should get Playlist array', function (done) {
    spotify.getUserPlaylist(userId, accessToken)
    .then(function (playlist) {
      expect(playlist).to.be.instanceof(Array);
      done();
    });
  });
});

describe('getPlaylistTracks', function () {
  it('should get tracks information', function (done) {
    spotify.getPlaylistTracks(userId, playlistId, accessToken)
    .then(function (tracks) {
      expect(tracks.items).to.be.an('array');
      expect(tracks.items[0].track.uri).to.be.a('string');
      done();
    });
  });
  it('should throw OldTokenError when the token is expired', function (done) {
    spotify.getPlaylistTracks(userId, playlistId, oldToken)
    .catch(spotify.OldTokenError, function () {
      expect(true).to.be.eql(true);
      done();
    });
  });
});
