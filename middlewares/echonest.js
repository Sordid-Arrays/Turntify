/*
 * for accessing Echonest API
**/
var queryString = require('query-string');
var request = require('request-promise');
var _ = require('underscore');

if(process.env.SPOTIFY_CLIENT_ID){
  var config = {
    ECHONEST_API_KEY: process.env.ECHONEST_API_KEY,
  };
}else{
  var config = require('../config.js');
}

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

  return request.get({
      url: 'http://developer.echonest.com/api/v4/song/profile?' + query, //URL to hit
  })
  .then(function (body) {
    var songs = JSON.parse(body).response.songs;
    // each song might have multiple tracks (in single, in album, in best hits, etc.)
    // we only need the track whose spotify URI is in given spotify URIs
    _.each(songs, function (song) {
      song.tracks = _.filter(song.tracks, function (track) {
        return _.contains(spotyfyURIs, track.foreign_id);
      });
    });
    return songs;
  });
};

module.exports = {
  getTrackData: getTrackData
};
