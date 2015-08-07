/*
 * for accessing Echonest API
**/
var queryString = require('query-string');
var request = require('request');
var Promise = require("bluebird");

var config = require('../config');

/*
 * getting Echo Nest track data
**/
var getTrackData = function (spotyfyIds) {
  if (typeof spotyfyIds === 'string') {
    spotyfyIds = [spotyfyIds];
  }
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    bucket: 'audio_summary',
    track_id: spotyfyIds
  });

  return new Promise(function (resolve, reject) {
    request({
      method: 'GET',
      url: 'http://developer.echonest.com/api/v4/song/profile?' + query, //URL to hit
    }, function (error, responce, body) {
      if (error) {
        reject(error);
        return;
      }
      var songs = JSON.parse(body).response.songs;
      resolve(songs);
    });
  });
};

module.exports = {
  getTrackData: getTrackData
};
