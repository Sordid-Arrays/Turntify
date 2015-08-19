angular.module('turntify.player')
  .controller('MatchesController', function(PlayerService, $scope){
  var vm = this;
  vm.saveAllMatches = function(matches){
    console.log("PlayerController: ", this.viewQueue);
    PlayerService.saveMatches(matches);
  };

  $scope.$on('matchesUpdated', function(){
    vm.matches = PlayerService.matches;
    console.log("matches in MController: ", vm.matches);
    console.log("heard event in matchesController!");
  });

  //this will contain logic, such as:
  // 1) function to add all songs to playlist
  // 2) function to add selected to playlist
  // 3) function to add single song to playlist

  //As of right now: still looks for songs in the playerController as a source of truth.
  //Could be refactored
});
