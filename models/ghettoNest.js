var mongoose = require('./dbConnection.js');

var Schema = mongoose.Schema;

// create a schema
var ghettoNestSchema = new Schema({
  spotify_id: { type: String, required: true},
  echonest_id: { type: String, required: true},
  artist_name: { type: String, required: false},
  title: { type: String, required: false},
  danceability: { type: Number, required: false},
  energy: { type: Number, required: false},
  duration: { type: Number, required: false},
  album_name: { type: String, required: false}
  }
);

// the schema is useless so far
// we need to create a model using it
var ghettoNest = mongoose.model('ghettoNest', ghettoNestSchema);

// make this available to our users in our Node applications
module.exports = ghettoNest;
