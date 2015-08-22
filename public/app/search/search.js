/**
* this module intantiates the "search" module, and holds the controller for searching.
*/

angular.module('turntify.search', ['ngMaterial'])
.controller('SearchController', function(SearchService, PlayerService){

  /**
  * 'vm' is short for 'view-model': it is used to designate context within the controller.
  */
  var vm = this;
  vm.candidates = [];
  vm.selected = -1;

  // const for colors
  var COLORS = {
    selected: 'SteelBlue',
    default: 'inherited'
  };

  /**
  * get artists from Spotify API and show them
  */
  vm.autoComplete = function (input) {
    vm.selected = -1;
    input = input.trim();
    if (input.length === 0) {
      return;
    }
    var cache = SearchService.checkCache(input);
    if (cache) {
      vm.candidates = cache;
      return;
    }
    SearchService.autoComplete(input)
    .then(function (res) {
      // do not change candidates if user input has been changed
      if (vm.userInput === input){
        vm.candidates = res;
      }
    });
  };

  /**
  * add playlist of the artist songs and add songs to customPlaylist
  */
  vm.addSong = function(artist) {
    PlayerService.addFromSearch(artist);
    vm.candidates = [];
    vm.userInput = '';
  };

  /**
  * up key event
  */
  var up = function () {
    if (vm.selected < 1) {
      return;
    }

    vm.candidates[vm.selected].backgroundColor = COLORS.default;
    vm.selected --;
    vm.candidates[vm.selected].backgroundColor = COLORS.selected;
  };

  /**
  * down key event
  */
  var down = function () {
    if (vm.selected >= vm.candidates.length - 1) {
      return;
    }
    if (vm.selected > -1) {
      vm.candidates[vm.selected].backgroundColor = COLORS.default;
    }
    vm.selected ++;
    vm.candidates[vm.selected].backgroundColor = COLORS.selected;
  };

  /**
  * enter key event
  */
  var enter = function () {
    if (vm.selected < 1) {
      return;
    }
    vm.addSong(vm.candidates[vm.selected]);
  };

  // keyCode: event
  var actions = {
    13: enter,
    38: up,
    40: down
  };

  /**
  * keypress event routing
  */
  vm.keypress = function ($event) {
    console.log($event.keyCode);
    if (vm.candidates.length === 0) {
      return;
    }
    var action = actions[$event.keyCode];
    if (action) {
      action();
    }
  };

});
