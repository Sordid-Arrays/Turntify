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
* get Turntness for each song that will be returned to frot end and save to db
*/
var getTurntness = function (song) {
  var BREAK_POINTS = [
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
  for ( var i = 0; i < BREAK_POINTS.length - 1; i++) {
    var danceability = (song.audio_summary.danceability + song.audio_summary.energy) / 2;
    if (BREAK_POINTS[i] <= danceability && BREAK_POINTS[i + 1] >= danceability) {
      return i;
    }
  }
};

/**
* add turntness property and sort songs by turntness
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

/**
* eliminate duplicated songs
*/
var solveDuplication = function (playlistItems) {
  return _.filter(playlistItems, function (playlistItem, i) {
    for (var j = i + 1; j < playlistItems.length; j++) {
      if (playlistItems[j].track.uri === playlistItem.track.uri) {
        return false;
      }
    }
    return true;
  });
};

module.exports = {
  generateRandomString: generateRandomString,
  saveToken: saveToken,
  getTurntness: getTurntness,
  sortByTurntness: sortByTurntness,
  solveDuplication: solveDuplication
};
