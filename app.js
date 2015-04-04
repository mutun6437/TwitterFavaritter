
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('cookie-session')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http');

var socketio = require("socket.io");

var server = http.createServer(app);
var io = require('socket.io').listen(server);


//PassPort 
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));

    //app.use(express.static(__dirname + '/public'));
  app.use('/static', express.static(__dirname + '/public'));

  // -- 追加しところ --
  app.use(session({secret: "hogesecret"})); // session有効
  app.use(passport.initialize()); // passportの初期化処理
  app.use(passport.session()); // passportのsessionを設定(中身はしらぬ)

  passport.serializeUser(function(user, done){
    done(null, user);
  });
  passport.deserializeUser(function(obj, done){
    done(null, obj);
  });


  var aToken,aSecret;

  passport.use(
    new TwitterStrategy({
    consumerKey: "Z8Gv0AR5d44ZqxWyECvcAg", // TWITTER_CONSUMER_KEY
    consumerSecret: "CGaYTPgBmNApy27Xo1AdPRExMv3fRYzwkl2qXF9GM",// TWITTER_CONSUMER_SECRET
    // callbackURLの指定
    callbackURL: "http://localhost:3000/auth/twitter/callback"
    }, function(token, tokenSecret, profile, done) {
      profile.twitter_token = token;
      profile.twitter_token_secret = tokenSecret;

      aToken = token;
      aSecret = tokenSecret;
   
      process.nextTick(function () {
        return done(null, profile);
      });
    })
  );

  app.get("/auth/twitter", passport.authenticate('twitter'));
   
  // Twitter callback Routing
  app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/logined',
    failureRedirect: '/login'
  }));





app.get("/",function(req,res){
    console.log("dada"+req.session.user);
    if(req.session.user==undefined){
        res.redirect("./login");
    }else{
        initTwitter();
        res.sendfile("./public/index.html");
    }

});

app.get("/logined",function(req,res){
    req.session.user = "ログインしました";
    res.redirect("/");
});


app.get("/login",function(req,res){
    res.redirect("/auth/twitter");
});








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
var twit;


function initTwitter(){
    twit = new twitter({
        consumer_key: 'Z8Gv0AR5d44ZqxWyECvcAg',
        consumer_secret: 'CGaYTPgBmNApy27Xo1AdPRExMv3fRYzwkl2qXF9GM',
        access_token_key: aToken,
        access_token_secret: aSecret
    });
}




/*
twit.get('search/tweets', {q: '',count:10}, function(error, tweets, response){
  //console.log(tweets);
  
    var tweet = tweets.statuses;  
    var randomTweet = randIndex(tweet); 
    
    twit.post('favorites/create', { id: randomTweet.id_str }, function(err){console.log(err)});
    
});

*/

var targets = [];












io.sockets.on("connection", function (socket) {

    //ツイート
    socket.on("tweet",function(data){
      console.log("つぶやきます");

      var text = data.text;

      twit.post('statuses/update', {status: text}, function(error, tweet, response){
        if (!error) {
          //console.log(tweet);
        }
      });
    });

    //お気に入り登録
    socket.on("favorite",function(data){
        //console.log("お気に入り登録します"+JSON.stringify(data));
        twit.get('search/tweets', {q: data.text,count:data.count,until:data.day}, function(error, tweets, response){
            console.log("ツイートの検索が完了しました"+JSON.stringify(tweets));
            var _tweets= tweets.statuses;  
            console.log("_tweets");
            
            for(i=0;i<_tweets.length;i++){
              console.log(i+"件目。お気に入り登録");
              twit.post('favorites/create', { id: _tweets[i].id_str }, function(err){
                  console.log(err);
                  socket.emit("result",err);
              });
            }
          console.log("ツイートのお気に入りが完了しました");
        });
    });
    //End Favorite



});













function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};

