
var socket = io.connect('http://localhost:3000');










function searchUser(){
	console.log(Math.floor(Math.random()*1000));
	
	var text = document.getElementById("searchUserText").value;
	socket.emit("searchUser",text);
}


function updateUserCount(){
	//ユーザ数の呼び出し要求
	socket.emit("getUserCount",function(){});
}





////////////////////////
//　　　　　　ソケット        //
//////////////////////


socket.on("postUserCount",function(data){
	console.log("更新します");
	document.getElementById("uCount").innerHTML=data;
});


socket.on("updateState",function(text){
	//テキスト更新
});