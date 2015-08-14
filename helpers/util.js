/**
* util func return random string
*/
var _ = require('underscore');

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
  // var danceabilityRange = {
  //   1: {lowLimit: 0, highLimit: 0.365},
  //   2: {lowLimit: 0.365, highLimit: 0.5},
  //   3: {lowLimit: 0.5, highLimit: 0.635},
  //   4: {lowLimit: 0.635, highLimit: 1}
  // };
  turntness = Number(turntness);
  var breakPoints = [
    0,
    0.206,
    0.286,
    0.342,
    0.387,
    0.427,
    0.464,
    0.5,
    0.536,
    0.573,
    0.613,
    0.658,
    0.713,
    0.793,
    1
  ];
  var lowLimit = breakPoints[turntness -1];
  var highLimit = breakPoints[turntness +2];

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

module.exports = {
  generateRandomString: generateRandomString,
  saveToken: saveToken,
  danceableFiltering: danceableFiltering
};
