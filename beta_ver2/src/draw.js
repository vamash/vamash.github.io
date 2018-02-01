;(function(){

	var wrapperWindow = document.getElementById("wrapper"),
			backgroundWindow = document.getElementById("bg"),
			mainBlock = document.getElementById("main_border"),
			inventoryBlock = document.getElementById("inventory_border"),
			widthBrowser = document.documentElement.clientWidth,
			heightBrowser = document.documentElement.clientHeight;

	window.addEventListener("resize", drawWindow, false);

	function drawWindow(){
		wrapperWindow = document.getElementById("wrapper"),
		backgroundWindow = document.getElementById("bg"),
		mainBlock = document.getElementById("main_border"),
		inventoryBlock = document.getElementById("inventory_border"),
		widthBrowser = document.documentElement.clientWidth,
		heightBrowser = document.documentElement.clientHeight;
		wrapperWindow.style.width = widthBrowser + "px";
		wrapperWindow.style.height = heightBrowser + "px";
		wrapperWindow.style.backgroundSize = widthBrowser + "px " + heightBrowser + "px";
		backgroundWindow.style.width = widthBrowser + "px";
		backgroundWindow.style.height = heightBrowser + "px";
		backgroundWindow.style.backgroundSize = widthBrowser + "px " + heightBrowser + "px";
		mainBlock.style.left = ((widthBrowser/2) - 380) + "px";
		mainBlock.style.top = ((heightBrowser/2) - 230 - 40) + "px";
		inventoryBlock.style.left = ((widthBrowser/2) - 340) + "px";
	}

	drawWindow();

	var map = document.getElementById("map");
	for(i = 0; i < 16; i++) {
		var tr = document.createElement("div");
		tr.setAttribute('class', "tr_map map_" + i);
		var tr_info = document.createElement("div");
		tr_info.setAttribute("class", "tr_info");
		tr_info.setAttribute("style", "display: none");
		tr.addEventListener("mouseover", info.bind(null, i), true);
		tr.addEventListener("mouseout", infoOff, true);
		tr.appendChild(tr_info);
		map.appendChild(tr);
	}

	function infoOff() {
		var tr = document.getElementsByClassName("tr_map");
		for(var i = 0; i < tr.length; i++) {
			if(tr[i])
			tr[i].firstChild.style.display = "none";
		}
	}

	function info(map) {
		var child = document.getElementsByClassName("tr_map")[map].firstChild;
		var tr = document.getElementsByClassName("tr_map");
		for(var i = 0; i < tr.length; i++) {
			if(tr[i])
			tr[i].firstChild.style.display = "none";
		}
		switch(map){
			case 0: console.log("Лавка"); break;
			case 1:
				child.style.display = "block";
				break;
			case 2: console.log("Оборотни"); break;
			default: console.log("хз");
		};
	}


}());