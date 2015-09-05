//player.test.js
describe('PlayerController', function(){
  
  /**
  * Any "beforeEach" blocks go in the following function:
  */ 
  beforeEach( function() {
    module('turntify.player');
    inject(function(_$rootScope_, _$controller_, _$q_){
      $q = _$q_;

      /**
      * Mock the player service
      */ 
      PlayerServiceMock = {
        playlistCounter : 0,

        getQueue: function(){
          return $q(function(resolve, reject){
            resolve();
          });
        },

        getListOfPlaylists: sinon.spy(function(){
          return $q(function(resolve, reject){
            resolve();
          });
        }),

        toggleCheck: sinon.spy(function(){
          $scope.$broadcast('playlistCollectionUpdated');
        }),

        playlists: [{"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"},{"name":"Minimal // Deep House","playlistId":"2POsysj8dTuOCAMPYVsgeO"},{"name":"Sample","playlistId":"5zA1FfniCXXT2e7gLu8igS"},{"name":"Soul Classics","playlistId":"3q9TPV3tR3sW30ChwNUInG"},{"name":"soul/funk/jazz/afro/latin/60's psychedelia","playlistId":"6iwuMjD6RPaFG0vBENgYaK"},{"name":"Electro Swing","playlistId":"0ZdkjCY51DTu7wjrcReIIl"},{"name":"Neo Disco","playlistId":"0jXuFjs93Tavfsy19s1lk6"},{"name":"Soulfunkisticated","playlistId":"7vKhVBM3kMcuPjtwrHZB8Q"},{"name":"Neo-Disco","playlistId":"3qOoxtnh8AHJV7jQODk9PJ"},{"name":"Gammal Hederlig Reggae","playlistId":"1mxFzXQr7S892OeO4ttz47"},{"name":"All Reggae until 2015 from Roots to Dancehall","playlistId":"3dhsw3G11F9nVbPU72lQiA"},{"name":"Liked from Radio","playlistId":"4MpZz1jhAoV6BSHr1m7i3M"},{"name":"October 1st Show","playlistId":"67nnPuurEMPR6AX1b5MoiB"},{"name":"Starred in Moodsnap","playlistId":"6pjbGz7ryFBRthokhUmQzw"}],    
        queue: [{"title":"Keep Your Head to the Sky","artist_name":"Earth, Wind & Fire","artist_foreign_ids":[{"catalog":"spotify","foreign_id":"spotify:artist:4QQgXkCYTt3BlENzhyNETg"}],"tracks":[{"foreign_release_id":"spotify:album:01c1PLpIdfwy47yid7GqKB","catalog":"spotify","foreign_id":"spotify:track:0iPy1MWCrOT7SjGs14zSSv","id":"TRCIBOE144D0ADEB29"}],"artist_id":"ARVWJM61187B9B7715","id":"SOAZNOA1313438665C","audio_summary":{"key":9,"analysis_url":"http://echonest-analysis.s3.amazonaws.com/TR/kiHWSQRhZwSNtKpG1BE9CrZYA0_ER-…DFEY23UEVW42BQ&Expires=1439403480&Signature=EOpd7FDATQCKabzqS7wTXykcygk%3D","energy":0.523181,"liveness":0.649613,"tempo":177.917,"speechiness":0.047888,"acousticness":0.22946,"instrumentalness":0,"mode":0,"time_signature":4,"duration":309.57333,"loudness":-8.794,"audio_md5":"","valence":0.543813,"danceability":0.349687}}] 
      };
      
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $scope = _$rootScope_.$new();
      $controller = _$controller_;
      PlayerController = $controller('PlayerController', { $scope: $scope, PlayerService: PlayerServiceMock });
   });
  });




  // describe('getPlaylist', function(){
   
  //   it('should be a function', function(){
  //     expect(PlayerController.getPlaylist).to.be.a('function');
  //   });

  //   it('should update the queue', function(){
  //     PlayerController.selectedPlaylist = '{"name":"Sample","playlistId":"5zA1FfniCXXT2e7gLu8igS"}';
  //     // promisify PlayerController.updateQueue instead of using setTimeout
  //     (function(){
  //       return $q(function(resolve, reject){
  //         resolve(PlayerController.updateQueue());
  //       });
  //     })().then(function(){
  //       // console.log('player controller queue:',PlayerController.queue);
  //       return PlayerController.queue;
  //     }).should.eventually.equal(PlayerServiceMock.queue);
  //     // Whenever creating Promises in a test, 
  //     // you must trigger a digest cycle in order for that promise to be resolved
  //     $scope.$digest();

  //   });

    // Maybe test inputs are passed to PlayerService.updateQueue


  // });

  describe('init', function(){

    it('should call PlayerService.getListOfPlaylists', function(){
      
      expect(PlayerServiceMock.getListOfPlaylists.calledOnce).to.equal(true);
      // expect(PlayerController.updateQueue).to.be.a('function');
    });

    it('should update the list of playlists', function(){
      // promisify PlayerController.updateQueue instead of using setTimeout
      (function(){
        return $q(function(resolve, reject){
          resolve(PlayerController.init());
        });
      })().then(function(){
        // console.log('player controller playlists:',PlayerController.playlists);
        return PlayerController.playlists;
      }).should.eventually.equal(PlayerServiceMock.playlists);
      $scope.$digest();
    });

    it('should set initial playlist-counter value', function(){
      expect(PlayerController.playlistCounter).to.equal(0);
    });

  });

  describe('toggleCheck', function(){
    it('should call PlayerService.toggleCheck', function(){
      PlayerController.toggleCheck({"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"}, true);
      expect(PlayerServiceMock.toggleCheck.calledOnce).to.equal(true);
    });

    // updates playlistCounter after hearing broadcasted event from PlayerService
    it('should update playlistCounter', function(){
      PlayerServiceMock.playlistCounter++;
      PlayerController.toggleCheck({"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"}, true);
      expect(PlayerController.playlistCounter).to.equal(1);
    });

  });


});

describe('PlayerService', function(){

  // TODO: Mock PlayerService's dependencies

  describe('getListOfPlaylists', function(){

  });


});

