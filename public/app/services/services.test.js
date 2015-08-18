/**
* These test the Request helper functions, based on a backend mock.
* TODO: write integration tests, update tests as app changes
*/
describe('RequestService', function () {
  var RequestService,
      httpBackend;
  beforeEach(function (){  
    module('turntify.services');
    
    // get your RequestService, also get $httpBackend
    // $httpBackend will be a mock, thanks to angular-mocks.js
    inject(function($httpBackend, _RequestService_) {
      RequestService = _RequestService_;      
      httpBackend = $httpBackend;

      //Mock of the httpBackend:
      //This is what our fake backend will return when prodded.
      //"dummy playlists" is a huge friggin file so it's at the bottom of the page
      httpBackend.when("GET", "user/playlists").respond(dummyPlaylists);
      httpBackend.when("GET", "dummyyolo/").respond({excited: true});
    });
  });
  
  // make sure no expectations were missed in your tests.
  // (e.g. expectGET or expectPOST)
  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

/**
* This tests the basic funcitonality of "getListOfPlaylists."
*/
  describe('getListOfPlaylists', function(){
    it('should have a function called getListOfPlaylists', function (){
      expect(RequestService.getListOfPlaylists).to.be.a('function');
    });
    it('should get playlist data and return it', function (){
      // set up some data for the http call to return and test later.
      var result;
      var returnData = dummyPlaylists;
      
      // expectGET to make sure this is called once.
      httpBackend.expectGET('user/playlists');
      
      // make the call.
      RequestService.getListOfPlaylists().then(function(response) {
        result = response;
      });
      
      // flush the backend to "execute" the request to do the expectedGET assertion.
      httpBackend.flush();
      
      // check the result. 
      // (after Angular 1.2.5: be sure to use `toEqual` and not `toBe`
      // as the object will be a copy and not the same instance.)
      expect(result.length).to.equal(returnData.length);
      expect(result[0].name).to.equal(returnData[0].name);
    });
    it('should return the artists "name", "playlistId", and "ownerId"', function (){
      // set up some data for the http call to return and test later.
      var result;
      var returnData = dummyPlaylists;
      
      // expectGET to make sure this is called once.
      httpBackend.expectGET('user/playlists');
      
      // make the call.
      RequestService.getListOfPlaylists().then(function(response) {
        result = response;
      });
      
      // flush the backend to "execute" the request to do the expectedGET assertion.
      httpBackend.flush();
      
      //Iterate through the expected returnData, to make sure the properties align with our expectations
      for(var i=0; i<returnData.length; i++){
        expect(result[i]).to.have.property("name");
        expect(result[i].name).to.equal(returnData[i].name);
        expect(result[i]).to.have.property("playlistId");
        expect(result[i].playlistId).to.equal(returnData[i].playlistId);
        expect(result[i]).to.have.property("ownerId");
        expect(result[i].ownerId).to.equal(returnData[i].ownerId);
      }
    });  

  });

/**
* Dummy test to test, well, testing.
* Might be useful for development, but will be deleted at the end
*/
  describe('dummyTest', function(){
    it('should have a function called dummyTest', function (){
      expect(RequestService.dummyTest).to.be.a('function');
    });
    it('should return a response', function (){
      
      // set up some data for the http call to return and test later.
      var result;
      var returnData = { excited: true };
      
      // expectGET to make sure this is called once.
      httpBackend.expectGET('dummyyolo/');
      
      // make the call.
      RequestService.dummyTest().then(function(response) {
        result = response;
      });
      
      // flush the backend to "execute" the request to do the expectedGET assertion.
      httpBackend.flush();
      expect(result).to.deep.equal(returnData);
    });  
  });

/**
* Dummy Data: store at the bottom for now.
* TODO: move all dummy data to a separate file
*/
  var dummyPlaylists =
    [
      {
        "name": "BALLMER PEAK LIKE A FREAK hype coding 2015",
        "playlistId": "4j3cNTtEelbAkXuwUy3Tzo",
        "ownerId": "1214690507",
        "$$hashKey": "object:9"
      },
      {
        "name": "soulja boy or gtfo",
        "playlistId": "4uOIUTq5QHPA9MFIneL7TW",
        "ownerId": "1214690507",
        "$$hashKey": "object:10"
      },
      {
        "name": "gucci",
        "playlistId": "1evbS3CltEG3NWeHd4qcac",
        "ownerId": "1214690507",
        "$$hashKey": "object:11"
      },
      {
        "name": "JUICY J AND 2CHAINZ",
        "playlistId": "245yXpJVpc58Kh1rzllcz3",
        "ownerId": "1214690507",
        "$$hashKey": "object:12"
      },
      {
        "name": "big boi bass",
        "playlistId": "23TAiNADjTVxkYzuiQCk51",
        "ownerId": "1214690507",
        "$$hashKey": "object:14"
      },
      {
        "name": "2000's indie dance",
        "playlistId": "2HtNjI4oOVDe7q44SioV1r",
        "ownerId": "1214690507",
        "$$hashKey": "object:15"
      },
      {
        "name": "Night cruisin",
        "playlistId": "5HOK6pYMo0d6AcRDt92E8x",
        "ownerId": "1214690507",
        "$$hashKey": "object:16"
      },
      {
        "name": "Nautical sh*t",
        "playlistId": "17oDiLGFgrCQ4oEG84JR6S",
        "ownerId": "1214690507",
        "$$hashKey": "object:18"
      },
      {
        "name": "book clubbin'",
        "playlistId": "7yYauKDMyfKZWwgw0p5zwY",
        "ownerId": "1214690507",
        "$$hashKey": "object:19"
      },
      {
        "name": "Pink Floyd - Animals [2011 - Remaster] (2011 Remastered Version)",
        "playlistId": "5kZIw34r3GYyKfhAYdb61A",
        "ownerId": "1214690507",
        "$$hashKey": "object:21"
      },
      {
        "name": "Ace of Bananarama",
        "playlistId": "7MToKgpmkpOlI96I9N8Cxz",
        "ownerId": "1214690507",
        "$$hashKey": "object:22"
      }
    ];
});




