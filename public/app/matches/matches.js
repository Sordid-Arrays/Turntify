/**
* Holds the matches, and handles filtering of the matches based on the matchParams. "Matches"
* are not considered business logic, and not stored outside of this View-Model.
*/
angular.module('turntify.player')
  .controller('MatchesController', function(PlayerService, $scope, turntToFilter){
  var vm = this;
  vm.matches = [];
  
  /**
  * Both of these functions call the same function in player service. TODO: refactor in to single function.
  */
  vm.addSong = function(song){
    PlayerService.addMatches([song]);
  };
  vm.addAllMatches = function(){
    PlayerService.addMatches(vm.matches);
  };
  $scope.$on('matchesUpdated', function(event, turntness){
    vm.matches = turntToFilter(PlayerService.playlist, turntness);
  });
});
