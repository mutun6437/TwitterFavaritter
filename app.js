var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http');

var socketio = require("socket.io");

var server = http.createServer(app);
var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



app.post("/post",function(req,res){
    console.log(req.body);
    res.redirect("/");
});


module.exports = app;

server.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});





var util = require('util'),
    twitter = require('twitter');


var twit = new twitter({
    consumer_key: 'Z8Gv0AR5d44ZqxWyECvcAg',
    consumer_secret: 'CGaYTPgBmNApy27Xo1AdPRExMv3fRYzwkl2qXF9GM',
    access_token_key: '1882925552-xGr8Pg0QBU59qRSxC6BwJELMMNmiHeYF9frSyxg',
    access_token_secret: '6wdThoKqzJwuBLZvNUnBnq52Sx808X8owr4hNe6a5g8jk'
});

/*
twit.get('search/tweets', {q: '',count:10}, function(error, tweets, response){
  //console.log(tweets);
  
    var tweet = tweets.statuses;  
    var randomTweet = randIndex(tweet); 
    
    twit.post('favorites/create', { id: randomTweet.id_str }, function(err){console.log(err)});
    
});
*/




function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};


io.sockets.on("connection", function (socket) {
    socket.on("search",function(searchText){
        //console.log(data);
        twit.get('search/tweets', {q: searchText,count:10}, function(error, tweets, response){
            var tweet = tweets.statuses;  
            var randomTweet = randIndex(tweet); 
            twit.post('favorites/create', { id: randomTweet.id_str }, function(err){console.log(err)});
        });

    });
});