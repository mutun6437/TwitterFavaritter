
var socket = io.connect('http://localhost:3000');




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
	}

}

socket.on("result",function(err){
	document.getElementById("result").value="検索内容10件をふぁぼりました";
});


//初期化
initDayValue();







