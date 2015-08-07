/*
 * for accessing Echonest API
**/
var request = require('request');
var config = require('../config');

/*
 * getting Echo Nest track data
**/
var getTrackData = function (spotyfyId) {
  request({
    method: 'GET',
    url: 'http://developer.echonest.com/api/v4/song/profile', //URL to hit
    qs: {
      api_key: config.ECHONEST_API_KEY,
      format: "json",
      results: 1,
      bucket: 'audio_summary',
      track_id: spotyfyId
    }, //Query string data
  }, function (error, responce, body) {
    if (error) {
      console.error(error);
      return;
    }
    console.log('GOT RESPONSE',JSON.parse(body).response);
    var songData = JSON.parse(body).response.songs[0];
    var danceability = songData.audio_summary.danceability;
    console.log('danceability', danceability);
  });
};

module.exports = {
  getTrackData: getTrackData
};
