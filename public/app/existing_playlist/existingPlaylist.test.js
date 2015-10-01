beforeEach( function() {
  module('turntify.player', function($provide){
    /**
    * Mock the player service
    */ 
    $provide.factory('PlayerService', function(){
      return {

        toggleCheck: sinon.spy(function(){
          console.log('mock playerservice togglecheck works!!!!');
          $scope.$broadcast('playlistCollectionUpdated');
        }),

        };
    });
  });

  // load the templates
  module('app/existing_playlist/existingPlaylist.html');

  inject(function(_$rootScope_, _$compile_, _$q_){


    // The injector unwraps the underscores (_) from around the parameter names when matching
    var $scope = _$rootScope_.$new();
    var $q = _$q_;
    var $compile = _$compile_;

    var container = angular.element('<existing-playlist playlist="{"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"}"></existing-playlist>');

    $compile(container)($scope);
    $scope.$digest();
  });
});