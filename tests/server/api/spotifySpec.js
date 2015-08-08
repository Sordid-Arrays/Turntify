var expect = require('chai').expect;
var request = require('request');
var http = require('http');
var assert = require('assert');

var spotify = require('../../../middlewares/spotify.js');
var accessToken = 'INSERT VALID TOKEN';
var userId = 'INSERT VALID USER ID';

describe('getUser', function () {
  it('should get user information', function (done) {
    spotify.getUser(accessToken)
    .then(function (user) {
      expect(user).to.have.property('id').that.is.a('string');
      done();
    });
  });
});

describe('getUserPlaylist', function () {
  it('should get Playlist array', function (done) {
    spotify.getUserPlaylist('rickyhendrawan', accessToken)
    .then(function (playlist) {
      expect(playlist).to.be.instanceof(Array);
      done();
    });
  });
});