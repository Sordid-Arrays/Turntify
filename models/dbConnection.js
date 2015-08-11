var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
mongoose.connect('mongodb://localhost/turntify');

module.exports = mongoose;