angular.module('turntify.player')
  .controller('MatchesController', function(PlayerService, $scope, turntToFilter){
  var vm = this;
  vm.matches = [];

  vm.addSong = function(song){
    PlayerService.addMatches([song]);
  };
  vm.addAllMatches = function(){
    PlayerService.addMatches(vm.matches);
  };

  $scope.$on('matchesUpdated', function(event, turntness){
    console.log("heard event in matchesController!");
    console.log("turntness passed: ", turntness);
    vm.matches = turntToFilter(PlayerService.playlist, turntness);
  });
});
