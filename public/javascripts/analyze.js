
//var socket = io.connect('http://localhost:3000');

var socket = io.connect('http://182.163.52.82:3000/');





socket.emit("getTweets");




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

socket.on("setTweets",function(data){
	restoreTweets(data);
});









function setNewTweet(){
	if(event.keyCode==13){
		var text = document.getElementById("newTweet").value;
		socket.emit("setNewTweet",text);
		console.log("初期化"+text);
		document.getElementById("newTweet").value="";
	}
}











function restoreTweets(data){
	var tweets = data.tweetList;
	var count = data.tweetCount;
	var length = data.tweetList.length;
	console.log(length);

	var tb = document.getElementById("tweets");
	

	//要素を先に削除しておく
	while (child = tb.lastChild) tb.removeChild(child);


	var h_tr = document.createElement("tr");
	var h_index = document.createElement("th");
	var h_tweet = document.createElement("th");
	h_tweet.innerHTML = "内容";
	var h_count = document.createElement("th");
	h_count.innerHTML = "ツイート回数";
	var h_button = document.createElement("th");
	h_button.innerHTML = "削除";

	h_tr.appendChild(h_index);
	h_tr.appendChild(h_tweet);
	h_tr.appendChild(h_count);
	h_tr.appendChild(h_button);

	tb.appendChild(h_tr);





	for(i=0;i<length;i++){
		var tr = document.createElement("tr");

		var _index = document.createElement("td");
		var _tweet = document.createElement("td");
		var _count = document.createElement("td");
		var _button = document.createElement("td");

		//tweet count を挿入
		_tweet.innerHTML = tweets[i];
		_count.innerHTML = count[i];
		_index.innerHTML = i;

		var button = document.createElement("input");
		button.type="button";
		button.value="削除";
		button.id="removeTweet"+i;
		_button.appendChild(button);

		button.addEventListener("click", function(e){			
			var data = e.target.id.split("removeTweet");
			console.log(data[1]);
			socket.emit("removeTweet",data[1]);
		});

		tr.appendChild(_index);
		tr.appendChild(_tweet);
		tr.appendChild(_count);
		tr.appendChild(_button);
		

		tb.appendChild(tr);

	}
}