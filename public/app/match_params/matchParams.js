/**
* MatchParams refers to the paramates we will use on existing playlists to filter
* the matches we want to the match view. Right now, only the soon-to-be-deprecated "turntness" is used.
*/
angular.module('turntify.player')
  .controller('MatchParamsController', function(PlayerService){
  
  /**
  * Uses PlayerService to alert the sibling "matches" view to update. Called
  * whenever sliders move.
  */
  var vm = this;
  vm.updateMatches = function(){
    console.log("selectedTurntness: ", vm.selectedTurntness);
    PlayerService.updateTurntness(vm.selectedTurntness);
  };
  vm.loadAllMatches = function(){
    console.log("selectedTurntness: ", vm.selectedTurntness);
    PlayerService.loadAllMatches();
  };
  vm.destroyExtras = function(){
    console.log("removing extra list elements!");
    PlayerService.destroyExtras();
  }
});
  