//player.test.js
describe('SearchController', function(){
  var $scope, $controller;
  /**
  * Any "beforeEach" blocks go in the following function:
  */
  beforeEach(module('turntify.search'));
  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $location = $injector.get('$location');
    $anchorScroll = $injector.get('$anchorScroll');
    $q = $injector.get('$q');
    var $controller = $injector.get('$controller');
    var cache = {};
    SearchServiceMock = {
      checkCache: sinon.spy(function(input){
        if (cache[input]) {
          return cache[input];
        }
        cache[input] = ['artsit1'];
        return false;
      }),
      autoComplete: sinon.spy(function () {
        return [];
      })
    };
    PlayerServiceMock = {
      addFromSearch: sinon.spy(function(){
        return;
      }),
      playlists: [{"name":"hip hop party","playlistId":"21eoa7xkMxlfjluPVlublp"},{"name":"Minimal // Deep House","playlistId":"2POsysj8dTuOCAMPYVsgeO"},{"name":"Sample","playlistId":"5zA1FfniCXXT2e7gLu8igS"},{"name":"Soul Classics","playlistId":"3q9TPV3tR3sW30ChwNUInG"},{"name":"soul/funk/jazz/afro/latin/60's psychedelia","playlistId":"6iwuMjD6RPaFG0vBENgYaK"},{"name":"Electro Swing","playlistId":"0ZdkjCY51DTu7wjrcReIIl"},{"name":"Neo Disco","playlistId":"0jXuFjs93Tavfsy19s1lk6"},{"name":"Soulfunkisticated","playlistId":"7vKhVBM3kMcuPjtwrHZB8Q"},{"name":"Neo-Disco","playlistId":"3qOoxtnh8AHJV7jQODk9PJ"},{"name":"Gammal Hederlig Reggae","playlistId":"1mxFzXQr7S892OeO4ttz47"},{"name":"All Reggae until 2015 from Roots to Dancehall","playlistId":"3dhsw3G11F9nVbPU72lQiA"},{"name":"Liked from Radio","playlistId":"4MpZz1jhAoV6BSHr1m7i3M"},{"name":"October 1st Show","playlistId":"67nnPuurEMPR6AX1b5MoiB"},{"name":"Starred in Moodsnap","playlistId":"6pjbGz7ryFBRthokhUmQzw"}],
      queue: [{"title":"Keep Your Head to the Sky","artist_name":"Earth, Wind & Fire","artist_foreign_ids":[{"catalog":"spotify","foreign_id":"spotify:artist:4QQgXkCYTt3BlENzhyNETg"}],"tracks":[{"foreign_release_id":"spotify:album:01c1PLpIdfwy47yid7GqKB","catalog":"spotify","foreign_id":"spotify:track:0iPy1MWCrOT7SjGs14zSSv","id":"TRCIBOE144D0ADEB29"}],"artist_id":"ARVWJM61187B9B7715","id":"SOAZNOA1313438665C","audio_summary":{"key":9,"analysis_url":"http://echonest-analysis.s3.amazonaws.com/TR/kiHWSQRhZwSNtKpG1BE9CrZYA0_ER-…DFEY23UEVW42BQ&Expires=1439403480&Signature=EOpd7FDATQCKabzqS7wTXykcygk%3D","energy":0.523181,"liveness":0.649613,"tempo":177.917,"speechiness":0.047888,"acousticness":0.22946,"instrumentalness":0,"mode":0,"time_signature":4,"duration":309.57333,"loudness":-8.794,"audio_md5":"","valence":0.543813,"danceability":0.349687}}]
    };

    // The injector unwraps the underscores (_) from around the parameter names when matching
    SearchController = $controller('SearchController', { SearchService: SearchServiceMock, PlayerService: PlayerServiceMock });
  }));


  describe('autoComplete', function(){

    it('should call SearchService.checkCache', function(){
      SearchController.autoComplete('input');
      expect(SearchServiceMock.checkCache.calledOnce).to.equal(true);
    });
    it('should call SearchService.autoComplete only when the input is not cached', function(){
      SearchController.autoComplete('artist name');
      expect(SearchServiceMock.checkCache.calledOnce).to.equal(true);
      expect(SearchServiceMock.autoComplete.calledOnce).to.equal(true);
      SearchController.autoComplete('artist name');
      expect(SearchServiceMock.checkCache.calledTwice).to.equal(true);
      expect(SearchServiceMock.autoComplete.calledOnce).to.equal(true);
    });

    it('should update the list of candidates', function(){
      // promisify PlayerController.updateQueue instead of using setTimeout

      var oldCandidates = SearchController.candidates;
      $q(function(resolve, reject){
        resolve(SearchController.autoComplete('artist name'));
      })
      .then(function(){
        return SearchController.candidates;
      })
      .should.eventually.not.equal(oldCandidates);
    });
  });

  describe('addSong', function () {
    it('should call PlayerService.addFromSearch', function () {
      SearchController.addSong('artist name');
      expect(PlayerServiceMock.addFromSearch.calledOnce).to.equal(true);
    });
  });


});

xdescribe('SearchService', function(){

  // TODO: Mock PlayerService's dependencies

  describe('getListOfPlaylists', function(){

  });


});
