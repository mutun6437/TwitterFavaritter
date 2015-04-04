function initDayValue(){
	//日付タグの
	//	最大値登録
	//  今日の日付
	var dayElement = document.getElementsByClassName("day");


	dd = new Date();
	yy = dd.getYear();
	mm = dd.getMonth() + 1;
	dd = dd.getDate();
	if (yy < 2000) { yy += 1900; }
	if (mm < 10) { mm = "0" + mm; }
	if (dd < 10) { dd = "0" + dd; }
	var today = yy + "-" + mm + "-" + dd;
	//console.log(yy + "-" + mm + "-" + dd);
	
	for(i=0;i<dayElement.length;i++){
		dayElement[i].value = today;
		dayElement[i].max = today;
	}
}