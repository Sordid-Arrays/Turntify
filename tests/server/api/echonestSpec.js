var expect = require('chai').expect;
var assert = require('assert');
var nock = require('nock');
var queryString = require('query-string');

var echonest = require('../../../middlewares/echonest');
var config = require('../../../config');


var api;

function mockAPI(spotifyURIs) {
  if (typeof spotifyURIs === 'string'){
    spotifyURIs = [spotifyURIs];
  }
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    track_id: spotifyURIs
  });

  return nock('http://developer.echonest.com')
  .get('/api/v4/song/profile?' + query)
  .reply(200, {
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

describe('getTrackData', function () {
  it('should return Promise', function (done) {
    var spotifyURI = 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO';
    api = mockAPI(spotifyURI);
    echonest.getTrackData(spotifyURI)
    .then(function () {
      done();
    });
  });

  it('should get data of a song', function (done) {
    var spotifyURI = 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO';

    api = mockAPI(spotifyURI);
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

    api = mockAPI(spotyfyURIs);

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
});
