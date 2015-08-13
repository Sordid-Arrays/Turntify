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
  var danceabilityRange = {
    1: {lowLimit: 0, highLimit: 0.365},
    2: {lowLimit: 0.365, highLimit: 0.5},
    3: {lowLimit: 0.5, highLimit: 0.635},
    4: {lowLimit: 0.635, highLimit: 1}
  };
  return _.chain(songs)
  .filter(function (song) {
    var danceability = song.audio_summary.danceability;
    return danceability >= danceabilityRange[turntness].lowLimit &&
           danceability <= danceabilityRange[turntness].highLimit;
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
