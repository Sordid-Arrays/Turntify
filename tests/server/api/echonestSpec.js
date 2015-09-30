var expect = require('chai').expect;
var assert = require('assert');
var nock = require('nock');
var queryString = require('query-string');

var echonest = require('../../../middlewares/echonest');
if(process.env.SPOTIFY_CLIENT_ID){
  var config = {
    ECHONEST_API_KEY: process.env.ECHONEST_API_KEY,
  };
}else{
  var config = require('../../../config');
}

var api;

function mockGetTrackData(spotifyURIs, status) {
  if (typeof spotifyURIs === 'string'){
    spotifyURIs = [spotifyURIs];
  }
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    track_id: spotifyURIs
  });

  return nock('http://developer.echonest.com')
  .get('/api/v4/song/profile?' + query)
  .reply(status, {
    response: {
      songs: spotifyURIs.map(function (uri) {
        return {tracks: [
          {foreign_id: 'One'},
          {foreign_id: 'Two'},
          {foreign_id: uri},
          {foreign_id: 'Four'}
        ]};
      })
    }
  });
}

function mockGetArtistTracks (spotifyURI, index, status) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 100,
    start: index,
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    artist_id: spotifyURI,
    sort: 'song_hotttnesss-desc'
  });

  return nock('http://developer.echonest.com')
  .get('/api/v4/song/search?' + query)
  .reply(status, {
    response: {
      songs: [{
        id: 'Echo Nest id',
        artist_name: 'Muse',
        title: 'Uprizing',
        audio_summary: {
          energy: 1,
          danceability: 1,
          duration: 1200
        },
        tracks: [{
          foreign_id: 'spotify:track:4VqPOruhp5EdPBeR92t6lQ',
          album_name: 'The Resistance'
        },
        {
          foreign_id: 'spotify:track:otherUri',
          album_name: 'Other Album'
        }]
      }]
    }
  });
}

function mockGetArtistTotal(spotifyURI, status) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    start: 0,
    id: spotifyURI
  });
  return nock('http://developer.echonest.com')
  .get('/api/v4/artist/songs?' + query)
  .reply(status, {
    response: {
      total: 5
    }
  });
}

describe('getTrackData', function () {
  it('should return Promise', function (done) {
    var spotifyURI = 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO';
    api = mockGetTrackData(spotifyURI, 200);
    echonest.getTrackData(spotifyURI)
    .then(function () {
      done();
    });
  });

  it('should get data of a song', function (done) {
    var spotifyURI = 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO';

    api = mockGetTrackData(spotifyURI, 200);
    echonest.getTrackData(spotifyURI)
    .then(function (songs) {
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.equal(1);
      // expect(songs[0].audio_summary.danceability).to.be.a('number');
      // expect(songs[0].audio_summary.duration).to.be.a('number');
      // expect(songs[0].tracks[0].catalog).to.be.equal('spotify');
      expect(songs[0].tracks[0].foreign_id).to.be.equal(spotifyURI);
      // expect(songs[0].title).to.be.a('string');
      done();
    });
  });

  it('should get data of multiple songs', function (done) {
    var spotyfyURIs = ['spotify:track:0jBE7Fn78EAvmIs3dCd6GO', 'spotify:track:7begD9rvaWdTHNdXmQuF9E', 'spotify:track:4ebz0AQonOk427qxoDAHyH'];

    api = mockGetTrackData(spotyfyURIs, 200);

    echonest.getTrackData(spotyfyURIs)
    .then(function (songs) {
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.equal(3);
      for (var i = 0; i < songs.length; i++) {
        // expect(songs[i].audio_summary.danceability).to.be.a('number');
        // expect(songs[i].audio_summary.duration).to.be.a('number');
        // expect(songs[i].tracks[0].catalog).to.be.equal('spotify');
        expect(songs[i].tracks[0].foreign_id).to.be.a('string');
        // expect(songs[i].title).to.be.a('string');
      }
      done();
    });
  });

  it('should throw TooManyRequestsError when status code is 429', function (done) {
    var spotyfyURIs = ['spotify:track:0jBE7Fn78EAvmIs3dCd6GO', 'spotify:track:7begD9rvaWdTHNdXmQuF9E', 'spotify:track:4ebz0AQonOk427qxoDAHyH'];
    api = mockGetTrackData(spotyfyURIs, 429);
    echonest.getTrackData(spotyfyURIs)
    .catch(function (error) {
      expect(error).to.be.instanceof(echonest.TooManyRequestsError);
      done();
    });
  });
});

describe('getArtistTracks', function () {
  it('should return Promise', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTracks(spotifyURI, 0, 200);
    echonest.getArtistTracks(spotifyURI, 0)
    .then(function () {
      done();
    });
  });

  it('should get song data of an artist', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTracks(spotifyURI, 0, 200);
    echonest.getArtistTracks(spotifyURI, 0)
    .then(function (songs) {
      expect(songs).to.be.an('array');
      expect(songs[0].tracks[0].foreign_id).to.be.a('string');
      expect(songs[0].id).to.be.a('string');
      expect(songs[0].artist_name).to.be.a('string');
      expect(songs[0].title).to.be.a('string');
      expect(songs[0].audio_summary).to.be.an('object');
      done();
    });
  });

  it('should throw TooManyRequestsError when status code is 429', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTracks(spotifyURI, 0, 429);
    echonest.getArtistTracks(spotifyURI, 0)
    .catch(function (error) {
      expect(error).to.be.instanceof(echonest.TooManyRequestsError);
      done();
    });
  });
});

describe('getArtistTotal', function () {
  it('should return Promise', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTotal(spotifyURI, 200);
    echonest.getArtistTotal(spotifyURI)
    .then(function () {
      done();
    });
  });

  it('should get total number of songs of the artist', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTotal(spotifyURI, 200);
    echonest.getArtistTotal(spotifyURI)
    .then(function (total) {
      expect(total).to.be.a('number');
      done();
    });
  });

  it('should throw TooManyRequestsError when status code is 429', function (done) {
    var spotifyURI = 'spotify:artist:12Chz98pHFMPJEknJQMWvI';
    api = mockGetArtistTotal(spotifyURI, 429);
    echonest.getArtistTotal(spotifyURI)
    .catch(function (error) {
      expect(error).to.be.instanceof(echonest.TooManyRequestsError);
      done();
    });
  });
});
