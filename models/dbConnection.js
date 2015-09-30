var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
var uriUtil = require('mongodb-uri');
if(process.env.PORT){
  var config = {
    MONGOLAB_USER_ID: process.env.MONGOLAB_USER_ID,
    MONGOLAB_PASSWORD: process.env.MONGOLAB_PASSWORD
  };
}else{
  var config = require('../config.js');
}

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
                db: {native_parser: true},
                user: config.MONGOLAB_USER_ID,
                pass: config.MONGOLAB_PASSWORD };

if(process.env.PORT){
  var mongodbUri = process.env.MONGOLAB_URI;
}else{
  var mongodbUri = 'mongodb://ds031213.mongolab.com:31213/turntify';
}

mongoose.connect(mongodbUri, options);


module.exports = mongoose;
