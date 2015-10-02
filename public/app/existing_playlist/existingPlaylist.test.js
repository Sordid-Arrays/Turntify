
describe('existingPlaylistDirective', function(){
  var $scope, $q, $compile, container, mockPlaylist;

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
    module('directiveTemplates');

    inject(function(_$rootScope_, _$compile_, _$q_){

      // The injector unwraps the underscores (_) from around the parameter names when matching
      $scope = _$rootScope_.$new();
      $q = _$q_;
      $compile = _$compile_;

      $scope.mockPlaylist = {'name':'hip hop party','playlistId':'21eoa7xkMxlfjluPVlublp'};

      container = angular.element('<existing-playlist playlist="mockPlaylist"></existing-playlist>');

      $compile(container)($scope);
      $scope.$digest();
    });
  });


  it('should contain an md-checkbox element', function(){
    var checkbox = container.find('md-checkbox');
    expect(checkbox[0]).to.exist;
      console.log('from existing playlist ', container);
  });

  it('should print the playlist name', function(){
    var playlistName = container.find('span').html();
    expect(playlistName).to.have.string('hip hop party');
  });


});
