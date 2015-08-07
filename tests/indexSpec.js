var expect = require('chai').expect;
var request = require('request');
var http = require('http');
var assert = require('assert');

process.env.TESTING = true;

var app = require('../app');

describe('get play list', function () {
  it('should return array of songs', function (done) {
    var uri = 'http://localhost:8888/user/22cw4tmccteifpehid5awbaki/playlist/0SzuoS1rVNdMR0Yj7RNPc0';
    request({'uri': uri, 'json': true}, function(err, res, body) {
      expect(body.tracks).to.be.an('array');
      expect(body.name).to.be.a('string');
      body.tracks.each(function (song) {
        expect(song.name).to.be.a('string');
        expect(song.duration).to.be.a('number');
        expect(song.danceability).to.be.a('number');
      });
      done();
    });
  });
  it('should be sorted by danceability', function (argument) {
    // body...
  })
})
