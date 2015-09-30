
angular.module('turntify.player')
.directive('existingPlaylist', function(){
  var controller = function(PlayerService){
    var vm = this;
    vm.toggleCheck = function(playlist, checked){
      console.log('playlist: ', playlist);
      PlayerService.toggleCheck(playlist, checked);
    };
  };

  return {
    restrict: 'EA',
    templateUrl: '/app/existing_playlist/existingPlaylist.html',
    scope: {
      playlist: '='
    },
    controller: controller,
    controllerAs: 'existingPlaylist',
    bindToController: true
  };

})