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


describe('getTurntness', function () {
  var song = {
    audio_summary: {
      danceability: 0.5,
      energy: 0.5
    }
  };
  it('should return a number', function () {
    var result = util.getTurntness(song);
    expect(result).to.be.a('number');
  });
});

describe('sortByTurntness', function () {
  var firstSpotifyId = 'spotify id';
  var secondSpotifyId = 'spotify id';

  var songs = [{
    spotify_id: firstSpotifyId,
    echonest_id: 'echonest id',
    artist_name: 'Cloud Nothings',
    title: 'Stay Useless',
    danceability: 5,
    energy: 5,
    duration: 200,
    turnt_bucket: 7
  }, {
    spotify_id: secondSpotifyId,
    echonest_id: 'echonest id 2',
    artist_name: 'The Strokes',
    title: 'Is This It?',
    danceability: 3,
    energy: 3,
    duration: 200,
    turnt_bucket: 2
  }];
  it('should return an array', function () {
    expect(util.sortByTurntness(songs)).to.be.an('array');
  });
  it('should sort by sum of energy and danceability', function () {
    expect(util.sortByTurntness(songs)[0].spotify_id).to.be.equal(secondSpotifyId);
    expect(util.sortByTurntness(songs)[1].spotify_id).to.be.equal(firstSpotifyId);
  });
  it('should add turntness property', function () {
    expect(util.sortByTurntness(songs)[0].turntness).to.be.a('number');
  });
});

describe('solveDuplication', function () {
  var playlistItems = [{
    track: {
      id: '1Oy7KTvDoZKtozZnznYObC',
      name: 'Killer Cars',
      popularity: 40,
      preview_url: 'https://p.scdn.co/mp3-preview/7b88f79d82c504a71d1f6931a0be340383f2cc0f',
      track_number: 8,
      type: 'track',
      uri: 'spotify:track:1Oy7KTvDoZKtozZnznYObC'
    }
  }, {
    track: {
      id: '2uSyvWgaaK93nBbcVrpAiV',
      name: 'India Rubber',
      popularity: 39,
      preview_url: 'https://p.scdn.co/mp3-preview/414746b02eb2cb57a5d6e887454473811dcc05c7',
      track_number: 9,
      type: 'track',
      uri: 'spotify:track:2uSyvWgaaK93nBbcVrpAiV'
    }
  }, {
    track: {
      id: '2uSyvWgaaK93nBbcVrpAiV',
      name: 'India Rubber',
      popularity: 39,
      preview_url: 'https://p.scdn.co/mp3-preview/414746b02eb2cb57a5d6e887454473811dcc05c7',
      track_number: 9,
      type: 'track',
      uri: 'spotify:track:2uSyvWgaaK93nBbcVrpAiV'
    }
  }];
  it('should filter duplicated track', function () {
    expect(util.solveDuplication(playlistItems).length).to.be.equal(2);
    expect(util.solveDuplication(playlistItems)[0].track.uri).to.be.equal(playlistItems[0].track.uri);
    expect(util.solveDuplication(playlistItems)[1].track.uri).to.be.equal(playlistItems[1].track.uri);
  });
});
