var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');
var _ = require('underscore');
var Songs = require('../models/songs.js');
var GhettoNest = require('../models/ghettoNest.js');

function getTracks(userId, playlistId, accessToken, refreshToken, turntness, tracks, index) {
  tracks = tracks || [];
  index = index || 0;
  var totalTracks = 0;
  var songUris = [];
  var dbSongs = [];

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
    songUris = _.chain(playlist.items)
    .map(function(item) {
      return item.track.uri;
    })
    .filter(function(uri) {
      //this is not to include where foreignkey start with 'spotify:local'
      return uri.indexOf('spotify:track:') === 0;
    })
    .value();

    // return echonest.getTrackData(songUris);
    // first check database for existing song
    return GhettoNest.find({spotify_id: { $in: songUris}});
  }).then(function(songs) {
    dbSongs = songs;
    //check which song does not exist in database
    var dbSongUris = _.map(dbSongs, function(dbSong) {
      return dbSong.spotify_id;
    });
    //songUris will be songs that are not in the database
    songUris = _.filter(songUris, function(songUri) {
      return !_.contains(dbSongUris, songUri);
    });
    //request echonest with songs that are not in our db only if songUris is not blank array
    if (songUris.length > 0) {
      return echonest.getTrackData(songUris);
    }
    return [];
  })

  // finter by danceability
  .then(function(echonestSongs) {
    //tracks = tracks.concat(util.danceableFiltering(songs, turntness));
    // here songs will be song that are return from echonest and not in our db
    if (echonestSongs.length > 0) {
      var newGhettoNest = _.map(echonestSongs, function(echonestSong) {
        return {
          spotify_id: echonestSong.tracks[0].foreign_id,
          echonest_id: echonestSong.id,
          artist_name: echonestSong.artist_name,
          title: echonestSong.title,
          danceability: echonestSong.audio_summary.danceability,
          energy: echonestSong.audio_summary.energy,
          duration: echonestSong.audio_summary.duration,
          album_name: echonestSong.tracks[0].album_name,
          turntness: util.getTurntness(echonestSong)
        };
      });
      // // here will insert to our db[]
      console.log('NEW DATA TURNTNESS: ',newGhettoNest[0].turntness);
      GhettoNest.create(newGhettoNest);
      tracks = tracks.concat(newGhettoNest);
    }
    tracks = tracks.concat(dbSongs);

    // if number of tracks is less than 10 and total tracks is greater than 100,
    // recurse getTracks
    if (totalTracks > index + 100) {
      return getTracks(userId, playlistId, accessToken, refreshToken, turntness, tracks, index+100);
    }
    return tracks;
  });
}

module.exports = {
  getTracks: getTracks
};
