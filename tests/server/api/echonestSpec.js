var expect = require('chai').expect;
var assert = require('assert');

var echonest = require('../../../middlewares/echonest');

describe('getTrackData', function () {
  it('should get data of a song', function (done) {
    var spotifyURI = 'spotify:track:0jBE7Fn78EAvmIs3dCd6GO';
    echonest.getTrackData(spotifyURI)
    .then(function (songs) {
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.equal(1);
      console.log(songs[0]);
      expect(songs[0].audio_summary.danceability).to.be.a('number');
      expect(songs[0].audio_summary.duration).to.be.a('number');
      expect(songs[0].tracks[0].catalog).to.be.equal('spotify');
      expect(songs[0].tracks[0].foreign_id).to.be.equal(spotifyURI);
      expect(songs[0].title).to.be.a('string');
      done();
    });
  });

  it('should get data of multiple songs', function (done) {
    echonest.getTrackData(['spotify:track:0jBE7Fn78EAvmIs3dCd6GO', 'spotify:track:7begD9rvaWdTHNdXmQuF9E', 'spotify:track:4ebz0AQonOk427qxoDAHyH'])
    .then(function (songs) {
      expect(songs).to.be.an('array');
      expect(songs.length).to.be.equal(3);
      console.log(songs[0]);
      for (var i = 0; i < songs.length; i++) {
        expect(songs[i].audio_summary.danceability).to.be.a('number');
        expect(songs[i].audio_summary.duration).to.be.a('number');
        expect(songs[0].tracks[0].catalog).to.be.equal('spotify');
        expect(songs[0].tracks[0].foreign_id).to.be.equal(spotifyURI);
        expect(songs[i].title).to.be.a('string');
      }
      done();
    });
  });
});
