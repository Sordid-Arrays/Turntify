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

        // this func was moved to the existing-playlist directive
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


  // TOGGLE CHECK WAS MOVED TO THE EXISTING-PLAYLIST DIRECTIVE
  // TODO: CREATE TESTS FOR THIS FUNCTION ALONG WITH THE REST OF THE DIRECTIVE

  // describe('toggleCheck', function(){
  //   it('should call PlayerService.toggleCheck', function(){
  //     PlayerController.toggleCheck({"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"}, true);
  //     expect(PlayerServiceMock.toggleCheck.calledOnce).to.equal(true);
  //   });

  //   // updates playlistCounter after hearing broadcasted event from PlayerService
  //   it('should update playlistCounter', function(){
  //     PlayerServiceMock.playlistCounter++;
  //     PlayerController.toggleCheck({"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"}, true);
  //     expect(PlayerController.playlistCounter).to.equal(1);
  //   });

  // });


});



describe('PlayerService', function(){

  /**
  * Mock the player service
  */ 
  var PlayerService, RequestServiceMock;
  var mockPlaylist = {name: "Quality hip hop", playlistId: "7JdNQIGJ24DCK3UrAWUGmH", ownerId: "1222311481", $$hashKey: "object:35"};
  var mockPlaylistData = [{"spotify_id":"spotify:track:12xnD0EpwcPZz5hdqrlCfT","echonest_id":"SOLPEYL1315CD40FF7","artist_name":"WC","title":"So Hard","danceability":0.813925,"energy":0.505298,"duration":255.84,"turnt_bucket":11,"turntness":0.6596115},{"spotify_id":"spotify:track:0lZWjBImx6kNe3WtOA09Xu","echonest_id":"SOECJXV136A5B5EB5E","artist_name":"AZ","title":"Sugar Hill","danceability":0.678958,"energy":0.662923,"duration":249.01365,"turnt_bucket":11,"turntness":0.6709404999999999},{"spotify_id":"spotify:track:3ooAjhyOZ1xttGD0iq1GVO","echonest_id":"SOILSAE1312A8A9B88","artist_name":"Tha Dogg Pound","title":"New York, New York","danceability":0.836518,"energy":0.52265,"duration":290.21995,"turnt_bucket":11,"turntness":0.679584},{"spotify_id":"spotify:track:67Kv2jtrEpBkkqbOOsA8Sy","echonest_id":"SONJBOI1315CD489EC","artist_name":"The Beatnuts","title":"Watch Out Now","danceability":0.782387,"energy":0.58421,"duration":173.30667,"turnt_bucket":11,"turntness":0.6832985},{"spotify_id":"spotify:track:7nk7oS0G6qG3ofHUAKbg9F","echonest_id":"SOLWMMP1315CD46F71","artist_name":"EPMD","title":"Da Joint","danceability":0.793005,"energy":0.617311,"duration":208.38612,"turnt_bucket":11,"turntness":0.705158},{"spotify_id":"spotify:track:4E8KUoXGEoxTwqp91lRUqr","echonest_id":"SOCWBHT13F08F7240E","artist_name":"Big Pun","title":"I'm Not A Player","danceability":0.712141,"energy":0.749358,"duration":221.66667,"turnt_bucket":12,"turntness":0.7307494999999999},{"spotify_id":"spotify:track:7aSnPAggMMgElb6BgXeSEw","echonest_id":"SODEKQK131677146C6","artist_name":"Dilated Peoples","title":"Worst Comes To Worst","danceability":0.798164,"energy":0.729994,"duration":215.97288,"turnt_bucket":12,"turntness":0.764079},{"spotify_id":"spotify:track:4bMn7CcwvXFdcrc1gJHpnH","echonest_id":"SOLJFXO135C32A4441","artist_name":"Mos Def","title":"Oh No ((best of decade I version))","danceability":0.69352,"energy":0.856881,"duration":223.14621,"turnt_bucket":12,"turntness":0.7752005},{"spotify_id":"spotify:track:7Fkld0hK0hTrF4Lxdenqbs","echonest_id":"SOAPRBX1312FE01083","artist_name":"Snoop Dogg","title":"Doggfather","danceability":0.713683,"energy":0.83953,"duration":237.0351,"turnt_bucket":12,"turntness":0.7766065},{"spotify_id":"spotify:track:74kHlIr01X459gqsSdNilW","echonest_id":"SOVVYWB144B99CBFB7","artist_name":"2Pac","title":"I Get Around","danceability":0.836533,"energy":0.717533,"duration":258.64,"turnt_bucket":12,"turntness":0.777033},{"spotify_id":"spotify:track:0NzNKU2MJ9LCetT2uZMJH2","echonest_id":"SOOTUBL1312A8AB40D","artist_name":"2Pac","title":"So Many Tears","danceability":0.902971,"energy":0.659325,"duration":239.72054,"turnt_bucket":12,"turntness":0.781148},{"spotify_id":"spotify:track:2ntj6zoYOXfdQDzxo2kHrD","echonest_id":"SOSQTTM13134387715","artist_name":"Big Pun","title":"Still Not A Player","danceability":0.883613,"energy":0.699879,"duration":236.54667,"turnt_bucket":12,"turntness":0.7917460000000001},{"spotify_id":"spotify:track:0Y1wsOHYGbNNNGeYjQJ8BL","echonest_id":"SODULKU1373141AAB3","artist_name":"Mobb Deep","title":"Temperature's Rising","danceability":0.803939,"energy":0.823094,"duration":300.2,"turnt_bucket":13,"turntness":0.8135165},{"spotify_id":"spotify:track:5a251qN4R86hro8UZGuO4E","echonest_id":"SOBKKOE1315CD4248A","artist_name":"WC","title":"The Streets","danceability":0.919616,"energy":0.811024,"duration":227.86667,"turnt_bucket":13,"turntness":0.86532}];
  
  beforeEach( function() {
    module('turntify.player');

    RequestServiceMock = {
      getPlaylist: sinon.spy(function(){
        return $q(function(resolve, reject){
          resolve(mockPlaylistData);
        });
      })
    };

    // control dependencies injected into PlayerService
    module(function($provide) {
      $provide.value("RequestService", RequestServiceMock);
    });

    inject(function(_$rootScope_, _PlayerService_, _$q_){
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $scope = _$rootScope_.$new();
      $q = _$q_;
      PlayerService = _PlayerService_;
   });
  });

  describe('getPlaylist', function(){

    it('should be a function', function(){
      expect(PlayerService.getPlaylist).to.be.a('function');
    });

    it('should call RequestService.getPlaylist', function(){
      PlayerService.getPlaylist(mockPlaylist).then(function(){
        expect(RequestServiceMock.getPlaylist.calledOnce).to.equal(true);
      });
    });

    it('should update the playlist collection', function(){
      PlayerService.getPlaylist(mockPlaylist).then(function(){
        expect(PlayerService.playlistCollection[mockPlaylist.name].songs).to.equal(mockPlaylistData);
      });
    });



  });


});

