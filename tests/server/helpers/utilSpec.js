var expect = require('chai').expect;
var assert = require('assert');

var util = require('../../../helpers/util');

describe('generateRandomString', function () {
  it('should return string whose length is equal to the argument', function () {
    var twelve = util.generateRandomString(12);
    expect(twelve).to.be.a('string');
    expect(twelve.length).to.be.equal(12);
    var five = util.generateRandomString(5);
    expect(five).to.be.a('string');
    expect(five.length).to.be.equal(5);
  });
  it('should return random string', function () {
    var first = util.generateRandomString(16);
    var second = util.generateRandomString(16);
    expect(first).to.be.not.equal(second);
  });
});


describe('danceableFiltering', function () {
  var songs = [
    { audio_summary: {
        danceability: 0.5
      }
    },
    { audio_summary: {
        danceability: 0.3
      }
    },
    { audio_summary: {
        danceability: 0.2
      }
    },
    { audio_summary: {
        danceability: 0.7
      }
    }
  ];
  it('should return an array', function () {
    var result = util.danceableFiltering(songs, 2);
    expect(result).to.be.an('array');
  });
  it('should filter the songs', function () {
    var result = util.danceableFiltering(songs, 3);
    expect(result.length).to.be.below(songs.length);
    expect(songs).to.include(result[0]);
  });
  it('should sort the songs by danceability', function () {
    var result = util.danceableFiltering(songs, 1);
    expect(result.length).to.be.below(songs.length);
    for (var i = 0; i < result.length -1; i++) {
      expect(result[i].audio_summary.danceability).to.be.below(result[i +1].audio_summary.danceability);
    }
  });
});
