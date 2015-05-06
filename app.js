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
    consumerKey: "QFSW4K0Hi1RXYuCU50Y17bm8E", // TWITTER_CONSUMER_KEY
    consumerSecret: "oAq7kiTwzz1UcEJYLnEoQnrSifNsTwWLWE5kRNa2cKYp25XsQJ",// TWITTER_CONSUMER_SECRET
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
    
    //検索タイマー
    crearTimers();
    setFindTimer();
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
        consumer_key: 'QFSW4K0Hi1RXYuCU50Y17bm8E',
        consumer_secret: 'oAq7kiTwzz1UcEJYLnEoQnrSifNsTwWLWE5kRNa2cKYp25XsQJ',
        access_token_key: aToken,
        access_token_secret: aSecret
    });   

    console.log("Twitterの準備が整いました");

    

  }


}


/*
twit.get("statuses/user_timeline",{user_id:user[0].id_str},function(err,tweets,retweet){
        //console.log(tweets[0]);
      });

*/






















var uSearchWord = ["エンジニア","IT","プログラマ","SE","開発","ゲーム開発","Web"];
//var fSearchWord = ["エンジニア","IT","プログラマ","システムエンジニア","開発","ゲーム開発","残業","Ruby","PHP","Node.js","JAVA"];
var works = ["IT","SE","システムエンジニア","ゲーム","インフラ","Web","アプリ","Android","iOS"];
var fSearchWord = ["残業辛い","仕事やめたい","開発したい","お仕事募集","つらい","フリーランス","仕事募集"];

var design =["絵の仕事","Unity 仕事","イラストの仕事","イラスト　仕事　募集","Unity 募集","Web デザイン　仕事募集","デザイン　仕事　募集","Webデザイン　仕事募集","3D　モデリング　仕事"];

var tweetList = ["プログラム難しいなあ・・・","設計書書くよん","残業つらぽよ","アニメ面白いのないかな？","ライブいきたい","フレームワーク・・・","学習コスト高いな","【定期】都内でエンジニアやっています。フォローリフォローご自由に！","【定期】都内でエンジニアやっています。フォローリフォローご自由に！","【定期】都内でエンジニアやっています。フォローリフォローご自由に！","【定期】都内でエンジニアやっています。フォローリフォローご自由に！",
                "オブジェクト指向かあ・・・","インフラわかんにゃい","ソースコード見直そ","勉強回！","Rubyって面白いのかな？","JAVAやるよっ","フロント周りのコーディングが得意ですっ","あー仕事終わったー"];

var tweetList2 = ["【定期】フリーランスのエンジニアやデザイナーの方にお仕事のご紹介をしておりますっ","【定期】イラストレイターさんも是非ご登録お願いいたします！","【定期】ゲーム業界で働きたい方おられましたらリプライお待ちしております～"];

var badWords = "-未経験でも -レディス -メンズ -18歳以上 -占い -高収入 -在宅 -素人 -マッサージ -女の子 -風俗 -女優 -モデル -声 -歌 -介護 -会う -出会い -女子大生 -goo.gl -t.co";






//ツイートした回数を数える リスト分だけ初期化
var tweetCount = [];
for(i=0;i<tweetList.length;i++){
  tweetCount.push(0);
}


var targets = [];

var favIntervals = [];
var tweetIntervals = [];
var retweetIntervals = [];

var userTimer,favoriteTimer,favoriteTimer2,tweetTimer;




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
      console.log("ユーザ数を出力します");
      User.find({},function(err,docs){
        var count = docs.length;
        console.log("ユーザ数を出力します"+count);
        socket.emit("postUserCount",count);
      });
    });

    socket.on("searchUser",function(text){
      console.log("ユーザを検索します");
      findUserProfile(text);
    });


    socket.on("searchUserWeight",function(){
      searchUserWeight();
    });

    
    //ツイートリストの送信
    socket.on("getTweets",function(){
      var json = {tweetList:tweetList,tweetCount:tweetCount}
      socket.emit("setTweets",json);
    });

    socket.on("setNewTweet",function(text){
      console.log("ツイートを追加します。内容【"+text+"】");
      tweetList.push(text);
      //新規ツイートの回数をリセット
      tweetCount[tweetList.length-1]=0;
      var json = {tweetList:tweetList,tweetCount:tweetCount}
      socket.emit("setTweets",json);
    });


    //ツイートリストを削除
    socket.on("removeTweet",function(index){
      console.log("ツイートリスト番号"+index+"の【"+tweetList[index]+"】を削除します");
      tweetList.splice(index,1);
      var json = {tweetList:tweetList,tweetCount:tweetCount}
      socket.emit("setTweets",json);
    });




});










function findUserProfile(text){
  twit.get("users/search",{q:text+" -rt -bot"+badWords,page:Math.floor(Math.random()*100)},function(err,user,response){
    //console.log("ユーザ"+JSON.stringify(user[0].id_str));
    
    //形態素解析して名詞をタグとして保存
    var tags = [];
    var total = 0;

    for(i=0;i<user.length;i++){
      var json = {uID:user[i].id_str,name:user[i].name,nameId:user[i].screen_name,location:user[i].location,tags:[""],weight:1}
      //ユーザデータを保存
      storeUserData(json,false);      
    }
  });
}








//                              //
// 既にユーザが登録されて　　　　　　　　　　　  //
//            いないか判断し、保存    //
function storeUserData(data,isTweet){
  var result=0;
  User.findOne({name:data.name},function(err,doc){
    //console.log("中身"+doc);
    if(doc){
      //console.log("存在します");
      if(isTweet){
        doc.weight = doc.weight + data.weight;
        doc.save();
      }else{
        //ユーザ検索の時は何もしない
      }
      
    }else{
      //console.log("保存します");
      var userData = new User(data);
      userData.save(function(err){});
    }   
  });
}






function searchUserWeight(value){
  console.log("検索します");
  User.find({ weight : { $gte : value} },function(err,doc){
    console.log(doc);
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
  //until:data.until
  twit.get('search/tweets', {q: data.text+" -rt -bot"+badWords,count:data.count,lang:"ja"}, function(error, tweets, response){
      //console.log("ツイートの検索が完了しました"+JSON.stringify(tweets));
      var _tweets= tweets.statuses;  
      console.log(_tweets.length);
      
      for(i=0;i<_tweets.length;i++){
        
        
              console.log(i+"件目。お気に入り登録:"+_tweets[i].text);
              twit.post('favorites/create', { id: _tweets[i].id_str }, function(err){
                  //console.log(err);
                  //io.socket.emit("result",err);
              });


              var json = {uID:_tweets[i].user.id_str,name:_tweets[i].user.name,nameId:_tweets[i].user.screen_name,location:_tweets[i].user.location,tags:[""],weight:1}
              //ユーザデータを保存
              storeUserData(json,true); 
            
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




function confirmTweet(text){
  var isBad = false;

  for(i=0;i<badWords.length;i++){
    var reg = new RegExp(badWords[i]);
    if(reg.test(text)){
     isBad = true;
     return isBad;
     console.log("badWords");
    }else{
     //問題がなければなにもしない
    }     
  }
  //適さないワードかどうか
  return false;
}














function setFindTimer(){
  var date = getDayValue();

  console.log("ツイートします");
  var index = Math.floor(Math.random()*tweetList.length);
  tweetCount[index]+=1; 
  createTweet({text:tweetList[index]});

  //お気に入り登録　IT
  var index = Math.floor(Math.random()*fSearchWord.length);
  var index2 = Math.floor(Math.random()*works.length);
  var text = fSearchWord[index]+" "+works[index2];
  var json = {text:text,count:30,until:date};
  favoriteTweet(json);

  //お気に入り登録  デザイン
  var index = Math.floor(Math.random()*fSearchWord.length);
  var json = {text:design[index],count:30,until:date};
  favoriteTweet(json);

  //searchUserWeight(2);

  userTimer = setInterval(function(){
    //console.log("お気に入り登録します");
    //console.log("検索します");
    var index = Math.floor(Math.random()*uSearchWord.length);
    //console.log(uSearchWord[index]);
    findUserProfile(uSearchWord[index]);
  },5500);

  favoriteTimer = setInterval(function(){
    console.log("お気に入り登録します１");
    var index = Math.floor(Math.random()*design.length);
    var json = {text:design[index],count:30,until:date};
    favoriteTweet(json);
  },3600000);

  favoriteTimer2 = setInterval(function(){
    console.log("お気に入り登録します２");
    var index1 = Math.floor(Math.random()*fSearchWord.length);
    var index2 = Math.floor(Math.random()*works.length);
    var text =  fSearchWord[index1]+" "+works[index2];
    var json = {text:text,count:30,until:date};
    favoriteTweet(json);
  },3600000);

  tweetTimer = setInterval(function(){
    var index = Math.floor(Math.random()*tweetList.length);
    //ツイート回数を記憶
    tweetCount[index]+=1; 
    createTweet({text:tweetList[index]});
  }, 3600000);

}


function crearTimers(){
  clearInterval(userTimer);
  clearInterval(favoriteTimer);
  clearInterval(favoriteTimer2);
  clearInterval(tweetTimer);
}











function getDayValue(){



  dd = new Date();
  yy = dd.getYear();
  mm = dd.getMonth() + 1;
  dd = dd.getDate()-1;
  if (yy < 2000) { yy += 1900; }
  if (mm < 10) { mm = "0" + mm; }
  if (dd < 10) { dd = "0" + dd; }
  var today = yy + "-" + mm + "-" + dd;
  //console.log(yy + "-" + mm + "-" + dd);
  
  
  return today;

}