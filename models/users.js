
var mongoose = require('./dbConnection.js');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  spotifyId: { type: String, required: true},
  name: { type: String, required: true},
  songQueu: { type: Array, required: false}
  }
);

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
