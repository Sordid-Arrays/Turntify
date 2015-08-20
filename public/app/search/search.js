// //your controller code here
angular.module('turntify.search', [])
.controller('SearchController', function(SearchService, PlayerService){
  /**
  * 'vm' is short for 'view-model': it is used to designate context within the controller.
  */
  var vm = this;

  vm.autoComplete = function (input) {
    var cash = SearchService.checkCache(input);
    if (cash) {
      vm.candidates =cash;
      return;
    }
    SearchService.autoComplete(input)
    .then(function (res) {
      if (vm.userInput === input){
        vm.candidates = res;
      }
    });
  };

  // vm.searchTracks = function (input) {
  //   SearchService.searchTracks(input)
  //   .then(function (res) {
  //     // TODO pass results to Matches
  //   });
  // };
  // vm.init();

  vm.addSong = function(song) {
    console.log("song: ", song);
    PlayerService.addFromSearch(song);
  };


});
/**
* this module intantiates the "player" module, and holds the controller for the player and queue.
* these views will persist across many states of the app, so those states will be subviews of the player
*/


/**
* TODO: refactor into multiple controllers
*/
