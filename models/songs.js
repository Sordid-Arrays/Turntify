var mongoose = require('./dbConnection.js');

var Schema = mongoose.Schema;

// create a schema
var songSchema = new Schema({
  audio_summary : {
    danceability: { type: Number, required: false },
    duration: { type: Number, required: false },
    energy: { type: Number, required: false }
  },
  id: { type: String, required: true },
  tracks: { type: Array, required: false},
  // tracks: {
  //   id: { type: String, required: true },
  //   album_name: { type: String, required: false },
  //   foreign_id: { type: String, required: true }
  // },
  artist_name: { type: String, required: false },
  title: {type: String, required: false}
});

var Song = mongoose.model('Song', songSchema);

module.exports = Song;
