var expect = require('chai').expect;
var assert = require('assert');
var GhettoNest = require('../../models/ghettoNest.js');

beforeEach(function() {
  GhettoNest.remove({spotify_id: '02468'});
});

describe('insert or update GhettoNest table', function() {
  var newGhettoNests =  {
    spotify_id: '02468',
    echonest_id: '13579',
    artist_name: 'artist name',
    title: 'good song title',
    danceability: 0.168,
    energy: 0.168,
    duration: 258.73,
    album_name: 'album name',
    turnt_bucket: 8
  };

  it('should insert GhettoNest if no record found', function (done) {
    GhettoNest.create(newGhettoNests)
    .then(function(){
      GhettoNest.findOne({spotify_id: '02468'})
      .then(function(song) {
        expect(song).to.have.property('echonest_id').to.be.equal('13579');
        done();
      });
    });
  });

  it('should update GhettoNest record if exist', function (done) {
    GhettoNest.update({spotify_id: '02468'}, {artist_name: 'Johny Cash'})
    .then(function() {
      GhettoNest.findOne({spotify_id: '02468'})
      .then(function(song) {
        console.log(song);
        expect(song).to.have.property('artist_name').to.be.equal('Johny Cash');
        done();
      });
    });
  });

});