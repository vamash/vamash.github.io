;(function(){

	Object.prototype.clone = function() {
    var f = function () {};
    f.prototype = this;
    var g = new f();
    g.prototype = this;
    return g;
	}


	//////////////////////////// Map /////////////////////////////

	var map = [
		"Лагерь крестоносцев", "Кабанья поляна", "Густой лес", "Долина змей",
		"Волчья поляна", "Дикая поляна", "Заброшенный замок", "Древний лагерь воинов",
		"Зловонная долина", "Сектанское сборище", "Болотная чаща", "Заколдованное кладбище",
		"Древнее кладбище", "Пещера у горы", "У подножия вулкана", "Дракон"
	],
	images = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
	blockedMessage = "Локация недоступна", mapLocation = 0, prevMapLocation = 0;

	//////////////////////////// Map END //////////////////////////

	//////////////////////////// ENEMY IMAGES /////////////////////

	var imageEnemy = document.getElementById("enemy");

	//////////////////////////// ENEMY IMAGES END /////////////////

	//////////////////////////// HP BAR ///////////////////////////

	var hpPlayerBar = document.getElementsByClassName("hpBar")[0];
	var hpPlayerBarHp = hpPlayerBar.childNodes[3];
	var hpPlayerBarLine = hpPlayerBar.childNodes[5];

	var hpEnemyBar = document.getElementsByClassName("hpBar")[1];
	var hpEnemyBarHp = hpEnemyBar.childNodes[3];
	var hpEnemyBarLine = hpEnemyBar.childNodes[5];

	var widthPlayerBarHp = 100, widthEnemyBarHp;

	//////////////////////////// HP BAR END ///////////////////////

	//////////////////////////// Main Vars ////////////////////////

	var playerInput = "", gameMessage = "",	action = "", backpack = [];

	var player = {
		level: 0,
		vitality: 8,
		strong: 0,
		healPotion: 5,
		regen: false,
		regenTime: 1030,
		exp: 0,
		nextLevel: 20,
		money: 10,
		die: false,
		hp: 0,
		maxHp: 0
	};

	levelUp();

	var regenInterval;

	//////////////////////////// Main Vars END ////////////////////

	//////////////////////////// Main DOM /////////////////////////

	var output = document.getElementById("output"),
			imageBlock = document.getElementById("image"),
			imageBackground = document.getElementById("bg"),
			infoPlayer = document.getElementById("info_player"),
			positionOnMap = document.getElementById("place");

	//////////////////////////// Main DOM END /////////////////////

	//////////////////////////// SHOP /////////////////////////////

	var shopBlock = document.getElementById("shop_border"),
			shop = document.getElementById("shop"),
			itemH2 = document.createElement("h2"),
			itemInShop, itemInShopImage, itemInShopDiscription, itemInShopText, itemInShopBuy, itemInShopBuyItem;

	var tr_inv = document.getElementsByClassName('tr_inv'), imageBP;

	itemH2.innerHTML = "Лавка";

	//////////////////////////// SHOP END /////////////////////////

	//////////////////////////// Map DRAW /////////////////////////

	var mapDraw = document.getElementById("map");
	var map_player = document.getElementById("player");
	var size = 50, left_player = 25 - (size/2), top_player = 25 - (size/2);

	map_player.style.backgroundSize = size + "px " + size + "px";
	map_player.style.width = size + "px ";
	map_player.style.height = size + "px ";

	//////////////////////////// Map DRAW END /////////////////////

	//////////////////////////// Audio ////////////////////////////

	var audio = document.getElementsByTagName("audio")[0];
	var mute = 0, muteButton = document.getElementById("mute");
	var audioChoose = 1; // 1 - Стандартная / 2 - Босс

	muteButton.addEventListener("click", muteFunc, false);

	audio.setAttribute("src", "audio/bg_music2.mp3");
	audio.play();
	audio.volume = 0.0;
	audio.addEventListener("ended", function(){ audio.currentTime = 0; audio.play() }, false);

	//////////////////////////// Audio END /////////////////////////

	//////////////////////////// Button Events /////////////////////

	var moveTop = document.getElementById("circle_top"),
			moveRight = document.getElementById("circle_right"),
			moveDown = document.getElementById("circle_bottom"),
			moveLeft = document.getElementById("circle_left"),
			attackButton = document.getElementsByClassName("action")[0],
			usePotionButton = document.getElementsByClassName("action")[1];

	moveTop.addEventListener("click", clickHandler.bind(null, "север"), false);
	moveRight.addEventListener("click", clickHandler.bind(null, "восток"), false);
	moveDown.addEventListener("click", clickHandler.bind(null, "юг"), false);
	moveLeft.addEventListener("click", clickHandler.bind(null, "запад"), false);

	attackButton.addEventListener("click", clickHandler.bind(null, "атаковать"), false);
	usePotionButton.addEventListener("click", usePotion, false);


	window.addEventListener("keydown", cheat, false);

	//////////////////////////// Button Events END //////////////////

	//////////////////////////// Add Weapon /////////////////////////

	// addWeapon(type, name, image, cost, damage)

	var idWeapon = 0, weaponsArray = [], weaponBuying = {},
			weapon = {}, shopName;

	addWeapon("standart", "кулак", "hand", 0, 5);
	addWeapon("standart", "обычный меч", "sword", 10, 12);
	addWeapon("standart", "лесной топор", "forestAxe", 20, 15);
	addWeapon("standart", "старая булава", 'oldMace', 40, 16);
	addWeapon("standart", "закаленный меч", 'temperedSword', 80, 25);
	addWeapon("standart", "заточенный топор", 'enAxe', 140, 30);
	addWeapon("standart", "булава", 'mace', 200, 36);
	addWeapon("standart", "обычное копье", 'spear', 280, 40);
	addWeapon("standart", "редкий меч", 'rareSword', 400, 47);
	addWeapon("standart", "топор мастера", 'axeMastery', 500, 62);
	addWeapon("standart", "булава рыцаря", 'maceKnight', 640, 70);
	addWeapon("standart", "копье спартанца", 'spearSparta', 1000, 102);

	addWeapon("rare", "волшебная перчатка", "magicHand", 2400, 165);
	addWeapon("rare", "зачарованный меч", "enchantedSword", 3200, 194);
	addWeapon("rare", "боевой топор", "warAxe", 4000, 238);
	addWeapon("rare", "адская булава", "hellMace", 5600, 312);
	addWeapon("rare", "легендарный меч", "legendarySword", 10000, 648);

	//////////////////////////// Add Weapon END //////////////////////

	//////////////////////////// Add Enemy ///////////////////////////

	//addEnemy(name, gold, exp, hp, damage, mapLocation, preLevel, postLevel)

	var enemy = {}, dieEnemy = true, blockMove = false,
			enemyArray = [], idEnemy = 0;

	addEnemy("кабан", 4, 9, 26, 6, 1, [1,5]);
	addEnemy("оборотень", 16, 32, 112, 48, 2, [10,15]);
	addEnemy("змея-крыл", 24, 48, 164, 72, 3, [20,25]);
	addEnemy("волк", 10, 24, 51, 17, 4, [1,5]);
	addEnemy("дикий кабан", 8, 16, 59, 32, 5, [5,10]);
	addEnemy("некромант", 26, 52, 195, 104, 6, [15,20]);
	addEnemy("упырь", 10, 20, 70, 40, 8, [10, 15]);
	addEnemy("падший маг", 15, 30, 105, 60, 9, [15,20]);
	addEnemy("огр", 20, 40, 140, 80, 10, [20,25]);
	addEnemy("древняя озлобленная душа", 26, 52, 198, 104, 11, [25,30]);
	addEnemy("скелет", 14, 28, 98, 56, 12, [15,20]);
	addEnemy("тролль", 32, 76, 160, 102, 13, [20,25]);
	addEnemy("адский шипокрыл", 86, 130, 420, 180, 14, [30,35]);
	addEnemy("дракон", 325, 650, 900, 300, 15, [40,40]);

	//////////////////////////// Add Enemy END ///////////////////////

	backpack.push(weaponsArray[0]);
	weaponsArray.splice(0,1);

	render();
	createBackPack("start");

	function addWeapon(type, name, image, cost, damage) {
		var weapon = {
			type: type,
			name: name,
			image: image,
			cost: cost,
			startDamage: damage,
			damage: damage,
			id: idWeapon++
		};
		weaponsArray.push(weapon);
	}

	function addEnemy(name, gold, exp, hp, damage, mapLocation, level) {
		var enemy = {
			name: name,
			gold: gold,
			exp: exp,
			hp: hp,
			damage: damage,
			mapLocation: mapLocation,
			level: [level[0], level[1]],
			id: idEnemy++
		};
		enemyArray.push(enemy);
	}

	function muteFunc(){
		if(mute === 1) { mute = 0; audio.volume = 0.5; }
		else { mute = 1; audio.volume = 0; }
	}

	function clickHandler(event) {
		action = event;
		startGame();
	}

	

	function startGame(){
		gameMessage = "";
		prevMapLocation = mapLocation;
		player.money = Math.floor(player.money);

		switch(action) {
			case "север":
				if(blockMove === false) {
					if(mapLocation > 3) {
						mapLocation -= 4;
						top_player -= 50;
					} else {
						gameMessage = blockedMessage;
					}
				}
				else gameMessage = "С начала убейте " + enemy.name;
				break;
			case "восток":
				if(blockMove === false) {
					if(mapLocation % 4 !== 3) {
						mapLocation += 1;
						left_player += 50;
					} else {
						gameMessage = blockedMessage;
					}
				}
				else gameMessage = "С начала убейте " + enemy.name;
				break;
			case "юг":
				if(blockMove === false) {
					if(mapLocation < 12) {
						mapLocation += 4;
						top_player += 50;
					} else {
						gameMessage = blockedMessage;
					}
				}
				else gameMessage = "С начала убейте " + enemy.name;
				break;
			case "запад":
				if(blockMove === false) {
					if(mapLocation % 4 !== 0) {
						mapLocation -= 1;
						left_player -= 50
					} else {
						gameMessage = blockedMessage;
					}
				}
				else gameMessage = "С начала убейте " + enemy.name;
				break;
			case "атаковать":
				if(mapLocation === 0 || mapLocation === 7) { gameMessage = "Здесь не с кем сражаться"; }
				else attack();
				break;
			default: gameMessage = "Я не знаю такого действия"; break;
		}

		//.........CHANGE MUSIC...........//

		if(mapLocation === 15 && prevMapLocation !== mapLocation) {
			audio.setAttribute("src", "audio/final_music.mp3");
			audioChoose = 2;
			audio.currentTime = 0;
			audio.play();
		}	else if(mapLocation !== 15 && audioChoose !== 1) {
			audio.setAttribute("src", "audio/bg_music2.mp3");
			audioChoose = 1;
			audio.currentTime = 0.4;
			audio.play();
		}

		//.........CHANGE MUSIC END...........//

		//.........CREATE ENEMY...........//

		if((mapLocation !== 0 && mapLocation !== 7) && dieEnemy === true && prevMapLocation !== mapLocation) {
			createEnemy();
		}

		//.........CREATE ENEMY END...........//

		//.........REGENERATION...........//

		if(dieEnemy === false){
			if(player.regen === true) clearInterval(regenInterval);
			player.regen = false;
		} else if(dieEnemy === true && player.regen === false) {
			player.regen = true;
			regenInterval = setInterval(function(){
				if(player.hp < player.maxHp){
					player.hp += 0.1;
					if(player.hp > player.maxHp) {
						player.hp = player.maxHp;
					}
					widthPlayerBarHp = (player.hp / player.maxHp) * 100;
					hpPlayerBarHp.style.width = widthPlayerBarHp + "%";
					hpPlayerBarLine.style.width = widthPlayerBarHp + "%";
					hpPlayerBar.childNodes[1].innerHTML = "Health: " + Math.floor(player.hp) + " / " + player.maxHp;
				} else {
					clearInterval(regenInterval);
					player.regen = false;
				}
			},player.regenTime/10)
		}

		//.........REGENERATION END...........//

		render();
	}

	function render(){
		output.innerHTML = gameMessage;
		infoPlayer.innerHTML = "Уровень " + player.level + ", Опыт " + player.exp + "/" + player.nextLevel + ", Монеты " + player.money;
		positionOnMap.innerHTML = map[mapLocation];
		image.src = "images/locations/" + images[mapLocation] + ".jpg";
		imageBackground.style.backgroundImage = "url(images/locations/" + images[mapLocation] + ".jpg)";

		widthEnemyBarHp = (enemy.hp / enemy.maxHp) * 100;
		widthPlayerBarHp = (player.hp / player.maxHp) * 100; 

		hpPlayerBarHp.style.width = widthPlayerBarHp + "%";
		hpPlayerBarLine.style.width = widthPlayerBarHp + "%";
		hpPlayerBar.childNodes[1].innerHTML = "Health: " + Math.floor(player.hp) + " / " + player.maxHp;

		if(dieEnemy === true) {
			imageEnemy.src = "";
			imageEnemy.style.display = "none";
			hpEnemyBar.style.display = "none";
		}
		else {
			positionOnMap.innerHTML += "(" + enemy.level[0] + "-" + enemy.level[1] + ")";
			imageEnemy.style.display = "block";
			imageEnemy.src = "images/enemies/" + mapLocation + ".png";
			hpEnemyBar.style.display = "inline-block";
			hpEnemyBar.childNodes[1].innerHTML = "Health: " + enemy.hp + " / " + enemy.maxHp;
			hpEnemyBarHp.style.width = widthEnemyBarHp + "%";
			hpEnemyBarLine.style.width = widthEnemyBarHp + "%";
		}

		if(mapLocation === 0 || mapLocation === 7) { shopBlock.style.display = "block"; createShop(); }
		else { shopBlock.style.display = "none"; }

		map_player.style.left = left_player + "px";
		map_player.style.top = top_player + "px";
	}

	// --------------- Покупка Оружия и прорисовка магазина ---------------

	function createShop() {
		if(itemInShopBuyItem) itemInShopBuyItem.removeEventListener("click", buyItem, false);
		shopName = "";
		if (mapLocation === 0) {
			shopName = "standart";
		}
		else if (mapLocation === 7) {
			shopName = "rare";
		}

		shop.innerHTML = "";
		shop.appendChild(itemH2);
		itemInShop = "", itemInShopImage = "", itemInShopText = "",
		itemInShopDiscription = "", itemInShopBuyItem = "", itemInShopBuy = "";

		for(i = 0; i < weaponsArray.length; i++){
			if(weaponsArray[i].type === shopName) {

				itemInShop = document.createElement("div");
				itemInShopImage = document.createElement("div");
				itemInShopDiscription = document.createElement("div");
				itemInShopText = document.createElement("span");

				itemInShop.setAttribute("class", "item clearfix");
				itemInShopImage.setAttribute("class", "image");
				itemInShopDiscription.setAttribute("class", "discription");
				itemInShopText.setAttribute("class", "desk");

				itemInShopImage.style.backgroundImage = "url(images/weapons/" + weaponsArray[i].image + ".png)";
				itemInShopText.innerHTML = "<strong>" + weaponsArray[i].name.charAt(0).toUpperCase() + weaponsArray[i].name.slice(1) + "</strong>"
																	+ "<br>Урон " + weaponsArray[i].damage + " / Стоимость " + weaponsArray[i].cost;

				itemInShop.appendChild(itemInShopImage);
				itemInShopDiscription.appendChild(itemInShopText);
				itemInShop.appendChild(itemInShopDiscription);

				itemInShop.addEventListener("click", chooseWeaponToBuy.bind(null, [itemInShop, weaponsArray[i]]), false);

				shop.appendChild(itemInShop);
			}
		}

		itemInShopBuy = document.createElement("div");
		itemInShopBuyItem = document.createElement("span");
		itemInShopBuy.setAttribute("class", "buy");
		itemInShopBuyItem.setAttribute("class", "buyItem");
		itemInShopBuyItem.innerHTML = "Купить";
		itemInShopBuy.appendChild(itemInShopBuyItem);
		itemInShopBuyItem.addEventListener("click", buyItem, false);
		shop.appendChild(itemInShopBuy);
	}

	function chooseWeaponToBuy(item){ // item = [itemInShop = document.createElement("div"), obj_weapon]
		var items = document.getElementsByClassName("item");

		for(i = 0; i < items.length; i++){
			items[i].setAttribute("class", "item clearfix");
		}

		item[0].setAttribute("class", "item itemChoose clearfix");

		weaponBuying = item[1];
	}

	function buyItem(){
		if(backpack.length < 8) {
			if(player.money >= weaponBuying.cost) {
				player.money -= weaponBuying.cost;
				backpack.push(weaponBuying);
				for(i = 0; i < weaponsArray.length; i++) {
					if(weaponsArray[i].id === weaponBuying.id) {
						weaponsArray.splice(i, 1);
					}
				}
				gameMessage = "Вы купили - " + weaponBuying.name;
				createShop();
				createBackPack();
			} else if(JSON.stringify(weaponBuying) == "{}") {
				gameMessage = "Вы не выбрали что покупать";
			} else {
				gameMessage = "У вас недостаточно средств чтобы купить - " + weaponBuying.name;
			}
		} else {
			gameMessage = "Ваш инвентарь полон!!!";
		}

		render();
		gameMessage = "";
		weaponBuying = {};
	}

 // --------------- Прорисовка рюкзака и его функциональность ---------------

 function createBackPack(start) {
 	for(i = 0; i < backpack.length; i++) {
 		if(tr_inv[i].lastChild === null) {
			imageBP = document.createElement("img");
	 		imageBP.src = "images/weapons/" + [backpack[i].image] + ".png";
	 		imageBP.style.backgroundSize = "80px 80px";
	 		imageBP.style.width = "80px";
	 		imageBP.style.height = "80px";
	 		imageBP.weapon = backpack[i];
	 		imageBP.addEventListener("click", chooseWeaponInventory.bind(null, imageBP), false)
	 		if(start === "start") {
		 		imageBP.setAttribute("class", "chooseWeapon");
		 		weapon = backpack[0];
		 	}
	 		tr_inv[i].appendChild(imageBP);
 		}
 	}
 }

 function chooseWeaponInventory(choose){
 	var items = document.getElementsByClassName("tr_inv");
		for(i = 0; i < items.length; i++){
			if(items[i].lastChild !== null) {
				items[i].lastChild.setAttribute("class", "");
			}
		}
		choose.setAttribute("class", "chooseWeapon");

		weapon = choose.weapon;

		if (dieEnemy === true)
		gameMessage = "Ваш урон - " + weapon.startDamage + " - " + (weapon.startDamage * 1.5 * (player.strong + 10) / 10);
		else
		gameMessage =  "На вас напал <strong>" + enemy.name + "</strong> " +
											enemy.lvl + " уровень<br>Его урон - " + enemy.damage + " - " + enemy.damage*1.5 +
											"<br>Ваш урон - " + weapon.startDamage + " - " + (weapon.startDamage * 1.5 * (player.strong + 10) / 10);
		render();
  }

  //////////////// Система боя //////////////////

	function attack(){
		if(dieEnemy === false) {
			gameMessage =  "На вас напал <strong>" + enemy.name + "</strong> " +
											enemy.lvl + " уровень<br>Его урон - " + enemy.damage + " - " + enemy.damage*1.5 +
											"<br>Ваш урон - " + weapon.startDamage + " - " + (weapon.startDamage * 1.5 * (player.strong + 10) / 10);
			weapon.power = +(1 + Math.random()/2).toFixed(1);
			weapon.damage = Math.ceil(weapon.startDamage * weapon.power * ((player.strong + 10) / 10));
			if(+(Math.random()).toFixed(1) < 0.1) {
				enemy.hp -= weapon.damage*2;
				gameMessage += "<br><i>Вы нанесли критический урон - " + weapon.damage*2 + " урона</i>";
			} else {
				enemy.hp -= weapon.damage;
				gameMessage += "<br><i>Вы ударили и нанесли - " + weapon.damage + " урона</i>";
			}

			widthEnemyBarHp = (enemy.hp / enemy.maxHp) * 100;

			if(enemy.hp <= 0) {
				dieEnemy = true;
				blockMove = false;
				player.money = Math.ceil(player.money + enemy.gold);
				player.exp = Math.ceil(player.exp + enemy.exp);
				gameMessage = "Вы победили <strong>" + enemy.name + "</strong>";
				enemy = {};
				if(player.exp >= player.nextLevel) levelUp();
			} else {
				player.hp = Math.ceil(player.hp - (enemy.damage * (+(1 + Math.random()/2).toFixed(1))));
			}
		}

		widthPlayerBarHp = (player.hp / player.maxHp) * 100; 

		hpEnemyBarLine.style.width = widthEnemyBarHp + "%";
		hpPlayerBarLine.style.width = widthPlayerBarHp + "%";

		if(player.hp <= 0) {
			endGame();
		}

	}

	function levelUp(n = 1){
		for(i = 0; i < n; i++){
			player.level++;
			player.strong += 1;
			player.vitality += Math.sqrt(player.level*player.level + player.level*2);
			player.exp = 0;
			player.nextLevel = Math.floor(player.nextLevel * 1.33);
			player.maxHp = Math.floor(player.vitality * 3.8);
			player.hp = player.maxHp;
			player.healPotion++;
			if(player.regenTime > 200) {
				player.regenTime -= 30;
			}
		}
	}

	function endGame(){
		gameMessage = "<strong>Вы проиграли. Вас убил " + enemy.name;
		document.getElementById("main").innerHTML = "<h1>Вы проирали</h1>";
		audio.pause();

	}

	function usePotion(){
		if(player.hp < player.maxHp) {
			player.healPotion--;
			player.hp = Math.ceil(player.hp + player.maxHp * 0.30);
			if(player.hp > player.maxHp) {
				player.hp = player.maxHp;
			}
		} else gameMessage = "У вас полное здоровье";
		render();
	}

	function createEnemy() {
		for(i = 0; i < enemyArray.length; i++) {
			if(mapLocation === enemyArray[i].mapLocation) {
				enemy = enemyArray[i].clone();
				enemy.lvl = player.level > enemy.level[1] ? enemy.level[1] : player.level < enemy.level[0] ? enemy.level[0] : player.level;
				enemy.hp += Math.ceil(enemy.hp * (enemy.lvl*0.3));
				console.log(enemy.damage, Math.ceil(enemy.damage * ((enemy.lvl + 10) / 10)))
				enemy.damage = Math.ceil(enemy.damage * ((enemy.lvl + 10) / 10));
				enemy.gold += Math.ceil(enemy.gold * (enemy.lvl*0.3));
				enemy.exp += Math.ceil(enemy.exp * (enemy.lvl*0.3));
				enemy.maxHp = enemy.hp;

				widthEnemyBarHp = 100;
				render();

				dieEnemy = false;
				blockMove = true;
				gameMessage =  "На вас напал <strong>" + enemy.name + "</strong> " +
											enemy.lvl + " уровень<br>Его урон - " + enemy.damage + " - " + enemy.damage*1.5 +
											"<br>Ваш урон - " + weapon.startDamage + " - " + (weapon.startDamage * 1.5 * (player.strong + 10) / 10);
			}
		}
	}


	function cheat(e) {
		if(e.keyCode === 37)
		levelUp();
		else if(e.keyCode === 39) {
			levelUp(100);
		}
	}


}());