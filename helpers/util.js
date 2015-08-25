/**
* util func return random string
*/
var _ = require('underscore');
var breakPoints = [
  0,      // 0
  0.206,  // 1
  0.286,  // 2
  0.342,  // 3
  0.387,  // 4
  0.427,  // 5
  0.464,  // 6
  0.5,    // 7
  0.536,  // 8
  0.573,  // 9
  0.613,  //10
  0.658,  //11
  0.713,  //12
  0.793,  //13
  1       //14
];

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
* save new token in session
*/
var saveToken = function (req, newAccessToken, newRefreshToken) {
  req.session.user.access_token = newAccessToken;
  if (newRefreshToken) {
    req.session.user.refresh_token = newRefreshToken;
  }
  req.session.save();
};

/**
* sort and filter the songs according to danceability
*/
var danceableFiltering = function (songs, turntness) {
  turntness = Number(turntness);
  if (turntness < 1) {
    turntness = 1;
  }
  var numBuckets = 4;
  var lowLimit = breakPoints[turntness -1];
  var highLimit = breakPoints[turntness + numBuckets -1];

  return _.chain(songs)
  .filter(function (song) {
    var danceability = (song.audio_summary.danceability + song.audio_summary.energy) /2;
    return danceability >= lowLimit &&
           danceability <= highLimit;
  })
  .sortBy(function (song) {
    return song.audio_summary.danceability;
  })
  .value();
};

/**
* get Turntness for each song that will be returned to frot end and save to db
*/
var getTurntness = function (song) {
  for ( var i = 0; i < breakPoints.length - 1; i++) {
    var danceability = (song.audio_summary.danceability + song.audio_summary.energy) / 2;
    if (breakPoints[i] <= danceability && breakPoints[i + 1] >= danceability) {
      return i;
    }
  }
};

/**
* escape a string for regEx
*/
var escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
* map and sort songs by turntness
*/
var sortByTurntness = function(songs) {
  return _.chain(songs)
  .map(function (song) {
    return {
      spotify_id: song.spotify_id,
      echonest_id: song.echonest_id,
      artist_name: song.artist_name,
      title: song.title,
      danceability: song.danceability,
      energy: song.energy,
      duration: song.duration,
      turnt_bucket: song.turnt_bucket,
      turntness: (song.energy + song.danceability) / 2
    };
  })
  .sortBy('turntness')
  .value();
};

var makeUpGhettonest = function (remainderUris, spotifyDatas) {
  var result = [];
  // match the remainderUris with spotifyDatas
  _.each(spotifyDatas, function (spotifyData) {
    _.each(remainderUris, function (uri) {
      if (uri === spotifyData.track.uri) {
        // make up a Ghettonest Object
        result.push( {
          spotify_id: uri,
          echonest_id: 'unknown',
          artist_name: spotifyData.track.artists[0].name,
          title: spotifyData.track.name,
          danceability: 0,
          energy: 0,
          duration: spotifyData.track.duration_ms / 1000,
          album_name: spotifyData.track.album.name,
          turnt_bucket: util.getTurntness(echonestSong)
        });
      }
    });
  });
};

module.exports = {
  generateRandomString: generateRandomString,
  saveToken: saveToken,
  danceableFiltering: danceableFiltering,
  getTurntness: getTurntness,
  escape: escape,
  sortByTurntness: sortByTurntness
};
