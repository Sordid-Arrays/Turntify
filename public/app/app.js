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
  'ui.router',
  'ngCookies',
  'ngMaterial'
])

/**
* The config block gets executed first, and manages state
*/

.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
  //the $urlRouterProvider is the "otherwise" state
  //TODO: make proper variable urls to fit our get requests
  //TODO: add states and substates down the line
  
  //normalizes urls to be lowercase
  $urlRouterProvider.otherwise('/player');
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: './app/login/login.html',
    controller: 'LoginController as login',
    data: {isRestricted: false}
  })
  //this state contains the queue and player logic, so a persistent sidebar of music
  //will be present as the user navigates between subviews like settings, party managers,
  //and anything we extend down the line
  .state('player', {
    url: '/player',
    templateUrl: './app/player/player.html',
    controller: "PlayerController as player",
    data: {isRestricted: true}
  });

  // $mdThemingProvider.theme('default')
  //   .dark();

})
/** ...and the run block gets executed after, which contains any code that is needed to "kick start" the application
*(which is usually stored in a separate module, like services, because it is hard to unit-test)
*/
.run(function($state, $rootScope, $timeout, UserService) {
  //TODO: use this to check scope from view
  // $rootScope.$state = $state;

  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
    if(toState.name === 'login'){
      return;
    }
    if(toState.data.isRestricted){
      var cookies = UserService.getUserCookies();
      //TODO: check other, less reliable cookies. might have different exp.
      if(cookies.sessionId === undefined){
        e.preventDefault();
        $state.go('login');

        return;
      }
    }
  });
});
