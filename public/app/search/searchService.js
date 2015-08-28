angular.module('turntify.search')
.factory('SearchService', function(RequestService) {
  var cache = {};

  var checkCache = function (input) {
    input = input.trim();
    if (input.length === 0) {
      return [];
    }
    if (cache[input]) {
      return cache[input];
    }
    return false;
  };

  var autoComplete = function (input, callback) {
    var timeoutId = '';
    // wait until the user finish typing
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      var searchWords = input.split(/\s+/);
      var qs = searchWords.reduce(function (memo, word) {
        return memo + 'artist=' + word + '&';
      },'');
      qs = qs.slice(0, qs.length - 1);
      // return RequestService.searchTracks(qs)
      return RequestService.searchArtists(qs)
      .then(function (res) {
        cache[input] = res;
        callback(res);
      });
    }, 300);
  };

  var searchTracks = function (input) {
    var searchWords = input.trim().split(/\s*/);
    return RequestService.searchTracks(searchWords);
  };

  var getArtistSongs = function (artist) {
    return RequestService.getArtistSongs(artist.artist_uri);
  };

  return {
    checkCache: checkCache,
    autoComplete: autoComplete,
    searchTracks: searchTracks,
    getArtistSongs: getArtistSongs
  };
});
