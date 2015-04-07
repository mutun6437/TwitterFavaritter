var mongoose = require('mongoose');
var url = 'mongodb://localhost/user';
var db  = mongoose.createConnection(url, function(err, res){
    if(err){
        console.log('Error connected: ' + url + ' - ' + err);
    }else{
        console.log('Success connected: ' + url);
    }
});

// Modelの定義
var UserSchema = new mongoose.Schema({
    uId    : String,
    nameId :String,
    name  : String,
    location :String,
    tags :[String],
    weight:Number
},{collection: 'info'});

exports.User = db.model('User', UserSchema);



var BotSchema = new mongoose.Schema({
    twitter:Object,
    type: String,
    span : String,
    text:String
});


exports.userData = db.model('userData', BotSchema);







 


