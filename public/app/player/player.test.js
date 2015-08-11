//player.test.js

describe('PlayerController', function(){

  beforeEach(module('turntify.player'));

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var PlayerController = $controller('PlayerController', { $scope: $scope });

  describe('updatesQueue', function(){

    it('should be a function', function(){

      expect($scope.updatesQueue).to.be.a('function');
    });

  });

});