
//var socket = io.connect('http://localhost:3000');
var socket = io.connect('http://182.163.52.82:3000/');





function submit(target){


	if(target==0){
		var text = document.getElementById("t_word").value;
		var data = {text:text}
		socket.emit("tweet",data);
	}else if(target==1){
		//お気に入り登録
		var count = document.getElementById("f_count").value;
		var day = document.getElementById("f_day").value;
		var text = document.getElementById("f_word").value;

		var data = {text:text,day:day,count:count};

		socket.emit("favorite",data);
	}else if(target==2){
		var target = document.getElementById("b_target").value;

		var span = document.getElementById("b_span").value;
		var count = document.getElementById("b_count").value;
		var text = document.getElementById("b_word").value;
		var interval;

		if(span==="半日"){
		  interval = 43200000;
		}else if(span==="一日"){
		  interval = 86400000;
		}else if(span==="一時間"){
		  interval = 3600000;
		}else{return;}

		//DATAをJSONに格納
		data = {text:text,span:span,count:count,interval:interval};

		//TODO 処理によって別のソケットにする
		if(target==="ツイート"){
			console.log("ツイートの設定");
			socket.emit("bot/tweet",data);

		}else if(target==="お気に入り"){
			console.log("お気に入りの設定");
			socket.emit("bot/favorite",data);

		}else if(target==="リツイート"){
			console.log("リツイートの設定");
			socket.emit("bot/retweet",data);

		}



	}

}

socket.on("result",function(err){
	document.getElementById("result").value="検索内容10件をふぁぼりました";
});


//初期化
initDayValue();








