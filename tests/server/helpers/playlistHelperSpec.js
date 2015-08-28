var expect = require('chai').expect;
var assert = require('assert');
var sinon = require('sinon');
var Promise = require('bluebird');

var spotify = require('../../../middlewares/spotify.js');
var echonest = require('../../../middlewares/echonest.js');
var helper = require('../../../helpers/playlistHelper');


describe('getTracks', function () {
  before(function () {
    sinon.stub(spotify, 'getPlaylistTracks').returns(new Promise(function (resolve, reject) {
      resolve({
        total: 1,
        items: [{
          track: {
            uri: 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO'
          }
        }]
      });
    }));
    sinon.stub(echonest, 'getTrackData').returns(new Promise(function (resolve, reject) {
      resolve([
        {
          audio_summary: {
            danceability: 0.5,
            energy: 0.5
          }
        }
      ]);
    }));
  });
  it('should return Promise', function (done) {
    console.log(spotify.getPlaylistTracks());
    helper.getTracks('userId', 'playlistId', 'access token', 'refresh token', '5')
    .then(function () {
      done();
    });
  });
  it('should get an array', function (done) {
    helper.getTracks('userId', 'playlistId', 'access token', 'refresh token', '5')
    .then(function (result) {
      expect(result).to.be.an('array');
      done();
    });
  });
});
