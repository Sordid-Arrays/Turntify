/**
* This is where the main app module will be instantiated. It will require all the other
* modules (act as a namespace), handle routing with ui-router, and handle cookies (possibly). If the app gets too
* bloated, the router could be moved to its own file
*/

angular.module('turntify', [
  'turntify.services',
  'turntify.login',
  'turntify.player',
  'turntify.main',
  'turntify.search',
  'ui.router',
  'ngCookies',
  'ngMaterial'
])

/**
* The config block gets executed first, and manages state
*/

.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
  
  //TODO: fix flashing url bar
  $urlRouterProvider.otherwise('/player');  

  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: './app/login/login.html',
    controller: 'LoginController as login',
    data: {isRestricted: false}
  })
  
  /**
  * The "player" state is a single state that contains many views with many controllers.
  * The ui-views are thus given aliases so that we can fit multiple views in a single state.
  */
  .state('player', {
    url: '/player',
    data: {isRestricted: true},
    views: {
      "": {
        templateUrl: './app/player/player.html',
        controller: "PlayerController as player"
      },
      "search@player": {
        templateUrl: './app/search/search.html',
        controller: 'SearchController as search'
      },
      "customPlaylist@player": {
        templateUrl: './app/custom_playlist/customPlaylist.html',
        controller: 'CustomPlaylistController as customPlaylist'
      },
      "matchParams@player": {
        templateUrl: './app/match_params/matchParams.html',
        controller: 'MatchParamsController as matchParams'
      }
    }
  });

  $mdThemingProvider.theme('default')
    .dark();

})
/** ...and the run block gets executed after, which contains any code that is needed to "kick start" the application
*(which is usually stored in a separate module, like services, because it is hard to unit-test)
*/
.run(function($state, $rootScope, $timeout, UserService) {

  /**
  * This checks to see if the requested state is tagged with "restricted":
  * If so, the user is redirected to login.
  */
  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
    if(toState.name === 'login'){
      return;
    }
    if(toState.data.isRestricted){
      var cookies = UserService.getUserCookies();
      if(cookies.sessionId === undefined){
        e.preventDefault();
        $state.go('login');

        return;
      }
    }
  });
});

