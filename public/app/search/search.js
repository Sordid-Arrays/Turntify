/**
* this module intantiates the "search" module, and holds the controller for searching.
*/

angular.module('turntify.search', ['ngMaterial'])
.controller('SearchController', function(SearchService, PlayerService, $location, $anchorScroll){

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

  var scroll = function () {
    // var checkboxContainer = angular.element(document.querySelector("md-content.checkboxWrapper"));
    $location.hash('autoComplete');
    setTimeout(function () {
      // checkboxContainer[0].scrollTop = checkboxContainer[0].scrollHeight;
      $anchorScroll();
    }, 1);
  };

  /**
  * get artists from Spotify API and show them
  */
  vm.autoComplete = function (input) {
    if (vm.candidates[vm.selected]) {
      vm.candidates[vm.selected].backgroundColor = COLORS.default;
    }
    vm.selected = -1;

    var cache = SearchService.checkCache(input);
    if (cache) {
      vm.candidates = cache;
      scroll();
      return;
    }

    SearchService.autoComplete(input, function (res) {
      // do not change candidates if user input has been changed
      if (vm.userInput !== input){
        return;
      }
      vm.candidates = res;
      scroll();
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
  * move cursor up
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
  * move cursor down
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
  * add selected artists' songs to custom playlist
  */
  var enter = function () {
    if (vm.selected < 0) {
      return;
    }
    vm.candidates[vm.selected].backgroundColor = COLORS.default;
    vm.addSong(vm.candidates[vm.selected]);
  };

  // keyCode: action
  var actions = {
    13: enter,
    38: up,
    40: down
  };

  /**
  * keypress event routing
  */
  vm.keypress = function (event) {
    if (vm.candidates.length === 0) {
      return;
    }
    var action = actions[event.keyCode];
    if (action) {
      event.preventDefault();
      action();
    }
  };

});
