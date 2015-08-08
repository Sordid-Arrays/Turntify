/*
 * for accessing Echonest API
**/
var queryString = require('query-string');
var request = require('request');
var Promise = require("bluebird");
var _ = require('underscore');

var config = require('../config');

/*
 * getting Echo Nest track data
**/
var getTrackData = function (spotyfyURIs) {
  if(typeof spotyfyURIs === 'string'){
    spotyfyURIs = [spotyfyURIs];
  }
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    track_id: spotyfyURIs
  });

  return new Promise(function (resolve, reject) {
    request({
      method: 'GET',
      url: 'http://developer.echonest.com/api/v4/song/profile?' + query, //URL to hit
    }, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      console.log(JSON.parse(body).response);
      var songs = JSON.parse(body).response.songs;
      _.each(songs, function (song) {
        song.tracks = _.filter(song.tracks, function (track) {
          if(_.contains(spotyfyURIs, track.foreign_id)){
            return track;
          }
        });
      });
      resolve(songs);
    });
  });
};

module.exports = {
  getTrackData: getTrackData
};
