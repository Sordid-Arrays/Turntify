var expect = require('chai').expect;
var request = require('request');
var http = require('http');
var Promise = require('bluebird');
var assert = require('assert');
var nock = require('nock');

var spotify = require('../../../middlewares/spotify.js');
var config = require('../../../config.js');

var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var accessToken = 'access token';
var refreshToken = 'refresh token';
var userId = '22cw4tmccteifpehid5awbaki';
var playlistId = '0SzuoS1rVNdMR0Yj7RNPc0';
var oldToken = 'old token';


var api;

function mockGetUser() {
  return nock('https://api.spotify.com')
  .get('/v1/me')
  .reply(200, {
    id: 'my spotify id'
  });
}


function mockGetUserPlaylists(userId) {
  return nock('https://api.spotify.com')
  .get('/v1/users/' + userId + '/playlists')
  .reply(200, {
    items: [
      {
        name: 'usename',
        id: 'playlist id',
        owner: {
          id: 'owner id of the playlist'
        }
      }
    ]
  });
}

function mockGetTracks(userId, playlistId) {
  return nock('https://api.spotify.com')
  .get('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks')
  .reply(200, {
    items: [{
      track: {
        uri: 'spotify uri of the track'
      }
    }]
  });
}

function mockGetToken() {
  return nock('https://accounts.spotify.com')
  .post('/api/token')
  .reply(200, {
    access_token: 'neew access token',
    refresh_token: 'new refresh token'
  });
}

function mockRefreshToken() {
  return nock('https://accounts.spotify.com')
  .post('/api/token')
  .reply(200, {
    access_token: 'neew access token',
    refresh_token: 'new refresh token'
  });
}

function mockOldToken(route) {
  return nock('https://api.spotify.com')
  .get(route)
  .reply(401);
}

// /**
// * !! FOR INTEGRATION TESTING !!
// * get new token
// */
// var getTestingToken = function () {
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     form: {
//       grant_type: 'client_credentials'
//     },
//     headers: {
//       'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//     },
//     json: true
//   };
//
//   //request to get the actual token
//   return new Promise(function (resolve, reject) {
//     request.post(authOptions, function(error, response, body) {
//       if (error || response.statusCode !== 200) {
//         reject(error);
//         return;
//       }
//       resolve(body);
//     });
//   });
// };
//
// beforeEach(function (done) {
//   getTestingToken()
//   .then(function (body) {
//     console.log('GOT TOKEN', accessToken);
//     accessToken = body.access_token;
//     done();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

describe('getUser', function () {
  it('should return Promise', function () {
    api = mockGetUser();
    expect(spotify.getUser(accessToken)).to.be.instanceof(Promise);
  });
  it('should get user information', function (done) {
    api = mockGetUser();
    spotify.getUser(accessToken)
    .then(function (user) {
      expect(user).to.have.property('id').that.is.a('string');
      done();
    });
  });
  it('should throw OldTokenError when the token is expired', function (done) {
    api = mockOldToken('/v1/me');
    spotify.getUser(oldToken)
    .catch(function (err) {
      expect(err).to.be.instanceof(spotify.OldTokenError);
      done();
    });
  });
});

describe('getUserPlaylist', function () {
  it('should return Promise', function () {
    api = mockGetUserPlaylists(userId);
    expect(spotify.getUserPlaylist(userId, accessToken)).to.be.instanceof(Promise);
  });
  it('should get Playlist array', function (done) {
    api = mockGetUserPlaylists(userId);
    spotify.getUserPlaylist(userId, accessToken)
    .then(function (playlist) {
      expect(playlist).to.be.instanceof(Array);
      done();
    });
  });
  it('should throw OldTokenError when the token is expired', function (done) {
    api = mockOldToken('/v1/users/' + userId + '/playlists');
    spotify.getUserPlaylist(userId, oldToken)
    .catch(function (err) {
      expect(err).to.be.instanceof(spotify.OldTokenError);
      done();
    });
  });
});

describe('getPlaylistTracks', function () {
  it('should return Promise', function () {
    api = mockGetTracks(userId, playlistId);
    expect(spotify.getPlaylistTracks(userId, playlistId, accessToken)).to.be.instanceof(Promise);
  });
  it('should get tracks information', function (done) {
    api = mockGetTracks(userId, playlistId);
    spotify.getPlaylistTracks(userId, playlistId, accessToken)
    .then(function (tracks) {
      expect(tracks.items).to.be.an('array');
      expect(tracks.items[0].track.uri).to.be.a('string');
      done();
    });
  });
  it('should throw OldTokenError when the token is expired', function (done) {
    api = mockOldToken('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks');
    spotify.getPlaylistTracks(userId, playlistId, oldToken)
    .catch(function (err) {
      expect(err).to.be.instanceof(spotify.OldTokenError);
      done();
    });
  });
});

describe('getToken', function () {
  it('should return Promise', function () {
    api = mockGetToken();
    expect(spotify.getToken('some code', redirect_uri)).to.be.instanceof(Promise);
  });
  it('should get access_token and refresh_token', function (done) {
    api = mockGetToken();
    spotify.getToken('some code', redirect_uri)
    .then(function (body) {
      expect(body.access_token).to.be.a('string');
      expect(body.refresh_token).to.be.a('string');
      done();
    });
  });
});

describe('refresh token', function () {
  it('should return Promise', function () {
    api = mockRefreshToken();
    expect(spotify.refreshToken(refreshToken)).to.be.instanceof(Promise);
  });
  it('should get new access token', function (done) {
    api = mockRefreshToken();
    spotify.refreshToken(refreshToken)
    .then(function (body) {
      expect(body.access_token).to.be.a('string');
      done();
    });
  });
});
