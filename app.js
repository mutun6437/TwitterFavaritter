//基幹モジュール
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//ルーティング
var routes = require('./routes/index');
var users = require('./routes/users');


//Express
var app = express();

var http = require('http');

var socketio = require("socket.io");

var server = http.createServer(app);
var io = require('socket.io').listen(server);


//PassPort 
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;




//MongoDB


var db = require('./model/database');

var model = require('./model/database.js'),
    User  = model.User;
var UserData = model.userData;

//起動時削除　＊＊＊＊後でなくす
/*
User.remove({},function(err){console.log("削除エラー"+err)});
UserData.remove({},function(err){console.log("削除エラー"+err)});
*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(session({ secret: 'keyboard cat' }));

    //app.use(express.static(__dirname + '/public'));
  app.use('/static', express.static(__dirname + '/public'));

  // -- 追加しところ --
  
  app.use(passport.initialize()); // passportの初期化処理
  app.use(passport.session()); // passportのsessionを設定(中身はしらぬ)
  app.use(session({secret: "hogesecret"})); // session有効

  passport.serializeUser(function(user, done){
    done(null, user.id);
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
    successRedirect: '/twitter',
    failureRedirect: '/login'
  }));





app.get("/",function(req,res){
    console.log("dada"+passport.session);
    
    res.redirect("./login");
        
    
});



app.get("/twitter",function(req,res){
    initTwitter();
    res.sendfile("./public/index.html");
});


app.get("/login",function(req,res){
    res.redirect("/auth/twitter");
});

app.get("/analyze",function(req,res){
    res.sendfile("./public/analyze.html");
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

  if(aToken==undefined){
    console.log("ログインし直し");
    return
  }else{ 
    twit = new twitter({
        consumer_key: 'Z8Gv0AR5d44ZqxWyECvcAg',
        consumer_secret: 'CGaYTPgBmNApy27Xo1AdPRExMv3fRYzwkl2qXF9GM',
        access_token_key: aToken,
        access_token_secret: aSecret
    });   

  }
}


/*
twit.get("statuses/user_timeline",{user_id:user[0].id_str},function(err,tweets,retweet){
        //console.log(tweets[0]);
      });

*/

























var targets = [];

var favIntervals = [];
var tweetIntervals = [];
var retweetIntervals = [];


io.sockets.on("connection", function (socket) {

    //ツイート
    socket.on("tweet",function(data){
      console.log("つぶやきます");
      createTweet(data);      
    });

    //お気に入り登録
    socket.on("favorite",function(data){
        //console.log("お気に入り登録します"+JSON.stringify(data));
        favoriteTweet(data);
    });

    //リツイート
    socket.on("retweet",function(data){
        //console.log("お気に入り登録します"+JSON.stringify(data));
        retweetTweet(data);
    });
    
    

    ////////////////////////
    //BOT//////////////////
    //////////////////////
    socket.on("bot/tweet",function(data){
      tweetIntervals[tweetIntervals.length]= setInterval(function(){
        createTweet(data);
      }, data.interval)
    });
    socket.on("bot/favorite",function(data){
      favIntervals[favIntervals.length] = setInterval(function(){
        //console.log('繰り返します'+data);
        favoriteTweet(data);
      }, data.interval);               
    });

    socket.on("bot/retweet",function(data){
      retweetIntervals[retweetIntervals.length] = setInterval(function(){
        retweetTweet(data);
      },data.interval); 
    });


    ///////////////////////
    //データベース/////////////
    //////////////////////
    socket.on("getUserCount",function(){
      User.find({},function(err,docs){
        var count = docs.length;
        socket.emit("postUserCount",count);
      });
    });

    socket.on("searchUser",function(text){
      findUserProfile(text);
    });



});










function findUserProfile(text){
  twit.get("users/search",{q:text,page:Math.floor(Math.random()*100)},function(err,user,response){
    //console.log("ユーザ"+JSON.stringify(user[0].id_str));
    
    //形態素解析して名詞をタグとして保存
    var tags = [];
    var total = 0;

    for(i=0;i<user.length;i++){
      var json = {uID:user[i].id_str,name:user[i].name,nameId:user[i].screen_name,location:user[i].location,tags:[""],weight:1}
      //ユーザデータを保存
      storeUserData(json);      
    }
  });
}








//                              //
// 既にユーザが登録されて　　　　　　　　　　　  //
//            いないか判断し、保存    //
function storeUserData(data){
  var result=0;
  User.findOne({name:data.name},function(err,doc){
    //console.log("中身"+doc);
    if(doc){
      //console.log("存在します");
    }else{
      //console.log("保存します");
      var userData = new User(data);
      userData.save(function(err){});
    }   
  });
}


















function createTweet(data){
  var text = data.text;
  twit.post('statuses/update', {status: text}, function(error, tweet, response){
    if (!error) {
      //console.log(tweet);
    }
  });
}


function retweetTweet(data){
  //実装保留

}



function favoriteTweet(data){
  twit.get('search/tweets', {q: data.text,count:data.count,until:data.day,locale:"ja"}, function(error, tweets, response){
      //console.log("ツイートの検索が完了しました"+JSON.stringify(tweets));
      var _tweets= tweets.statuses;  
      //console.log("_tweets");
      
      for(i=0;i<_tweets.length;i++){
        console.log(i+"件目。お気に入り登録");
        followUser(_tweets[i].user.screen_name);


        twit.post('favorites/create', { id: _tweets[i].id_str }, function(err){
            console.log(err);
            //io.socket.emit("result",err);
        });

      }
    console.log("ツイートのお気に入りが完了しました");
  });
}






//フォロー方法
function followUser(userId){  
  //console.log("ユーザ名"+userId)
  twit.post("friendships/create",{screen_name:userId,follow:true},function(err){
    //console.log("フォローします"+JSON.stringify(err));
  });
}
