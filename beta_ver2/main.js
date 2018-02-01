;(function(){

	var map = [
		"Лагерь крестоносцев", "Кабанья поляна(1-5)", "Густой лес(14-18)", "Долина змей(20-26)",
		"Волчья поляна(3-8)", "Дикая поляна(6-11)", "Заброшенный замок(24-28)", "Древний лагерь воинов",
		"Зловонная долина(8-13)", "Сектанское сборище(12-18)", "Болотная чаща(16-24)", "Заколдованное кладбище(23-29)",
		"Древнее кладбище(12-16)", "Пещера у горы(16-20)", "У подножия вулкана(30-38)", "Дракон(50)"
	],
	images = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
	blockedMessage = "Локация недоступна", mapLocation = 0, prevMapLocation = 0, playerInput = "", gameMessage = "",
	action = "",
	weaponsArray = [];

	standartWeaponsImages = ["hand", "sword", "forestAxe", "oldMace", "temperedSword", "enAxe", "mace", "spear",
													"rareSword", "axeMastery", "maceKnight", "spearSparta"],
	standartWeaponsInGame = ["кулак", "обычный меч", "лесной топор", "старая булава", "закаленный меч",
													"заточенный топор", "булава", "обычное копье", "редкий меч", "топор мастера",
													"булава рыцаря", "копье спартанца"],
	standartWeaponsAvailable = ["кулак", "обычный меч", "лесной топор", "старая булава", "закаленный меч",
													"заточенный топор", "булава", "обычное копье", "редкий меч", "топор мастера",
													"булава рыцаря", "копье спартанца"],
	standartWeaponsCost = [0, 10, 15, 20, 40, 50, 60, 80, 100, 120, 140, 200],
	standartWeaponsDamage = [3, 12, 15, 18, 25, 30, 36, 47, 55, 62, 70, 102],
	standartWeaponsLocation = 0,

	rareWeaponsImages = ["magicHand", "enchantedSword", "warAxe", "hellMace", "legendarySword"],
	rareWeaponsInGame = ['волшебная перчатка', "зачарованный меч", "боевой топор", "адская булава", "легендарный меч"],
	rareWeaponsAvailable = ['волшебная перчатка', "зачарованный меч", "боевой топор", "адская булава", "легендарный меч"],
	rareWeaponsCost = [300, 350, 400, 500, 1000],
	rareWeaponsDamage = [165, 194, 238, 312, 648],
	rareWeaponsLocation = 7,

	temp, tempI, tempC, tempD, tempM, // Для выюора standart или rare в функции createShop

	weaponBuying = "", weapon = "", weaponAttack = 0, weaponChoose,

	enemiesInGame = ["", "кабан", "оборотень", "змея-крыл", "волк", "дикий кабан", "некромант", "", "упырь",
									"падший маг", "огр", "древняя озлобленная душа", "скелет", "тролль", "адский шипокрыл", "дракон"],
	enemiesRewards = [[0, 0],[3,6],[16,32],[24,48],[6,12],[8,16],[26,52],[0,0],
										[10,20],[15,30],[20,40],[26,52],[14,28],[18,36],[34,68],[325, 650]],
	enemiesHp = [0,21,112,164,48,59,195,0,70,105,140,198, 98, 128, 280, 1845],
	enemiesDamage = [0, 12, 48, 72, 24, 32, 104, 0, 40, 60, 80, 104, 56, 72, 136, 1300],
	enemy = "", enemyDamage = 0, dieEnemy = true, enemyHp = 0, blockMove = false,

	maxHp = 35, hp = 35, level = 1, exp = 0, nextLevel = 30, money = 10, die = false, healPotion = 1,
	regen = false, regenInterval, regenTime = 1000;

	var moveTop = document.getElementById("circle_top"),
			moveRight = document.getElementById("circle_right"),
			moveDown = document.getElementById("circle_bottom"),
			moveLeft = document.getElementById("circle_left"),
			attackButton = document.getElementsByClassName("action")[0],
			usePotionButton = document.getElementsByClassName("action")[1],
			output = document.getElementById("output"),
			imageBlock = document.getElementById("image"),
			imageBackground = document.getElementById("bg"),
			infoPlayer = document.getElementById("info_player"),
			hpBar = document.getElementById("hp"),
			hpBarText = hpBar.firstChild,
			hpBarEnemy = document.getElementById("hpEnemy"),
			hpBarEnemyText = hpBarEnemy.firstChild,
			positionOnMap = document.getElementById("place");

	var shopBlock = document.getElementById("shop_border"),
			shop = document.getElementById("shop"),
			itemH2 = document.createElement("h2"),
			itemInShop, itemInShopImage, itemInShopDiscription, itemInShopText, itemInShopBuy, itemInShopBuyItem;

	itemH2.innerHTML = "Лавка";

	var backpack = [], tr_inv = document.getElementsByClassName('tr_inv'), imageBP;

	// (1) - rare/standart (2) - название оружия (3) - картинка (4) - стоимость (5) - урон
	addWeapon("standart", "кулак", 'hand', 0, 3);
	addWeapon("standart", "обычный меч", 'forestAxe', 10, 12);
	addWeapon("standart", "лесной топор", 'forestAxe', 15, 15);


	var mapDraw = document.getElementById("map"),
			map_player = document.getElementById("player"), size = 50, left_player = 25 - (size/2), top_player = 25 - (size/2);

	map_player.style.backgroundSize = size + "px " + size + "px";
	map_player.style.width = size + "px ";
	map_player.style.height = size + "px ";

	var audio = document.getElementsByTagName("audio")[0], audioChoose = 1, // 1 - Стандартная / 2 - Босс
			mute = 0, muteButton = document.getElementById("mute");
	audio.setAttribute("src", "audio/bg_music2.mp3");
	audio.play();
	audio.volume = 0.3;
	audio.addEventListener("ended", function(){ audio.currentTime = 0; audio.play(); }, false);

	moveTop.addEventListener("click", clickHandler.bind(null, "север"), false);
	moveRight.addEventListener("click", clickHandler.bind(null, "восток"), false);
	moveDown.addEventListener("click", clickHandler.bind(null, "юг"), false);
	moveLeft.addEventListener("click", clickHandler.bind(null, "запад"), false);

	attackButton.addEventListener("click", clickHandler.bind(null, "атаковать"), false);
	usePotionButton.addEventListener("click", clickHandler.bind(null, "выпить"), false);

	muteButton.addEventListener("click", muteFunc, false);

	backpack.push([standartWeaponsAvailable[0], standartWeaponsImages[0], standartWeaponsDamage[0]]);
	standartWeaponsAvailable.splice(0, 1);
	standartWeaponsImages.splice(0, 1);
	standartWeaponsDamage.splice(0, 1);
	standartWeaponsCost.splice(0, 1);

	render();
	createBackPack();


	function addWeapon(type, name, image, cost, damage, where) {
		var weapon = {
			type: type,
			name: name,
			image: image,
			cost: cost,
			damage: damage,
			where: where !== undefined ? where : "shop"
		};
		console.log("re");
		weaponsArray.push(weapon);
		console.log(weaponsArray.length);
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
		weaponBuying = "";
		temp = "", tempC = "", tempI = "", tempD = "";
		itemInShop = "", itemInShopImage = "", itemInShopText = "", itemInShopDiscription = "", itemInShopBuyItem = "", itemInShopBuy = "";
		prevMapLocation = mapLocation;

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
				else gameMessage = "С начала убейте " + enemy;
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
				else gameMessage = "С начала убейте " + enemy;
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
				else gameMessage = "С начала убейте " + enemy;
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
				else gameMessage = "С начала убейте " + enemy;
				break;
			case "атаковать":
				if(mapLocation === 0 || mapLocation === 7) { gameMessage = "Здесь не с кем сражаться"; }
				else attack();
				break;
			case "выпить":
				if(hp < maxHp) { usePotion() }
				else gameMessage = "У вас полное здоровье";
				break;
			default: gameMessage = "Я не знаю такого действия"; break;
		}

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


		if((mapLocation !== 0 && mapLocation !== 7) && dieEnemy === true && prevMapLocation !== mapLocation) {
			enemy = enemiesInGame[mapLocation];
			enemyDamage = enemiesDamage[mapLocation];
			enemyHp = enemiesHp[mapLocation];
			dieEnemy = false;
			blockMove = true;
			gameMessage = "На вас напал " + enemy +"<br> его урон - " + enemyDamage;
		}

		if(dieEnemy === false){
			if(regen === true) clearInterval(regenInterval);
			regen = false;
		} else if(dieEnemy === true && regen === false) {
			regen = true;
			regenInterval = setInterval(function(){
				if(hp < maxHp){
					hp++;
					hpBarText.innerHTML = "Мои жизни - " + hp + " / " + maxHp;
				} else {
					clearInterval(regenInterval);
					regen = false;
				}
			},regenTime)
		}

		render();
	}

	function render(){
		output.innerHTML = gameMessage;
		infoPlayer.innerHTML = "Уровень " + level + ", Опыт " + exp + "/" + nextLevel + ", Монеты " + money;
		positionOnMap.innerHTML = map[mapLocation];
		image.src = "images/locations/" + images[mapLocation] + ".jpg";
		imageBackground.style.backgroundImage = "url(images/locations/" + images[mapLocation] + ".jpg)";

		hpBarText.innerHTML = "Мои жизни - " + hp + " / " + maxHp;
		if(dieEnemy === true) {hpBarEnemy.style.display = "none";}
		else { hpBarEnemy.style.display = "block"; hpBarEnemyText.innerHTML = "Жизни " + enemy + " - " + enemyHp + " / " + enemiesHp[mapLocation];}

		if(mapLocation === 0 || mapLocation === 7) { shopBlock.style.display = "block"; createShop(); }
		else { shopBlock.style.display = "none"; }

		map_player.style.left = left_player + "px";
		map_player.style.top = top_player + "px";
	}

	// --------------- Покупка Оружия и прорисовка магазина ---------------

	function createShop() {
		if(itemInShopBuyItem) itemInShopBuyItem.removeEventListener("click", buyItem, false);
		if (mapLocation === 0) {
			temp = standartWeaponsAvailable;
			tempM = standartWeaponsInGame;
			tempI = standartWeaponsImages;
			tempD = standartWeaponsDamage;
			tempC = standartWeaponsCost;
		}
		else if (mapLocation === 7) {
			temp = rareWeaponsAvailable;
			tempM = rareWeaponsInGame;
			tempI = rareWeaponsImages;
			tempD = rareWeaponsDamage;
			tempC = rareWeaponsCost;
		}

		shop.innerHTML = "";
		shop.appendChild(itemH2);
		for(i = 0; i < temp.length; i++){
			itemInShop = document.createElement("div");
			itemInShopImage = document.createElement("div");
			itemInShopDiscription = document.createElement("div");
			itemInShopText = document.createElement("span");

			itemInShop.setAttribute("class", "item clearfix");
			itemInShopImage.setAttribute("class", "image");
			itemInShopDiscription.setAttribute("class", "discription");
			itemInShopText.setAttribute("class", "desk");

			itemInShopImage.style.backgroundImage = "url(images/weapons/" + tempI[i] + ".png)";
			itemInShopText.innerHTML = "<strong>" + temp[i].charAt(0).toUpperCase() + temp[i].slice(1) + "</strong>"
																+ "<br>Урон " + tempD[i] + " / Стоимость " + tempC[i];

			itemInShop.appendChild(itemInShopImage);
			itemInShopDiscription.appendChild(itemInShopText);
			itemInShop.appendChild(itemInShopDiscription);

			var query = [itemInShop, temp[i]];
			itemInShop.addEventListener("click", chooseWeapon.bind(null, query, false));

			shop.appendChild(itemInShop);
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

	function buyItem(){
		var indexWeaponValue = temp.indexOf(weaponBuying);
		if(money >= tempC[indexWeaponValue]) {
			money -= tempC[indexWeaponValue];
			backpack.push([temp[indexWeaponValue], tempI[indexWeaponValue], tempD[indexWeaponValue]]);
			temp.splice(indexWeaponValue, 1);
			tempI.splice(indexWeaponValue, 1);
			tempD.splice(indexWeaponValue, 1);
			tempC.splice(indexWeaponValue, 1);
			gameMessage = "Вы купили - " + weaponBuying;
			createShop();
			createBackPack();
		} else if(weaponBuying === "") {
			gameMessage = "Вы не выбрали что покупать";
		} else {
			gameMessage = "У вас недостаточно средств чтобы купить - " + weaponBuying;
		}

		render();
		gameMessage = "";
		weaponBuying = "";
	}

	function chooseWeapon(item){
		var items = document.getElementsByClassName("item");
		for(i = 0; i < items.length; i++){
			items[i].setAttribute("class", "item clearfix");
		}
		item[0].setAttribute("class", "item itemChoose clearfix");
		weaponBuying = item[1];
	}

 // --------------- Прорисовка рюкзака и его функциональность ---------------

 function createBackPack() {
 	for(i = 0; i < backpack.length; i++) {
 		if(tr_inv[i].lastChild === null) {
			imageBP = document.createElement("img");
	 		imageBP.src = "images/weapons/" + [backpack[i][1]] + ".png";
	 		imageBP.style.backgroundSize = "80px 80px";
	 		imageBP.style.width = "80px";
	 		imageBP.style.height = "80px";
	 		imageBP.addEventListener("click", chouseWeapon.bind(null, imageBP), false)
	 		tr_inv[i].appendChild(imageBP);
 		}
 	}
 }

 function chouseWeapon(choose){
 	var items = document.getElementsByClassName("tr_inv");
		for(i = 0; i < items.length; i++){
			if(items[i].lastChild !== null) {
				items[i].lastChild.setAttribute("class", "");
			}
		}
		choose.setAttribute("class", "chooseWeapon");
		weaponChoose = choose.src.slice(choose.src.lastIndexOf("/")+1).replace(".png", "");
		var index;
		for(i = 0; i < backpack.length; i++){
			if(backpack[i].indexOf(weaponChoose) !== -1) {
				index = i;
			}
		}
		weapon = backpack[index][0];
		weaponAttack = backpack[index][2];
  }

  //////////////// Система боя //////////////////

	function attack(){
		if(dieEnemy === false) {
			gameMessage = "На вас напал " + enemy +"<br> его урон - " + enemyDamage + "<br>Вы его ударили и нанесли " + weaponAttack + " урона"
			enemyHp -= weaponAttack;
			if(enemyHp <= 0) {
				dieEnemy = true;
				blockMove = false;
				money += enemiesRewards[mapLocation][0];
				exp += enemiesRewards[mapLocation][1];
				if(exp >= nextLevel) levelUp();
			} else {
				hp -= enemyDamage;
			}
		}

		if(hp <= 0) {
			endGame();
		}

	}

	function levelUp(){
		level++;
		exp = 0;
		nextLevel = Math.floor(nextLevel * 1.33);
		maxHp = Math.floor(maxHp * 1.44);
		hp = maxHp;
		if(regenTime > 200) {
			regenTime -= 30;
		}
	}

	function endGame(){
		gameMessage = "<strong>Вы проиграли. Вас убил " + enemy;
		document.getElementById("main").innerHTML = "<h1>Вы проирали</h1>";
		audio.pause();

	}

	function usePotion(){
		if(hp < maxHp) {
			hp += maxHp * 0.30;
			if(hp > maxHp) {
				hp = maxHp;
			}
		}
	}


}());