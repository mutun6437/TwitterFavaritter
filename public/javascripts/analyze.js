
var socket = io.connect('http://localhost:3000');










function searchUser(){	
	var text = document.getElementById("searchUserText").value;
	socket.emit("searchUser",text);
}


function updateUserCount(){
	//ユーザ数の呼び出し要求
	console.log("ユーザ数要求します");
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


socket.on("disconnect",function(){
	location.href = "../";
});