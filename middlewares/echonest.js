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

    if (songs === undefined) {
      return [];
    }
    return songs;
  });
};


/*
 * getting Echo Nest track data of an artist
**/
var getArtistTracks = function (spotifyUri) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 100,
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    artist_id: spotifyUri
  });

  return request.get({
      url: 'http://developer.echonest.com/api/v4/song/search?' + query, //URL to hit
  })
  .then(function (body) {
    var songs = JSON.parse(body).response.songs;
    // each song might have multiple tracks (in single, in album, in best hits, etc.)
    songs = _.chain(songs)
    .filter(function(song) {
      return song.tracks[0] !== undefined;
    })
    .each(function (song) {
      console.log(song.tracks[0]);
      song.tracks = [song.tracks[0]];  // for now, just return first track
    })
    .value();

    if (songs === undefined) {
      return [];
    }
    return songs;
  });
};

module.exports = {
  getTrackData: getTrackData,
  getArtistTracks: getArtistTracks
};
