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

module.exports = {
  generateRandomString: generateRandomString,
  saveToken: saveToken,
  danceableFiltering: danceableFiltering,
  getTurntness: getTurntness
};
