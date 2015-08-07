var expect = require('chai').expect;
var request = require('request');
var http = require('http');
var assert = require('assert');

var echonest = require('../../../middlewares/echonest');

describe('getTrackData', function () {
  it('should get data of a song', function (done) {
    echonest.getTrackData('spotify:track:0jBE7Fn78EAvmIs3dCd6GO')
    .then(function (songs) {
      console.log(songs[0]);
      expect(songs).to.be.an('array');
      expect(songs[0].audio_summary.danceability).to.be.a('number');
      expect(songs[0].audio_summary.duration).to.be.a('number');
      expect(songs[0].title).to.be.a('string');
      done();
    });
  });
});
