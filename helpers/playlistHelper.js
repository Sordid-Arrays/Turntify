var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');

function getTracks(userId, playlistId, accessToken, refreshToken, turntness, tracks, index) {
  tracks = tracks || [];
  index = index || 0;
  var totalTracks = 0;

  // getPlaylist tracks from spotify API
  return spotify.getPlaylistTracks(userId, playlistId, accessToken, index)
  .catch(spotify.OldTokenError, function () {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(refreshToken)
    .then(function (body) {
      accessToken = body.access_token;
      refreshToken = body.refresh_token;
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getPlaylistTracks(userId, playlistId, body.access_token);
    });
  })

  // get track data from echonest
  .then(function(playlist) {
    totalTracks = playlist.total;
    var songUris = playlist.items.map(function(item) {
      return item.track.uri;
    });
    console.log('URIs: ', songUris);
    return echonest.getTrackData(songUris);
  })

  // finter by danceability
  .then(function(songs) {
    tracks = tracks.concat(util.danceableFiltering(songs, turntness));

    // if number of tracks is less than 10 and total tracks is greater than 100,
    // recurse getTracks
    if (tracks.length < 10 && totalTracks > index + 100) {
      return getTracks(userId, playlistId, accessToken, refreshToken, turntness, tracks, index+100);
    }
    return tracks;
  });
}

module.exports = {
  getTracks: getTracks
};
