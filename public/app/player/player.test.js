//player.test.js

beforeEach(module('turntify'));
beforeEach(module('turntify.player'));

beforeEach(inject(function(_$rootScope_, _$controller_){
  // The injector unwraps the underscores (_) from around the parameter names when matching
  $scope = _$rootScope_.$new();
  $controller = _$controller_;
  PlayerController = $controller('PlayerController', { $scope: $scope });

  PlayerController = [];
}));



describe('PlayerController', function(){

  describe('updateQueue', function(){
   
    it('should be a function', function(){
      expect(PlayerController.updateQueue).to.be.a('function');
    });

    it('should update the queue', function(){
      expect(PlayerController.updateQueue).to.be.a('function');
    });

  });

  // describe('generateWidget', function(){

  //   it('should be a function', function(){
  //     expect(PlayerController.generateWidget).to.be.a('function');
  //   });

  // });

  describe('turntLevels', function(){

    it('should be an array', function(){
      expect(PlayerController.turntLevels).to.be.an('array');
    });

  });

  // describe('queue', function(){

  //   it('should be an array', function(){
  //     expect(PlayerController.queue).to.be.an('array');
  //   });

  // });

});

describe('PlayerService', function(){

});

