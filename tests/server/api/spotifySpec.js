var expect = require('chai').expect;
var assert = require('assert');
var nock = require('nock');
var queryString = require('query-string');

var spotify = require('../../../middlewares/spotify.js');

if(process.env.SPOTIFY_CLIENT_ID){
  var config = {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTFIY_CLIENT_SECRET: process.env.SPOTFIY_CLIENT_SECRET
  };
}else{
  var config = require('../../../config.js');
}

var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTFIY_CLIENT_SECRET; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var accessToken = 'access token';
var refreshToken = 'refresh token';
var userId = '22cw4tmccteifpehid5awbaki';
var playlistId = '0SzuoS1rVNdMR0Yj7RNPc0';
var oldToken = 'old token';
var index = 1;

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

function mockGetTracks(userId, playlistId, index) {
  return nock('https://api.spotify.com')
  .get('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?offset=' + index)
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

function mockInsertSong(userId, playlistId, songId) {
  var query = queryString.stringify({
    uris: songId
  });
  return nock('https://api.spotify.com')
  .post('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?' + query)
  .reply(200, {
    snapshot_id: 'whatever successful'
  });
}

function mockCreatePlaylist(userId, playlistName) {
  return nock('https://api.spotify.com')
  .post('/v1/users/' + userId + '/playlists')
  .reply(200, {
    id: 'newPlaylistID'
  });
}

function mockRemoveTracks(userId, playlistId, tracksTobeRemoved) {
  return nock('https://api.spotify.com')
  .delete('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks')
  .reply(200, {
    snapshot_id: 'whatever successful'
  });
}

function mockSearchArtist(searchWords) {
  var qs = queryString.stringify({
    type: 'artist',
    limit: 10
  });
  qs += '&q=' + searchWords.join('+') + '*';
  return nock('https://api.spotify.com')
  .get('/v1/search?' + qs)
  .reply(200, {
    artist_name: 'artist name',
    artist_uri: 'spotify uri of the artist'
  });
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
  it('should return Promise', function (done) {
    api = mockGetUser();
    spotify.getUser(accessToken)
    .then(function () {
      done();
    });
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
  it('should return Promise', function (done) {
    api = mockGetUserPlaylists(userId);
    spotify.getUserPlaylist(userId, accessToken)
    .then(function () {
      done();
    });
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
  it('should return Promise', function (done) {
    api = mockGetTracks(userId, playlistId, index);
    spotify.getPlaylistTracks(userId, playlistId, accessToken, index)
    .then(function () {
      done();
    });
  });
  it('should get tracks information', function (done) {
    api = mockGetTracks(userId, playlistId, index);
    spotify.getPlaylistTracks(userId, playlistId, accessToken, index)
    .then(function (tracks) {
      expect(tracks.items).to.be.an('array');
      expect(tracks.items[0].track.uri).to.be.a('string');
      done();
    });
  });
  it('should throw OldTokenError when the token is expired', function (done) {
    api = mockOldToken('/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?offset=' + index);
    spotify.getPlaylistTracks(userId, playlistId, oldToken, index)
    .catch(function (err) {
      expect(err).to.be.instanceof(spotify.OldTokenError);
      done();
    });
  });
});

describe('getToken', function () {
  it('should return Promise', function (done) {
    api = mockGetToken();
    spotify.getToken('some code', redirect_uri)
    .then(function () {
      done();
    });
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
  it('should return Promise', function (done) {
    api = mockRefreshToken();
    spotify.refreshToken(refreshToken)
    .then(function () {
      done();
    });
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

describe('insert song', function() {
  it('should insert song to playlist', function (done) {
    var songsStr = [
      {
        "_id":"any id",
        "spotify_id":"spotify id",
        "echonest_id":"echonest id",
        "artist_name":"artist name",
        "title":"song name",
        "danceability":0.5,
        "energy":0.477005,
        "duration":284.89333,
        "album_name":"album name",
        "turnt_bucket":4,
        "__v":0
      }
    ];
    api = mockInsertSong(userId, playlistId, songsStr);
    spotify.insertSong(accessToken, userId, playlistId, songsStr)
    .then(function (result) {
      //spotify will return object result with snapshot_id if insert successful
      expect(result.snapshot_id).to.be.a('string');
      done();
    });
  });
});

describe('create spotify playlist', function() {
  it('should create new playlist', function (done) {
    var playlistName = 'NameOfPlaylist';

    api = mockCreatePlaylist(userId, playlistName);
    spotify.createPlaylist(accessToken, userId, playlistName)
    .then(function(playlist) {
      expect(playlist).to.have.property('id').that.is.a('string');
      done();
    });
  });
});

describe('remove tracks from spotify playlist', function() {
  it('should delete tracks from spotify playlist', function(done) {
    var songsStr = [
      {
        "_id":"any id",
        "spotify_id":"spotify id",
        "echonest_id":"echonest id",
        "artist_name":"artist name",
        "title":"song name",
        "danceability":0.5,
        "energy":0.477005,
        "duration":284.89333,
        "album_name":"album name",
        "turnt_bucket":4,
        "__v":0
      }
    ];

    api = mockRemoveTracks(userId, playlistId, songsStr);
    spotify.removeTracks(userId, playlistId, accessToken, songsStr)
    .then(function(result) {
      //spotify will return object result with snapshot_id if remove successful
      expect(result.snapshot_id).to.be.a('string');
      done();
    });
  });
});

describe('search artists', function() {
  var searchWords = ['any', 'word'];

  if(typeof searchWords === 'string'){
    searchWords = [searchWords];
  }
  it('should return Promise', function (done) {
    api = mockSearchArtist(searchWords);
    spotify.searchArtist(searchWords, accessToken)
    .then(function () {
      done();
    });
  });
  it('should get artist data', function (done) {
    api = mockSearchArtist(searchWords);
    spotify.searchArtist(searchWords, accessToken)
    .then(function (artist) {
      expect(artist.artist_name).to.be.a('string');
      done();
    });
  });
});
