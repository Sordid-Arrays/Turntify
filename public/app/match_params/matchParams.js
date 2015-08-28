/**
* MatchParams refers to the paramates we will use on existing playlists to filter
* the matches we want to the match view. Right now, only the soon-to-be-deprecated "turntness" is used.
*/
angular.module('turntify.player')
.directive('matchParams', function(PlayerService){
  var controller = function(){
    /**
    * Uses PlayerService to alert the sibling "matches" view to update. Called
    * whenever sliders move.
    */
    var vm = this;

    vm.selectedTurntness = 1;

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
    };

  };

  return {
    restrict: 'EA', //Default for 1.3+
    scope: {},
    controller: controller,
    controllerAs: 'matchParams',
    bindToController: true, //required in 1.3+ with controllerAs
    templateUrl: '/app/match_params/matchParams.html'
  };
  
});
