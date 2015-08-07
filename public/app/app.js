/**
* This is where the main app module will be instantiated. It will require all the other
* modules (act as a namespace), handle routing with ui-router, and handle cookies (possibly). If the app gets too
* bloated, the router could be moved to its own file
*/

angular.module('turntify', [
  'turntify.services',
  'turntify.signin',
  'turntify.player',
  'turntify.modifyPlaylist',
  'ui.router'
])

/**
* The config block gets executed first, and manages state
*/

.config(function($stateProvider, $urlRouterProvider) {
  //the $urlRouterProvider is the "otherwise" state
  //TODO: make proper variable urls to fit our get requests
  //TODO: add states and substates down the line
  $urlRouterProvider.otherwise('/signin');
  $stateProvider
  .state('signin', {
    url: '/signin',
    templateUrl: './app/signin/signin.html',
    controller: 'SigninController as signin'
  })
  //this state contains the queue and player logic, so a persistent sidebar of music
  //will be present as the user navigates between subviews like settings, party managers,
  //and anything we extend down the line
  .state('player', {
    url: '/player',
    templateUrl: './app/player/player.html',
    controller: "PlayerController as player"
  })
  // This view is nested within the player view, and contains the turntometer
  // and the playlist selector
  .state('player.modifyPlaylist', {
    url: '/modifyPlaylist',
    templateUrl: './app/modifyPlaylist/modifyPlaylist.html',
    controller: 'ModifyPlaylistController as modifyPlaylist'
  });

})
/** ...and the run block gets executed after, which contains any code that is needed to "kick start" the application
*(which is usually stored in a separate module, like services, because it is hard to unit-test)
*/
.run(function()/*<-- we'll inject instances as needed here */ {
});
