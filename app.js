// ==================================== Express Settings ===========================================//
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// ==================================== Import Socket.io ===========================================//
var SocketIo = require('socket.io');
var socketEvents = require('./socket.js');

// ==================================== Import Database ===========================================//
var redis = require('redis');
var redis_client = require('./redis/redis');
var redis_config = require('./redis/redis_info')().daou_server;
var redisStore = require('connect-redis')(session);
var sub_client = require('./redis/redis');
var pub_client = require('./redis/redis');

var mongoose = require('mongoose');


// ==================================== Import Routing  ===========================================//
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// var subscriber = redis.createClient(redis_config.port, redis_config.host).auth(redis_config.password);
// var publisher = redis.createClient(redis_config.port, redis_config.host).auth(redis_config.password); 
var subscriber = sub_client;
var publisher = pub_client; 


// ==================================== mongoDB connect and Schema  ===========================================//
// mongoose.connect('mongodb://175.115.95.51/moyeo_test');

// var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
// var chatLogSchema = new Schema({
//   id: ObjectId,
//   log: String,
//   date: String
// });
// var ChagLogModel = mongoose.model('chatLog', chatLogSchema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// redis-session
app.use(session(
  {
    secret: 'pub/sub',
    store: new redisStore({
      host: redis_config.host,
      port: redis_config.port,
      client: redis_client,
      prefix: "session:",
      db: 0,
      ttl: 10800
    }),
    cookie: { maxAge: 10800 },
    saveUninitialized: false,
    resave: true
  }
));

app.use('/', index);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

const server = app.listen(3002, function() {
  console.log('Pub/Sub Chatting Server on port 3002!');
});

const io = SocketIo(server);

socketEvents(io, publisher, subscriber);

module.exports = app;
