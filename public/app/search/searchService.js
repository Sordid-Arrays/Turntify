angular.module('turntify.search')
.factory('SearchService', function(RequestService) {
  var candidates = {};

  var checkCash = function (input) {
    if (candidates[input]) {
      console.log('CASH');
      return candidates[input];
    }
    return false;
  };
  var autoComplete = function (input) {
    var searchWords = input.trim().split(/\s+/);
    var qs = searchWords.reduce(function (memo, word) {
      return memo + 'song=' + word + '&';
    },'');
    qs = qs.slice(0, qs.length - 1);
    return RequestService.searchTracks(qs)
    .then(function (tracks) {
      var results = tracks.map(function (track) {
        return track.songName + ' / '+ track.artist + ' ('+ track.album + ')\n';
      });
      candidates[input] = results;
      return results;
    });
  };

  var searchTracks = function (input) {
    var searchWords = input.trim().split(/\s*/);
    return RequestService.searchTracks(searchWords);
  };

  return {
    checkCash: checkCash,
    autoComplete: autoComplete,
    searchTracks: searchTracks
  };
});
