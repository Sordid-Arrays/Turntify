/*
 * module for accessing Echonest API
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


/**
* Custom Error to throw when we hit the rate limit of the API
*/
var TooManyRequestsError = function () {
  this.name = "TooManyRequestsError";
  this.tracks = [];
  Error.captureStackTrace(this, TooManyRequestsError);
};
TooManyRequestsError.prototype = Object.create(Error.prototype);
TooManyRequestsError.prototype.constructor = TooManyRequestsError;


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
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    track_id: spotyfyURIs
  });

  return request.get({
      url: 'http://developer.echonest.com/api/v4/song/profile?' + query, //URL to hit
  })
  .then(function (body) {
    var songs = JSON.parse(body).response.songs;
    if (songs === undefined) {
      return [];
    }

    var uriHash = {};
    _.each(spotyfyURIs, function (uri) {
      uriHash[uri] = true;
    });
    // each song might have multiple tracks (in single, in album, in best hits, etc.)
    // we only need the track whose spotify URI is in given spotify URIs
    _.each(songs, function (song) {
      song.tracks = _.filter(song.tracks, function (track) {
        if (uriHash[track.foreign_id]) {
          uriHash[track.foreign_id] = false;
          return true;
        }
        return false;
      });
    });
    return songs;
  })
  .catch(function (err) {
    if (err.statusCode === 429) {
      throw new TooManyRequestsError();
    }
    throw err;
  });
};


/*
 * getting Echo Nest track data of an artist
**/
var getArtistTracks = function (spotifyUri, index) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 100,
    start: index,
    bucket: ['audio_summary', 'id:spotify', 'tracks'],
    artist_id: spotifyUri,
    sort: 'song_hotttnesss-desc'
  });

  return request.get({
      url: 'http://developer.echonest.com/api/v4/song/search?' + query,
  })
  .then(function (body) {
    var songs = JSON.parse(body).response.songs;
    // some songs do not have tracks,
    songs = _.filter(songs, function(song) {
      return song.tracks[0] !== undefined;
    });

    if (songs === undefined) {
      return [];
    }
    return songs;
  })
  .catch(function (err) {
    if (err.statusCode === 429) {
      throw new TooManyRequestsError();
    }
    throw err;
  });
};

/*
 * getting total number of Echo Nest songs of an artist
**/
var getArtistTotal = function (spotifyUri) {
  var query = queryString.stringify({
    api_key: config.ECHONEST_API_KEY,
    format: "json",
    results: 1,
    start: 0,
    id: spotifyUri
  });

  return request.get({
    url: 'http://developer.echonest.com/api/v4/artist/songs?' + query,
  })
  .then(function (body) {
    console.log('NO ERROR',body);
    return JSON.parse(body).response.total;
  })
  .catch(function (err) {
    console.log('ERORRRRRRR!!!!!!!!!!!!!!!',err);
    if (err.statusCode === 429) {
      throw new TooManyRequestsError();
    }
    throw err;
  });
};

module.exports = {
  getTrackData: getTrackData,
  getArtistTracks: getArtistTracks,
  getArtistTotal: getArtistTotal,
  TooManyRequestsError: TooManyRequestsError
};
