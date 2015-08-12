var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('./models/dbConnection.js');

//var routes = require('./controllers/index');
var routes = require('./routes/auth.js');
var player = require('./routes/player.js');

var app = express();
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());
app.use(session({
  secret: 'foo',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  // httpOnly is for dev-environment only
  cookie: { httpOnly: false }
}));
app.use('/', routes);
app.use('/', player);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
});

console.log('Listening on 8888');
app.listen(8888);
