/*
 * for accessing Echonest API
**/
var queryString = require('query-string');
var request = require('request');

var config = require('../config');

/*
 * getting Echo Nest track data
**/
var getTrackData = function (spotyfyId) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    bucket: 'audio_summary',
    track_id: spotyfyId
  });

  request({
    method: 'GET',
    url: 'http://developer.echonest.com/api/v4/song/profile?' + query, //URL to hit
  }, function (error, responce, body) {
    if (error) {
      console.error(error);
      return;
    }
    var songData = JSON.parse(body).response.songs[0];
    var danceability = songData.audio_summary.danceability;
    console.log('danceability', danceability);
  });
};

module.exports = {
  getTrackData: getTrackData
};
