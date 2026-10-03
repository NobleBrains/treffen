/**
 * Amogolie / Monopoly - Modular Board Editions Configuration
 * Supports multiple board designs (Deutschland Klassisch, Wilhelmshaven, Classic US)
 * Easily extensible by adding new editions to window.BOARD_EDITIONS.
 */

function Square(name, pricetext, color, price, groupNumber, baserent, rent1, rent2, rent3, rent4, rent5, type, icon) {
	this.name = name;
	this.pricetext = pricetext;
	this.color = color;
	this.owner = 0;
	this.mortgage = false;
	this.house = 0;
	this.hotel = 0;
	this.groupNumber = groupNumber || 0;
	this.price = (price || 0);
	this.baserent = (baserent || 0);
	this.rent1 = (rent1 || 0);
	this.rent2 = (rent2 || 0);
	this.rent3 = (rent3 || 0);
	this.rent4 = (rent4 || 0);
	this.rent5 = (rent5 || 0);
	this.landcount = 0;
	this.type = type || 'property';
	this.icon = icon || '';

	if (groupNumber === 3 || groupNumber === 4) {
		this.houseprice = 50;
	} else if (groupNumber === 5 || groupNumber === 6) {
		this.houseprice = 100;
	} else if (groupNumber === 7 || groupNumber === 8) {
		this.houseprice = 150;
	} else if (groupNumber === 9 || groupNumber === 10) {
		this.houseprice = 200;
	} else {
		this.houseprice = 0;
	}
}

function Card(text, action) {
	this.text = text;
	this.action = action;
}

function corrections() {
	// Custom post-init cell adjustments if needed
}

function utiltext() {
	var curr = (window.currentEditionData && window.currentEditionData.currency) || "DM";
	return '&nbsp;&nbsp;&nbsp;&nbsp;Wenn 1 Werk im Besitz: Miete ist das 4-fache der gewürfelten Augen.<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;Wenn beide Werke im Besitz: Miete ist das 10-fache der gewürfelten Augen.';
}

function transtext() {
	var curr = (window.currentEditionData && window.currentEditionData.currency) || "DM";
	return '<div style="font-size: 13px; line-height: 1.5;">Miete: <span style="float: right;">25 ' + curr + '</span><br />Wenn 2 Bahnhöfe besessen: <span style="float: right;">50 ' + curr + '</span><br />Wenn 3 Bahnhöfe besessen: <span style="float: right;">100 ' + curr + '</span><br />Wenn 4 Bahnhöfe besessen: <span style="float: right;">200 ' + curr + '</span></div>';
}

function luxurytax() {
	var curr = (window.currentEditionData && window.currentEditionData.currency) || "DM";
	var name = (window.currentEditionData && window.currentEditionData.taxLuxuryName) || "Zusatzsteuer";
	addAlert(player[turn].name + " hat 100 " + curr + " für " + name + " bezahlt.");
	player[turn].pay(100, 0);
	$("#landed").show().text("Du bist auf " + name + " gelandet. Zahle 100 " + curr + ".");
}

function citytax() {
	var curr = (window.currentEditionData && window.currentEditionData.currency) || "DM";
	var name = (window.currentEditionData && window.currentEditionData.taxCityName) || "Einkommensteuer";
	addAlert(player[turn].name + " hat 200 " + curr + " für " + name + " bezahlt.");
	player[turn].pay(200, 0);
	$("#landed").show().text("Du bist auf " + name + " gelandet. Zahle 200 " + curr + ".");
}

window.BOARD_EDITIONS = {
	"deutschland": {
		id: "deutschland",
		name: "🇩🇪 Deutschland (Klassisch)",
		currency: "DM",
		taxCityName: "Einkommensteuer",
		taxLuxuryName: "Zusatzsteuer",
		centerLogo: "MONOPOLY",
		centerSub: "Das klassische Spiel um die großen Vermögen",
		squares: [
			// 0
			new Square("LOS", "ZIEHE IM VORBEIGEHEN 200 DM EIN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "go", "images/arrow_icon.png"),
			// 1
			new Square("Badstraße", "60 DM", "#764227", 60, 3, 2, 10, 30, 90, 160, 250, "property"),
			// 2
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			// 3
			new Square("Turmstraße", "60 DM", "#764227", 60, 3, 4, 20, 60, 180, 320, 450, "property"),
			// 4
			new Square("Einkommensteuer", "ZAHLE 200 DM", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			// 5
			new Square("Südbahnhof", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			// 6
			new Square("Chausseestraße", "100 DM", "#9dd5f3", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			// 7
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			// 8
			new Square("Elisenstraße", "100 DM", "#9dd5f3", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			// 9
			new Square("Poststraße", "120 DM", "#9dd5f3", 120, 4, 8, 40, 100, 300, 450, 600, "property"),
			// 10
			new Square("Gefängnis", "NUR ZU BESUCH", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "jail", "images/jake_icon.png"),
			// 11
			new Square("Seestraße", "140 DM", "#df348e", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			// 12
			new Square("Elektrizitätswerk", "150 DM", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/electric_icon.png"),
			// 13
			new Square("Hafenstraße", "140 DM", "#df348e", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			// 14
			new Square("Neue Straße", "160 DM", "#df348e", 160, 5, 12, 60, 180, 500, 700, 900, "property"),
			// 15
			new Square("Westbahnhof", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			// 16
			new Square("Münchner Straße", "180 DM", "#f7931e", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			// 17
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			// 18
			new Square("Wiener Straße", "180 DM", "#f7931e", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			// 19
			new Square("Berliner Straße", "200 DM", "#f7931e", 200, 6, 16, 80, 220, 600, 800, 1000, "property"),
			// 20
			new Square("Frei Parken", "", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "parking", "images/free_parking_icon.png"),
			// 21
			new Square("Theaterstraße", "220 DM", "#ed1b24", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			// 22
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			// 23
			new Square("Museumstraße", "220 DM", "#ed1b24", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			// 24
			new Square("Opernplatz", "240 DM", "#ed1b24", 240, 7, 20, 100, 300, 750, 925, 1100, "property"),
			// 25
			new Square("Nordbahnhof", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			// 26
			new Square("Lessingstraße", "260 DM", "#fef200", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			// 27
			new Square("Schillerstraße", "260 DM", "#fef200", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			// 28
			new Square("Wasserwerk", "150 DM", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/water_icon.png"),
			// 29
			new Square("Goethestraße", "280 DM", "#fef200", 280, 8, 24, 120, 360, 850, 1025, 1200, "property"),
			// 30
			new Square("Gehe ins Gefängnis", "BEGIB DICH DIREKT INS GEFÄNGNIS", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "gotojail", "images/jake_icon.png"),
			// 31
			new Square("Rathausplatz", "300 DM", "#1fb25a", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			// 32
			new Square("Hauptstraße", "300 DM", "#1fb25a", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			// 33
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			// 34
			new Square("Bahnhofstraße", "320 DM", "#1fb25a", 320, 9, 28, 150, 450, 1000, 1200, 1400, "property"),
			// 35
			new Square("Hauptbahnhof", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			// 36
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			// 37
			new Square("Parkstraße", "350 DM", "#0072bb", 350, 10, 35, 175, 500, 1100, 1300, 1500, "property"),
			// 38
			new Square("Zusatzsteuer", "ZAHLE 100 DM", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			// 39
			new Square("Schlossallee", "400 DM", "#0072bb", 400, 10, 50, 200, 600, 1400, 1700, 2000, "property")
		],
		communityChestCards: [
			new Card("Komm kostenlos aus dem Gefängnis frei. Diese Karte kann behalten oder verkauft werden.", function(p) { p.communityChestJailCard = true; updateOwned(); }),
			new Card("Du hast den 2. Preis in einer Schönheitskonkurrenz gewonnen. Ziehe 10 DM ein.", function() { addamount(10, 'Gemeinschaft'); }),
			new Card("Aus dem Verkauf von Aktien erhältst du 50 DM.", function() { addamount(50, 'Gemeinschaft'); }),
			new Card("Deine Lebensversicherung wird fällig. Ziehe 100 DM ein.", function() { addamount(100, 'Gemeinschaft'); }),
			new Card("Einkommensteuer-Rückerstattung. Ziehe 20 DM ein.", function() { addamount(20, 'Gemeinschaft'); }),
			new Card("Weihnachtsgeld erhalten. Ziehe 100 DM ein.", function() { addamount(100, 'Gemeinschaft'); }),
			new Card("Du erbst 100 DM.", function() { addamount(100, 'Gemeinschaft'); }),
			new Card("Beratungshonorar erhalten. Ziehe 25 DM ein.", function() { addamount(25, 'Gemeinschaft'); }),
			new Card("Krankenhauskosten. Zahle 100 DM.", function() { subtractamount(100, 'Gemeinschaft'); }),
			new Card("Bank-Irrtum zu deinen Gunsten. Ziehe 200 DM ein.", function() { addamount(200, 'Gemeinschaft'); }),
			new Card("Schulgeld bezahlen. Zahle 50 DM.", function() { subtractamount(50, 'Gemeinschaft'); }),
			new Card("Arztrechnung. Zahle 50 DM.", function() { subtractamount(50, 'Gemeinschaft'); }),
			new Card("Es ist dein Geburtstag. Jeder Mitspieler schenkt dir 10 DM.", function() { collectfromeachplayer(10, 'Gemeinschaft'); }),
			new Card("Rücke vor bis auf LOS (Ziehe 200 DM ein).", function() { advance(0); }),
			new Card("Straßenausbesserung: Zahle für jedes Haus 40 DM, für jedes Hotel 115 DM.", function() { streetrepairs(40, 115); }),
			new Card("Gehe direkt in das Gefängnis. Begib dich direkt dorthin. Gehe nicht über LOS. Ziehe nicht 200 DM ein.", function() { gotojail(); })
		],
		chanceCards: [
			new Card("Komm kostenlos aus dem Gefängnis frei. Diese Karte kann behalten oder verkauft werden.", function(p) { p.chanceJailCard = true; updateOwned(); }),
			new Card("Renovierungsarbeiten: Zahle für jedes Haus 25 DM, für jedes Hotel 100 DM.", function() { streetrepairs(25, 100); }),
			new Card("Strafe wegen zu schnellen Fahrens: 15 DM.", function() { subtractamount(15, 'Ereignis'); }),
			new Card("Du wurdest zum Vorstandsvorsitzenden gewählt. Zahle jedem Spieler 50 DM.", function() { payeachplayer(50, 'Ereignis'); }),
			new Card("Gehe 3 Felder zurück.", function() { gobackthreespaces(); }),
			new Card("Rücke vor bis zum nächsten Versorgungswerk. Ist es noch frei, kannst du es von der Bank kaufen.", function() { advanceToNearestUtility(); }),
			new Card("Die Bank zahlt dir eine Dividende von 50 DM.", function() { addamount(50, 'Ereignis'); }),
			new Card("Rücke vor bis zum nächsten Bahnhof. Ist er noch frei, kannst du ihn von der Bank kaufen.", function() { advanceToNearestRailroad(); }),
			new Card("Armensteuer: Zahle 15 DM.", function() { subtractamount(15, 'Ereignis'); }),
			new Card("Mache einen Ausflug zum Südbahnhof. Wenn du über LOS kommst, ziehe 200 DM ein.", function() { advance(5); }),
			new Card("Rücke vor bis zur Schlossallee.", function() { advance(39); }),
			new Card("Rücke vor bis zum Opernplatz. Wenn du über LOS kommst, ziehe 200 DM ein.", function() { advance(24); }),
			new Card("Dein Bausparvertrag wird fällig. Ziehe 150 DM ein.", function() { addamount(150, 'Ereignis'); }),
			new Card("Rücke vor bis zum nächsten Bahnhof.", function() { advanceToNearestRailroad(); }),
			new Card("Rücke vor bis zur Seestraße. Wenn du über LOS kommst, ziehe 200 DM ein.", function() { advance(11); }),
			new Card("Gehe direkt in das Gefängnis. Begib dich direkt dorthin. Gehe nicht über LOS. Ziehe nicht 200 DM ein.", function() { gotojail(); })
		]
	},

	"wilhelmshaven": {
		id: "wilhelmshaven",
		name: "⚓ Wilhelmshaven Edition",
		currency: "DM",
		taxCityName: "Hafengebühr",
		taxLuxuryName: "Kurtaxe",
		centerLogo: "WILHELMSHAVEN",
		centerSub: "Die Nordseestadt am Jadebusen",
		squares: [
			new Square("LOS", "ZIEHE IM VORBEIGEHEN 200 DM EIN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "go", "images/arrow_icon.png"),
			new Square("Südstrand", "60 DM", "#764227", 60, 3, 2, 10, 30, 90, 160, 250, "property"),
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("Bontekai", "60 DM", "#764227", 60, 3, 4, 20, 60, 180, 320, 450, "property"),
			new Square("Hafengebühr", "ZAHLE 200 DM", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			new Square("Südstrandbahn", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Rheinstraße", "100 DM", "#9dd5f3", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Gökerstraße", "100 DM", "#9dd5f3", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			new Square("Ebertstraße", "120 DM", "#9dd5f3", 120, 4, 8, 40, 100, 300, 450, 600, "property"),
			new Square("Gefängnis", "NUR ZU BESUCH", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "jail", "images/jake_icon.png"),
			new Square("Virchowstraße", "140 DM", "#df348e", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			new Square("GEW Strom", "150 DM", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/electric_icon.png"),
			new Square("Bismarckstraße", "140 DM", "#df348e", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			new Square("Mozartstraße", "160 DM", "#df348e", 160, 5, 12, 60, 180, 500, 700, 900, "property"),
			new Square("Marinehafen", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Banter Weg", "180 DM", "#f7931e", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("Friedrich-Paffrath-Str.", "180 DM", "#f7931e", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			new Square("Preußenstraße", "200 DM", "#f7931e", 200, 6, 16, 80, 220, 600, 800, 1000, "property"),
			new Square("Frei Parken", "", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "parking", "images/free_parking_icon.png"),
			new Square("Posener Straße", "220 DM", "#ed1b24", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Marktstraße", "220 DM", "#ed1b24", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			new Square("Parkstraße WHV", "240 DM", "#ed1b24", 240, 7, 20, 100, 300, 750, 925, 1100, "property"),
			new Square("Hauptbahnhof WHV", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Kurpark", "260 DM", "#fef200", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			new Square("Valoisplatz", "260 DM", "#fef200", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			new Square("OOWV Wasser", "150 DM", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/water_icon.png"),
			new Square("Rathausplatz WHV", "280 DM", "#fef200", 280, 8, 24, 120, 360, 850, 1025, 1200, "property"),
			new Square("Gehe ins Gefängnis", "BEGIB DICH DIREKT INS GEFÄNGNIS", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "gotojail", "images/jake_icon.png"),
			new Square("Fliegerdeich", "300 DM", "#1fb25a", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			new Square("Helgolandkai", "300 DM", "#1fb25a", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			new Square("Gemeinschaftsfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("JadeWeserPort", "320 DM", "#1fb25a", 320, 9, 28, 150, 450, 1000, 1200, 1400, "property"),
			new Square("KW-Brücke", "200 DM", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Ereignisfeld", "FOLGE DEN ANWEISUNGEN", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Ölhafen", "350 DM", "#0072bb", 350, 10, 35, 175, 500, 1100, 1300, 1500, "property"),
			new Square("Kurtaxe", "ZAHLE 100 DM", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			new Square("Strandpromenade", "400 DM", "#0072bb", 400, 10, 50, 200, 600, 1400, 1700, 2000, "property")
		],
		communityChestCards: null, // Will inherit German cards
		chanceCards: null
	},

	"classic_us": {
		id: "classic_us",
		name: "🇺🇸 US Classic (Atlantic City)",
		currency: "$",
		taxCityName: "City Tax",
		taxLuxuryName: "Luxury Tax",
		centerLogo: "MONOPOLY",
		centerSub: "Fast-Dealing Property Trading Game",
		squares: [
			new Square("GO", "COLLECT $200 SALARY AS YOU PASS.", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "go", "images/arrow_icon.png"),
			new Square("Mediterranean Avenue", "$60", "#8B4513", 60, 3, 2, 10, 30, 90, 160, 250, "property"),
			new Square("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("Baltic Avenue", "$60", "#8B4513", 60, 3, 4, 20, 60, 180, 320, 450, "property"),
			new Square("City Tax", "Pay $200", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			new Square("Reading Railroad", "$200", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Oriental Avenue", "$100", "#87CEEB", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			new Square("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Vermont Avenue", "$100", "#87CEEB", 100, 4, 6, 30, 90, 270, 400, 550, "property"),
			new Square("Connecticut Avenue", "$120", "#87CEEB", 120, 4, 8, 40, 100, 300, 450, 600, "property"),
			new Square("Just Visiting", "", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "jail", "images/jake_icon.png"),
			new Square("St. Charles Place", "$140", "#FF0080", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			new Square("Electric Company", "$150", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/electric_icon.png"),
			new Square("States Avenue", "$140", "#FF0080", 140, 5, 10, 50, 150, 450, 625, 750, "property"),
			new Square("Virginia Avenue", "$160", "#FF0080", 160, 5, 12, 60, 180, 500, 700, 900, "property"),
			new Square("Pennsylvania Railroad", "$200", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("St. James Place", "$180", "#FFA500", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			new Square("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("Tennessee Avenue", "$180", "#FFA500", 180, 6, 14, 70, 200, 550, 750, 950, "property"),
			new Square("New York Avenue", "$200", "#FFA500", 200, 6, 16, 80, 220, 600, 800, 1000, "property"),
			new Square("Free Parking", "", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "parking", "images/free_parking_icon.png"),
			new Square("Kentucky Avenue", "$220", "#FF0000", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			new Square("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Indiana Avenue", "$220", "#FF0000", 220, 7, 18, 90, 250, 700, 875, 1050, "property"),
			new Square("Illinois Avenue", "$240", "#FF0000", 240, 7, 20, 100, 300, 750, 925, 1100, "property"),
			new Square("B&O Railroad", "$200", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Atlantic Avenue", "$260", "#FFFF00", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			new Square("Ventnor Avenue", "$260", "#FFFF00", 260, 8, 22, 110, 330, 800, 975, 1150, "property"),
			new Square("Water Works", "$150", "#FFFFFF", 150, 2, 0, 0, 0, 0, 0, 0, "utility", "images/water_icon.png"),
			new Square("Marvin Gardens", "$280", "#FFFF00", 280, 8, 24, 120, 360, 850, 1025, 1200, "property"),
			new Square("Go to Jail", "Go directly to Jail. Do not pass GO. Do not collect $200.", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "gotojail", "images/jake_icon.png"),
			new Square("Pacific Avenue", "$300", "#008000", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			new Square("North Carolina Avenue", "$300", "#008000", 300, 9, 26, 130, 390, 900, 1100, 1275, "property"),
			new Square("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chest", "images/community_chest_icon.png"),
			new Square("Pennsylvania Avenue", "$320", "#008000", 320, 9, 28, 150, 450, 1000, 1200, 1400, "property"),
			new Square("Short Line", "$200", "#FFFFFF", 200, 1, 0, 0, 0, 0, 0, 0, "railroad", "images/train_icon.png"),
			new Square("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "chance", "images/chance_icon.png"),
			new Square("Park Place", "$350", "#0000FF", 350, 10, 35, 175, 500, 1100, 1300, 1500, "property"),
			new Square("LUXURY TAX", "Pay $100", "#FFFFFF", 0, 0, 0, 0, 0, 0, 0, 0, "tax", "images/tax_icon.png"),
			new Square("Boardwalk", "$400", "#0000FF", 400, 10, 50, 200, 600, 1400, 1700, 2000, "property")
		],
		communityChestCards: [
			new Card("Get out of Jail, Free. This card may be kept until needed or sold.", function(p) { p.communityChestJailCard = true; updateOwned();}),
			new Card("You have won second prize in a beauty contest. Collect $10.", function() { addamount(10, 'Community Chest');}),
			new Card("From sale of stock, you get $50.", function() { addamount(50, 'Community Chest');}),
			new Card("Life insurance matures. Collect $100.", function() { addamount(100, 'Community Chest');}),
			new Card("Income tax refund. Collect $20.", function() { addamount(20, 'Community Chest');}),
			new Card("Holiday fund matures. Receive $100.", function() { addamount(100, 'Community Chest');}),
			new Card("You inherit $100.", function() { addamount(100, 'Community Chest');}),
			new Card("Receive $25 consultancy fee.", function() { addamount(25, 'Community Chest');}),
			new Card("Pay hospital fees of $100.", function() { subtractamount(100, 'Community Chest');}),
			new Card("Bank error in your favor. Collect $200.", function() { addamount(200, 'Community Chest');}),
			new Card("Pay school fees of $50.", function() { subtractamount(50, 'Community Chest');}),
			new Card("Doctor's fee. Pay $50.", function() { subtractamount(50, 'Community Chest');}),
			new Card("It is your birthday. Collect $10 from every player.", function() { collectfromeachplayer(10, 'Community Chest');}),
			new Card("Advance to \"GO\" (Collect $200).", function() { advance(0);}),
			new Card("You are assessed for street repairs. $40 per house. $115 per hotel.", function() { streetrepairs(40, 115);}),
			new Card("Go to Jail. Go directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();})
		],
		chanceCards: [
			new Card("GET OUT OF JAIL FREE. This card may be kept until needed or traded.", function(p) { p.chanceJailCard=true; updateOwned();}),
			new Card("Make General Repairs on All Your Property. For each house pay $25. For each hotel $100.", function() { streetrepairs(25, 100);}),
			new Card("Speeding fine $15.", function() { subtractamount(15, 'Chance');}),
			new Card("You have been elected chairman of the board. Pay each player $50.", function() { payeachplayer(50, 'Chance');}),
			new Card("Go back three spaces.", function() { gobackthreespaces();}),
			new Card("ADVANCE TO THE NEAREST UTILITY. IF UNOWNED, you may buy it from the Bank. IF OWNED, throw dice and pay owner a total ten times the amount thrown.", function() { advanceToNearestUtility();}),
			new Card("Bank pays you dividend of $50.", function() { addamount(50, 'Chance');}),
			new Card("ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.", function() { advanceToNearestRailroad();}),
			new Card("Pay poor tax of $15.", function() { subtractamount(15, 'Chance');}),
			new Card("Take a trip to Reading Rail Road. If you pass \"GO\" collect $200.", function() { advance(5);}),
			new Card("ADVANCE to Boardwalk.", function() { advance(39);}),
			new Card("ADVANCE to Illinois Avenue. If you pass \"GO\" collect $200.", function() { advance(24);}),
			new Card("Your building loan matures. Collect $150.", function() { addamount(150, 'Chance');}),
			new Card("ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.", function() { advanceToNearestRailroad();}),
			new Card("ADVANCE to St. Charles Place. If you pass \"GO\" collect $200.", function() { advance(11);}),
			new Card("Go to Jail. Go Directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();})
		]
	}
};

// Global square array expected by monopoly.js
var square = [];
var communityChestCards = [];
var chanceCards = [];

function loadBoardEdition(editionId) {
	var ed = window.BOARD_EDITIONS[editionId] || window.BOARD_EDITIONS["deutschland"];
	window.currentEditionData = ed;
	window.currentEdition = ed.id;

	// Copy squares
	square = [];
	for (var i = 0; i < ed.squares.length; i++) {
		var s = ed.squares[i];
		var sq = new Square(s.name, s.pricetext, s.color, s.price, s.groupNumber, s.baserent, s.rent1, s.rent2, s.rent3, s.rent4, s.rent5, s.type, s.icon);
		sq.index = i;
		square.push(sq);
	}

	// Group assignments
	var groupPropertyArray = [];
	for (var i = 0; i < 40; i++) {
		var gn = square[i].groupNumber;
		if (gn > 0) {
			if (!groupPropertyArray[gn]) groupPropertyArray[gn] = [];
			groupPropertyArray[gn].push(i);
		}
	}
	for (var i = 0; i < 40; i++) {
		var gn = square[i].groupNumber;
		if (gn > 0) square[i].group = groupPropertyArray[gn];
	}

	// Cards
	var chest = ed.communityChestCards || window.BOARD_EDITIONS["deutschland"].communityChestCards;
	var chance = ed.chanceCards || window.BOARD_EDITIONS["deutschland"].chanceCards;

	communityChestCards = [];
	for (var i = 0; i < chest.length; i++) {
		communityChestCards.push(new Card(chest[i].text, chest[i].action));
	}
	chanceCards = [];
	for (var i = 0; i < chance.length; i++) {
		chanceCards.push(new Card(chance[i].text, chance[i].action));
	}

	communityChestCards.deck = [];
	chanceCards.deck = [];
	for (var i = 0; i < 16; i++) {
		communityChestCards.deck[i] = i;
		chanceCards.deck[i] = i;
	}
	chanceCards.deck.sort(function() { return Math.random() - 0.5; });
	communityChestCards.deck.sort(function() { return Math.random() - 0.5; });
	communityChestCards.index = 0;
	chanceCards.index = 0;

	// Update DOM if already initialized
	if (document.getElementById("cell0")) {
		updateBoardDOM(ed);
	}

	// Apply custom board graphic skin if defined
	if (typeof window.setBoardGraphic === "function") {
		window.setBoardGraphic(ed.boardImage || "");
	}
}

function updateBoardDOM(ed) {
	for (var i = 0; i < 40; i++) {
		var s = square[i];
		var cellNameEl = document.getElementById("cell" + i + "name");
		if (cellNameEl) {
			cellNameEl.textContent = s.name;
		}
		var priceEl = document.getElementById("cell" + i + "price");
		if (priceEl) {
			priceEl.textContent = s.pricetext;
		}
		var colorBar = document.getElementById("cell" + i + "colorbar");
		if (colorBar && s.groupNumber >= 3) {
			colorBar.style.backgroundColor = s.color;
		}
		var iconEl = document.querySelector("#cell" + i + "anchor .cell-icon");
		if (iconEl && s.icon) {
			iconEl.src = s.icon;
		}

		// Update enlarge popups
		var enlargeColor = document.getElementById("enlarge" + i + "color");
		if (enlargeColor) enlargeColor.style.backgroundColor = s.color;
		var enlargeName = document.getElementById("enlarge" + i + "name");
		if (enlargeName) enlargeName.textContent = s.name;
		var enlargePrice = document.getElementById("enlarge" + i + "price");
		if (enlargePrice) enlargePrice.textContent = s.pricetext;
	}

	// Update center branding
	var centerLogoEl = document.getElementById("center-brand-logo");
	if (centerLogoEl) centerLogoEl.textContent = ed.centerLogo;
	var centerSubEl = document.getElementById("center-brand-sub");
	if (centerSubEl) centerSubEl.textContent = ed.centerSub;
}

window.renderBoardHouses = function() {
	for (var i = 0; i < 40; i++) {
		var hHolder = document.getElementById("cell" + i + "houses");
		if (!hHolder) continue;
		var sq = square[i];
		var html = "";
		if (sq.hotel === 1) {
			html = "<img src='images/hotel.png' class='board-hotel' title='Hotel' />";
		} else if (sq.house > 0) {
			for (var h = 0; h < sq.house; h++) {
				html += "<img src='images/house.png' class='board-house' title='Haus' />";
			}
		}
		hHolder.innerHTML = html;
	}
};

// Fetch dynamic custom editions from backend /api/editions
window.fetchCustomEditions = function() {
	if (typeof fetch !== "function") return;
	fetch('api/editions')
		.then(function(res) { return res.json(); })
		.then(function(customList) {
			if (!Array.isArray(customList) || customList.length === 0) return;
			var select = document.getElementById("boardedition");
			var deutschland = window.BOARD_EDITIONS["deutschland"];

			customList.forEach(function(item) {
				var data = item.data;
				if (!data || !data.id) return;

				// Merge with Deutschland default squares if only names are customized
				var mergedSquares = [];
				for (var idx = 0; idx < 40; idx++) {
					var defaultSq = deutschland.squares[idx];
					var customSq = (data.squares && data.squares[idx]) || {};
					mergedSquares.push(new Square(
						customSq.name || defaultSq.name,
						customSq.pricetext || defaultSq.pricetext,
						customSq.color || defaultSq.color,
						customSq.price !== undefined ? customSq.price : defaultSq.price,
						customSq.groupNumber !== undefined ? customSq.groupNumber : defaultSq.groupNumber,
						customSq.baserent !== undefined ? customSq.baserent : defaultSq.baserent,
						customSq.rent1 !== undefined ? customSq.rent1 : defaultSq.rent1,
						customSq.rent2 !== undefined ? customSq.rent2 : defaultSq.rent2,
						customSq.rent3 !== undefined ? customSq.rent3 : defaultSq.rent3,
						customSq.rent4 !== undefined ? customSq.rent4 : defaultSq.rent4,
						customSq.rent5 !== undefined ? customSq.rent5 : defaultSq.rent5,
						customSq.type || defaultSq.type,
						customSq.icon || defaultSq.icon
					));
				}

				window.BOARD_EDITIONS[data.id] = {
					id: data.id,
					name: data.name || data.id,
					currency: data.currency || "DM",
					boardImage: data.boardImage || "",
					taxCityName: data.taxCityName || "Einkommensteuer",
					taxLuxuryName: data.taxLuxuryName || "Zusatzsteuer",
					centerLogo: data.centerLogo || "MONOPOLY",
					centerSub: data.centerSub || "",
					squares: mergedSquares,
					communityChestCards: data.communityChestCards || deutschland.communityChestCards,
					chanceCards: data.chanceCards || deutschland.chanceCards
				};

				// Append option to select dropdown if not already present
				if (select && !select.querySelector("option[value='" + data.id + "']")) {
					var opt = document.createElement("option");
					opt.value = data.id;
					opt.textContent = "🎨 " + (data.name || data.id);
					select.appendChild(opt);
				}
			});
		})
		.catch(function(err) {
			console.warn("Could not load custom editions:", err);
		});
};

// Default to Deutschland Edition on script load and load custom editions
loadBoardEdition("deutschland");
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", window.fetchCustomEditions);
	} else {
		window.fetchCustomEditions();
	}
}

