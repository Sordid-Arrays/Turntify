angular.module('turntify.search')
.factory('SearchService', function(RequestService) {
  var candidates = {};

  var checkCache = function (input) {
    if (candidates[input]) {
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
      candidates[input] = tracks;
      return tracks;
    });
  };

  var searchTracks = function (input) {
    var searchWords = input.trim().split(/\s*/);
    return RequestService.searchTracks(searchWords);
  };

  return {
    checkCache: checkCache,
    autoComplete: autoComplete,
    searchTracks: searchTracks
  };
});
