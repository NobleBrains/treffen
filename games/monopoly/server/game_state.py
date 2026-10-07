import os
import json
import random
import time
from pathlib import Path
from typing import Dict, List, Optional, Any

ASSETS_DIR = Path(__file__).resolve().parent.parent / "static" / "assets"


# 40 standard German Monopoly squares
SQUARES = [
    {"index": 0, "name": "LOS", "type": "go", "price": 0, "group": None},
    {"index": 1, "name": "Badstraße", "type": "property", "price": 60, "group": "brown", "house_cost": 50, "mortgage": 30, "rents": [2, 10, 30, 90, 160, 250]},
    {"index": 2, "name": "Gemeinschaftsfeld", "type": "chest", "price": 0, "group": None},
    {"index": 3, "name": "Turmstraße", "type": "property", "price": 60, "group": "brown", "house_cost": 50, "mortgage": 30, "rents": [4, 20, 60, 180, 320, 450]},
    {"index": 4, "name": "Einkommensteuer", "type": "tax", "price": 200, "group": None},
    {"index": 5, "name": "Südbahnhof", "type": "station", "price": 200, "group": "station", "mortgage": 100, "rents": [25, 50, 100, 200]},
    {"index": 6, "name": "Chausseestraße", "type": "property", "price": 100, "group": "lightblue", "house_cost": 50, "mortgage": 50, "rents": [6, 30, 90, 270, 400, 550]},
    {"index": 7, "name": "Ereignisfeld", "type": "chance", "price": 0, "group": None},
    {"index": 8, "name": "Elisenstraße", "type": "property", "price": 100, "group": "lightblue", "house_cost": 50, "mortgage": 50, "rents": [6, 30, 90, 270, 400, 550]},
    {"index": 9, "name": "Poststraße", "type": "property", "price": 120, "group": "lightblue", "house_cost": 50, "mortgage": 60, "rents": [8, 40, 100, 300, 450, 600]},
    {"index": 10, "name": "Gefängnis", "type": "jail", "price": 0, "group": None},
    {"index": 11, "name": "Seestraße", "type": "property", "price": 140, "group": "pink", "house_cost": 100, "mortgage": 70, "rents": [10, 50, 150, 450, 625, 750]},
    {"index": 12, "name": "Elektrizitätswerk", "type": "utility", "price": 150, "group": "utility", "mortgage": 75},
    {"index": 13, "name": "Hafenstraße", "type": "property", "price": 140, "group": "pink", "house_cost": 100, "mortgage": 70, "rents": [10, 50, 150, 450, 625, 750]},
    {"index": 14, "name": "Neue Straße", "type": "property", "price": 160, "group": "pink", "house_cost": 100, "mortgage": 80, "rents": [12, 60, 180, 500, 700, 900]},
    {"index": 15, "name": "Westbahnhof", "type": "station", "price": 200, "group": "station", "mortgage": 100, "rents": [25, 50, 100, 200]},
    {"index": 16, "name": "Münchner Straße", "type": "property", "price": 180, "group": "orange", "house_cost": 100, "mortgage": 90, "rents": [14, 70, 200, 550, 750, 950]},
    {"index": 17, "name": "Gemeinschaftsfeld", "type": "chest", "price": 0, "group": None},
    {"index": 18, "name": "Wiener Straße", "type": "property", "price": 180, "group": "orange", "house_cost": 100, "mortgage": 90, "rents": [14, 70, 200, 550, 750, 950]},
    {"index": 19, "name": "Berliner Straße", "type": "property", "price": 200, "group": "orange", "house_cost": 100, "mortgage": 100, "rents": [16, 80, 220, 600, 800, 1000]},
    {"index": 20, "name": "Frei Parken", "type": "parking", "price": 0, "group": None},
    {"index": 21, "name": "Theaterstraße", "type": "property", "price": 220, "group": "red", "house_cost": 150, "mortgage": 110, "rents": [18, 90, 250, 700, 875, 1050]},
    {"index": 22, "name": "Ereignisfeld", "type": "chance", "price": 0, "group": None},
    {"index": 23, "name": "Museumstraße", "type": "property", "price": 220, "group": "red", "house_cost": 150, "mortgage": 110, "rents": [18, 90, 250, 700, 875, 1050]},
    {"index": 24, "name": "Opernplatz", "type": "property", "price": 240, "group": "red", "house_cost": 150, "mortgage": 120, "rents": [20, 100, 300, 750, 925, 1100]},
    {"index": 25, "name": "Nordbahnhof", "type": "station", "price": 200, "group": "station", "mortgage": 100, "rents": [25, 50, 100, 200]},
    {"index": 26, "name": "Lessingstraße", "type": "property", "price": 260, "group": "yellow", "house_cost": 150, "mortgage": 130, "rents": [22, 110, 330, 800, 975, 1150]},
    {"index": 27, "name": "Schillerstraße", "type": "property", "price": 260, "group": "yellow", "house_cost": 150, "mortgage": 130, "rents": [22, 110, 330, 800, 975, 1150]},
    {"index": 28, "name": "Wasserwerk", "type": "utility", "price": 150, "group": "utility", "mortgage": 75},
    {"index": 29, "name": "Goethestraße", "type": "property", "price": 280, "group": "yellow", "house_cost": 150, "mortgage": 140, "rents": [24, 120, 360, 850, 1025, 1200]},
    {"index": 30, "name": "Gehe ins Gefängnis", "type": "gotojail", "price": 0, "group": None},
    {"index": 31, "name": "Rathausplatz", "type": "property", "price": 300, "group": "green", "house_cost": 200, "mortgage": 150, "rents": [26, 130, 390, 900, 1100, 1275]},
    {"index": 32, "name": "Hauptstraße", "type": "property", "price": 300, "group": "green", "house_cost": 200, "mortgage": 150, "rents": [26, 130, 390, 900, 1100, 1275]},
    {"index": 33, "name": "Gemeinschaftsfeld", "type": "chest", "price": 0, "group": None},
    {"index": 34, "name": "Bahnhofstraße", "type": "property", "price": 320, "group": "green", "house_cost": 200, "mortgage": 160, "rents": [28, 150, 450, 1000, 1200, 1400]},
    {"index": 35, "name": "Hauptbahnhof", "type": "station", "price": 200, "group": "station", "mortgage": 100, "rents": [25, 50, 100, 200]},
    {"index": 36, "name": "Ereignisfeld", "type": "chance", "price": 0, "group": None},
    {"index": 37, "name": "Parkstraße", "type": "property", "price": 350, "group": "darkblue", "house_cost": 200, "mortgage": 175, "rents": [35, 175, 500, 1100, 1300, 1500]},
    {"index": 38, "name": "Zusatzsteuer", "type": "tax", "price": 100, "group": None},
    {"index": 39, "name": "Schlossallee", "type": "property", "price": 400, "group": "darkblue", "house_cost": 200, "mortgage": 200, "rents": [50, 200, 600, 1400, 1700, 2000]}
]

COLOR_GROUPS = {
    "brown": [1, 3],
    "lightblue": [6, 8, 9],
    "pink": [11, 13, 14],
    "orange": [16, 18, 19],
    "red": [21, 23, 24],
    "yellow": [26, 27, 29],
    "green": [31, 32, 34],
    "darkblue": [37, 39],
    "station": [5, 15, 25, 35],
    "utility": [12, 28]
}

def _load_cards(filename: str, deck_name: str, fallback_cards: list) -> list:
    filepath = ASSETS_DIR / "chance_chest" / filename
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            cards = []
            for item in data:
                cards.append({
                    "id": item.get("id"),
                    "deck": deck_name,
                    "text": item.get("text_de", ""),
                    "image": item.get("card_image_filename", ""),
                    "action": item.get("action", ""),
                    "value": item.get("value", 0),
                    "extra_value": item.get("extra_value", 0),
                    "target_tile": item.get("target_tile"),
                    "illustration": item.get("illustration", "")
                })
            if cards:
                return cards
        except Exception as e:
            print(f"Warning: Failed to load {filename}: {e}")
    return fallback_cards

FALLBACK_COMMUNITY_CHEST_CARDS = [
    {"id": 1, "deck": "Gemeinschaft", "text": "Du erhältst eine Beratungsgebühr von £25.", "image": "gemeinschaft_01.png", "action": "RECEIVE_MONEY", "value": 25},
    {"id": 2, "deck": "Gemeinschaft", "text": "Aus Lagerverkäufen erhältst du: £50", "image": "gemeinschaft_02.png", "action": "RECEIVE_MONEY", "value": 50},
    {"id": 3, "deck": "Gemeinschaft", "text": "Bankfehler zu deinen Gunsten. Ziehe £200 ein.", "image": "gemeinschaft_03.png", "action": "RECEIVE_MONEY", "value": 200},
    {"id": 4, "deck": "Gemeinschaft", "text": "Deine Lebensversicherung wird fällig. Du erhältst £100.", "image": "gemeinschaft_04.png", "action": "RECEIVE_MONEY", "value": 100},
    {"id": 5, "deck": "Gemeinschaft", "text": "Zweiter Preis im Schönheitswettbewerb. Du erhältst £10.", "image": "gemeinschaft_05.png", "action": "RECEIVE_MONEY", "value": 10},
    {"id": 6, "deck": "Gemeinschaft", "text": "Du erbst £100.", "image": "gemeinschaft_06.png", "action": "RECEIVE_MONEY", "value": 100},
    {"id": 7, "deck": "Gemeinschaft", "text": "Einkommensteuer-Rückzahlung. Du erhältst £20.", "image": "gemeinschaft_07.png", "action": "RECEIVE_MONEY", "value": 20},
    {"id": 8, "deck": "Gemeinschaft", "text": "Urlaubsgeld! Du erhältst £100.", "image": "gemeinschaft_08.png", "action": "RECEIVE_MONEY", "value": 100},
    {"id": 9, "deck": "Gemeinschaft", "text": "Du hast Geburtstag! Jeder Spieler schenkt dir £10.", "image": "gemeinschaft_09.png", "action": "RECEIVE_FROM_PLAYERS", "value": 10},
    {"id": 10, "deck": "Gemeinschaft", "text": "Zahle Schulgeld: £50.", "image": "gemeinschaft_10.png", "action": "PAY_MONEY", "value": 50},
    {"id": 11, "deck": "Gemeinschaft", "text": "Arztkosten. Zahle £50.", "image": "gemeinschaft_11.png", "action": "PAY_MONEY", "value": 50},
    {"id": 12, "deck": "Gemeinschaft", "text": "Krankenhausgebühr: Du zahlst £100.", "image": "gemeinschaft_12.png", "action": "PAY_MONEY", "value": 100},
    {"id": 13, "deck": "Gemeinschaft", "text": "Kosten für Straßenausbesserungen. Zahle: £40 pro Haus, £115 pro Hotel.", "image": "gemeinschaft_13.png", "action": "PAY_FOR_BUILDINGS", "value": 40, "extra_value": 115},
    {"id": 14, "deck": "Gemeinschaft", "text": "Rücke vor bis auf LOS. (Ziehe £200 ein.)", "image": "gemeinschaft_14.png", "action": "MOVE_TO_TILE", "target_tile": 0},
    {"id": 15, "deck": "Gemeinschaft", "text": "Gehe in das Gefängnis! Begib dich direkt dorthin.", "image": "gemeinschaft_15.png", "action": "GO_TO_JAIL"},
    {"id": 16, "deck": "Gemeinschaft", "text": "Du kommst aus dem Gefängnis frei. Behalte diese Karte, bis du sie benötigst oder verkaufst.", "image": "gemeinschaft_16.png", "action": "GET_OUT_OF_JAIL_FREE"}
]

FALLBACK_CHANCE_CARDS = [
    {"id": 1, "deck": "Ereignis", "text": "Die Bank zahlt dir eine Dividende von £50.", "image": "ereignis_01.png", "action": "RECEIVE_MONEY", "value": 50},
    {"id": 2, "deck": "Ereignis", "text": "Dein Bausparvertrag wird fällig. Du erhältst £150.", "image": "ereignis_02.png", "action": "RECEIVE_MONEY", "value": 150},
    {"id": 3, "deck": "Ereignis", "text": "Strafzettel! Zahle £15.", "image": "ereignis_03.png", "action": "PAY_MONEY", "value": 15},
    {"id": 4, "deck": "Ereignis", "text": "Du lässt deine Häuser renovieren: Zahle £25 pro Haus und £100 pro Hotel.", "image": "ereignis_04.png", "action": "PAY_FOR_BUILDINGS", "value": 25, "extra_value": 100},
    {"id": 5, "deck": "Ereignis", "text": "Du bist zum Vorstand gewählt worden. Zahle jedem Spieler £50.", "image": "ereignis_05.png", "action": "PAY_EACH_PLAYER", "value": 50},
    {"id": 6, "deck": "Ereignis", "text": "Rücke vor bis auf LOS. (Ziehe £200 ein.)", "image": "ereignis_06.png", "action": "MOVE_TO_TILE", "target_tile": 0},
    {"id": 7, "deck": "Ereignis", "text": "Mache einen Ausflug zum Südbahnhof. Wenn du über LOS kommst, ziehe £200 ein.", "image": "ereignis_07.png", "action": "MOVE_TO_TILE", "target_tile": 5},
    {"id": 8, "deck": "Ereignis", "text": "Rücke vor bis zur Seestraße. Wenn du über LOS kommst, ziehe £200 ein.", "image": "ereignis_08.png", "action": "MOVE_TO_TILE", "target_tile": 11},
    {"id": 9, "deck": "Ereignis", "text": "Rücke vor bis zum Opernplatz. Wenn du über LOS kommst, ziehe £200 ein.", "image": "ereignis_09.png", "action": "MOVE_TO_TILE", "target_tile": 24},
    {"id": 10, "deck": "Ereignis", "text": "Rücke vor bis zur Schlossallee.", "image": "ereignis_10.png", "action": "MOVE_TO_TILE", "target_tile": 39},
    {"id": 11, "deck": "Ereignis", "text": "Rücke vor bis zum nächsten Bahnhof. Der Eigentümer erhält das Doppelte der normalen Miete.", "image": "ereignis_11.png", "action": "MOVE_TO_NEAREST_RAILROAD"},
    {"id": 12, "deck": "Ereignis", "text": "Rücke vor bis zum nächsten Bahnhof. Der Eigentümer erhält das Doppelte der normalen Miete.", "image": "ereignis_12.png", "action": "MOVE_TO_NEAREST_RAILROAD"},
    {"id": 13, "deck": "Ereignis", "text": "Rücke vor bis zum nächsten Werk. Würfel und zahle dem Eigentümer das 10-fache.", "image": "ereignis_13.png", "action": "MOVE_TO_NEAREST_UTILITY"},
    {"id": 14, "deck": "Ereignis", "text": "Gehe 3 Felder zurück.", "image": "ereignis_14.png", "action": "MOVE_BACK_N_TILES", "value": 3},
    {"id": 15, "deck": "Ereignis", "text": "Gehe in das Gefängnis! Begib dich direkt dorthin.", "image": "ereignis_15.png", "action": "GO_TO_JAIL"},
    {"id": 16, "deck": "Ereignis", "text": "Du kommst aus dem Gefängnis frei. Behalte diese Karte, bis du sie benötigst oder verkaufst.", "image": "ereignis_16.png", "action": "GET_OUT_OF_JAIL_FREE"}
]

COMMUNITY_CHEST_CARDS = _load_cards("gemeinschaftskarten.json", "Gemeinschaft", FALLBACK_COMMUNITY_CHEST_CARDS)
CHANCE_CARDS = _load_cards("ereigniskarten.json", "Ereignis", FALLBACK_CHANCE_CARDS)

TOKEN_OPTIONS = [
    {"id": "dog", "name": "Terrier (Hund)", "model": "token_dog.obj", "icon": "hund_icon.png"},
    {"id": "hat", "name": "Zylinder", "model": "token_hat.obj", "icon": "zylinder_icon.png"},
    {"id": "boot", "name": "Stiefel", "model": "token_boot.obj", "icon": "schuh_icon.png"},
    {"id": "iron", "name": "Bügeleisen", "model": "token_iron.obj", "icon": "buegeleisen_icon.png"},
    {"id": "ship", "name": "Schlachtschiff", "model": "token_ship.obj", "icon": "schlachtschiff_icon.png"},
    {"id": "car", "name": "Rennwagen", "model": "token_car.obj", "icon": "rennwagen_icon.png"},
    {"id": "thimble", "name": "Fingerhut", "model": "token_thimble.obj", "icon": "fingerhut_icon.png"},
    {"id": "wheelbarrow", "name": "Schubkarre", "model": "token_wheelbarrow.obj", "icon": "schubkarre_icon.png"}
]

PLAYER_COLORS = [
    {"name": "Rot", "hex": "#e74c3c"},
    {"name": "Blau", "hex": "#3498db"},
    {"name": "Grün", "hex": "#2ecc71"},
    {"name": "Gelb", "hex": "#f1c40f"},
    {"name": "Orange", "hex": "#e67e22"},
    {"name": "Lila", "hex": "#9b59b6"},
    {"name": "Türkis", "hex": "#1abc9c"},
    {"name": "Pink", "hex": "#fd79a8"}
]

class Player:
    def __init__(self, player_id: str, name: str, token: str, color: str, is_bot: bool = False):
        self.id = player_id
        self.name = name
        self.token = token
        self.color = color
        self.money = 1500
        self.position = 0
        self.in_jail = False
        self.jail_turns = 0
        self.jail_cards = 0
        self.is_bankrupt = False
        self.is_bot = is_bot
        self.doubles_count = 0

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "token": self.token,
            "color": self.color,
            "money": self.money,
            "position": self.position,
            "in_jail": self.in_jail,
            "jail_turns": self.jail_turns,
            "jail_cards": self.jail_cards,
            "is_bankrupt": self.is_bankrupt,
            "is_bot": self.is_bot
        }

class GameRoom:
    def __init__(self, room_id: str, host_id: str, party_id: Optional[str] = None):
        self.room_id = room_id
        self.host_id = host_id
        self.party_id = party_id
        self.status = "LOBBY" # LOBBY, PLAYING, GAME_OVER
        self.players: List[Player] = []
        self.current_player_idx = 0
        self.dice = [1, 1]
        self.rolled = False
        self.last_card: Optional[dict] = None
        self.board_state = {
            i: {
                "owner": None,
                "houses": 0, # 0..4 = houses, 5 = hotel
                "mortgaged": False
            } for i in range(40) if SQUARES[i]["type"] in ["property", "station", "utility"]
        }
        self.logs: List[str] = []
        self.chance_deck = list(range(len(CHANCE_CARDS)))
        random.shuffle(self.chance_deck)
        self.chest_deck = list(range(len(COMMUNITY_CHEST_CARDS)))
        random.shuffle(self.chest_deck)
        self.pending_action: Optional[dict] = None # e.g. unowned property, pay rent, card
        self.pending_trade: Optional[dict] = None
        self.auction_state: Optional[dict] = None
        self.created_at = time.time()
        self.log(f"Raum {room_id} erstellt.")

    def log(self, message: str):
        self.logs.append(message)
        if len(self.logs) > 60:
            self.logs.pop(0)

    def add_player(self, player_id: str, name: str, token: str, color: str, is_bot: bool = False) -> Player:
        # Check if already in room
        for p in self.players:
            if p.id == player_id:
                p.name = name
                p.token = token
                p.color = color
                return p
        
        # If token taken, pick another
        used_tokens = {p.token for p in self.players}
        if token in used_tokens:
            for opt in TOKEN_OPTIONS:
                if opt["id"] not in used_tokens:
                    token = opt["id"]
                    break

        # If color taken, pick another
        used_colors = {p.color for p in self.players}
        if color in used_colors:
            for c in PLAYER_COLORS:
                if c["hex"] not in used_colors:
                    color = c["hex"]
                    break

        p = Player(player_id, name, token, color, is_bot)
        self.players.append(p)
        self.log(f"{name} ist dem Spiel beigetreten ({p.token}).")
        return p

    def remove_player(self, player_id: str):
        self.players = [p for p in self.players if p.id != player_id]
        if self.players and self.host_id == player_id:
            self.host_id = self.players[0].id
        if self.current_player_idx >= len(self.players) and self.players:
            self.current_player_idx = 0

    def start_game(self):
        if len(self.players) < 2:
            raise ValueError("Mindestens 2 Spieler erforderlich.")
        self.status = "PLAYING"
        self.current_player_idx = 0
        self.rolled = False
        self.pending_action = None
        self.log("Das Monopoly-Spiel hat begonnen! Möge der beste Immobilienmogul gewinnen!")

    def current_player(self) -> Optional[Player]:
        if not self.players:
            return None
        return self.players[self.current_player_idx % len(self.players)]

    def roll_dice(self) -> dict:
        player = self.current_player()
        if not player or self.status != "PLAYING":
            return {"error": "Nicht im Spiel."}
        if self.rolled and self.pending_action:
            return {"error": "Bereits gewürfelt."}

        d1 = random.randint(1, 6)
        d2 = random.randint(1, 6)
        self.dice = [d1, d2]
        self.rolled = True
        is_double = (d1 == d2)

        steps = d1 + d2
        self.log(f"{player.name} würfelt eine {d1} und {d2} (Gesamt: {steps})!")

        # Handle Jail
        if player.in_jail:
            if is_double:
                player.in_jail = False
                player.jail_turns = 0
                player.doubles_count = 0
                self.log(f"Pasch! {player.name} kommt frei aus dem Gefängnis!")
                return self.move_player(player, steps, is_double)
            else:
                player.jail_turns += 1
                if player.jail_turns >= 3:
                    player.money -= 50
                    player.in_jail = False
                    player.jail_turns = 0
                    self.log(f"{player.name} muss 50 DM Kaution zahlen und kommt frei!")
                    return self.move_player(player, steps, False)
                else:
                    self.log(f"{player.name} bleibt im Gefängnis (Runde {player.jail_turns}/3).")
                    self.pending_action = {"type": "END_TURN"}
                    return {
                        "dice": self.dice,
                        "double": is_double,
                        "player": player.to_dict(),
                        "action": self.pending_action
                    }

        # Doubles counter
        if is_double:
            player.doubles_count += 1
            if player.doubles_count >= 3:
                self.send_to_jail(player)
                self.log(f"3 Paschs in Folge! {player.name} geht direkt ins Gefängnis!")
                self.pending_action = {"type": "END_TURN"}
                return {
                    "dice": self.dice,
                    "double": True,
                    "player": player.to_dict(),
                    "action": self.pending_action
                }
        else:
            player.doubles_count = 0

        return self.move_player(player, steps, is_double)

    def move_player(self, player: Player, steps: int, is_double: bool) -> dict:
        old_pos = player.position
        new_pos = (old_pos + steps) % 40

        # Check if passed GO
        passed_go = (new_pos < old_pos and steps > 0)
        if passed_go:
            player.money += 200
            self.log(f"{player.name} zieht über LOS und zieht 200 DM ein!")

        player.position = new_pos
        square = SQUARES[new_pos]
        self.log(f"{player.name} landet auf {square['name']}.")

        # Handle square logic
        action = self.evaluate_square(player, square, steps)
        self.pending_action = action

        return {
            "dice": self.dice,
            "double": is_double,
            "old_pos": old_pos,
            "new_pos": new_pos,
            "passed_go": passed_go,
            "player": player.to_dict(),
            "action": action
        }

    def evaluate_square(self, player: Player, square: dict, roll_sum: int) -> dict:
        sq_type = square["type"]
        idx = square["index"]

        if sq_type in ["property", "station", "utility"]:
            prop_state = self.board_state[idx]
            owner_id = prop_state["owner"]

            if owner_id is None:
                # Unowned: Buy or Auction
                return {
                    "type": "BUY_OR_AUCTION",
                    "square": square,
                    "price": square["price"]
                }
            elif owner_id != player.id:
                # Owned by someone else -> pay rent
                if prop_state["mortgaged"]:
                    self.log(f"{square['name']} ist mit Hypothek belastet. Keine Miete fällig.")
                    return {"type": "END_TURN"}

                rent = self.calculate_rent(idx, roll_sum)
                owner = next((p for p in self.players if p.id == owner_id), None)
                if owner:
                    player.money -= rent
                    owner.money += rent
                    self.log(f"{player.name} zahlt {rent} DM Miete an {owner.name}!")
                    if player.money < 0:
                        self.log(f"⚠️ {player.name} ist im Minus ({player.money} DM)!")
                return {"type": "RENT_PAID", "rent": rent, "owner": owner.name if owner else "Bank"}
            else:
                self.log(f"{player.name} besucht das eigene Grundstück.")
                return {"type": "END_TURN"}

        elif sq_type == "tax":
            tax = square["price"]
            player.money -= tax
            self.log(f"{player.name} zahlt {tax} DM {square['name']}!")
            return {"type": "TAX_PAID", "tax": tax}

        elif sq_type == "gotojail":
            self.send_to_jail(player)
            return {"type": "WENT_TO_JAIL"}

        elif sq_type == "chance":
            card = self.draw_chance_card(player, roll_sum)
            active_count = max(1, len([p for p in self.players if not p.is_bankrupt]))
            self.last_card = {
                "deck": "Ereignis",
                "card": card,
                "text": card.get("text", ""),
                "image": card.get("image") or card.get("card_image_filename", ""),
                "player": player.name,
                "turns_remaining": active_count
            }
            return {"type": "CARD", "deck": "Ereignis", "card": card}

        elif sq_type == "chest":
            card = self.draw_chest_card(player)
            active_count = max(1, len([p for p in self.players if not p.is_bankrupt]))
            self.last_card = {
                "deck": "Gemeinschaft",
                "card": card,
                "text": card.get("text", ""),
                "image": card.get("image") or card.get("card_image_filename", ""),
                "player": player.name,
                "turns_remaining": active_count
            }
            return {"type": "CARD", "deck": "Gemeinschaft", "card": card}

        elif sq_type in ["go", "parking", "jail"]:
            return {"type": "END_TURN"}

        return {"type": "END_TURN"}

    def calculate_rent(self, sq_idx: int, roll_sum: int) -> int:
        square = SQUARES[sq_idx]
        state = self.board_state[sq_idx]
        owner_id = state["owner"]
        if not owner_id:
            return 0

        sq_type = square["type"]
        group = square["group"]

        if sq_type == "property":
            houses = state["houses"]
            if houses == 0:
                base = square["rents"][0]
                # Check complete group
                group_squares = COLOR_GROUPS[group]
                all_owned = all(self.board_state[s]["owner"] == owner_id for s in group_squares)
                return base * 2 if all_owned else base
            else:
                return square["rents"][houses]

        elif sq_type == "station":
            stations = COLOR_GROUPS["station"]
            owned_count = sum(1 for s in stations if self.board_state[s]["owner"] == owner_id)
            return square["rents"][max(0, owned_count - 1)]

        elif sq_type == "utility":
            utilities = COLOR_GROUPS["utility"]
            owned_count = sum(1 for s in utilities if self.board_state[s]["owner"] == owner_id)
            multiplier = 10 if owned_count >= 2 else 4
            return roll_sum * multiplier

        return 0

    def send_to_jail(self, player: Player):
        player.position = 10
        player.in_jail = True
        player.jail_turns = 0
        player.doubles_count = 0
        self.log(f"🚔 {player.name} wurde ins Gefängnis gesteckt!")

    def draw_chance_card(self, player: Player, roll_sum: int) -> dict:
        if not self.chance_deck:
            self.chance_deck = list(range(len(CHANCE_CARDS)))
            random.shuffle(self.chance_deck)
        c_idx = self.chance_deck.pop(0)
        card = CHANCE_CARDS[c_idx]
        self.apply_card(player, card, roll_sum)
        return card

    def draw_chest_card(self, player: Player) -> dict:
        if not self.chest_deck:
            self.chest_deck = list(range(len(COMMUNITY_CHEST_CARDS)))
            random.shuffle(self.chest_deck)
        c_idx = self.chest_deck.pop(0)
        card = COMMUNITY_CHEST_CARDS[c_idx]
        self.apply_card(player, card, 0)
        return card

    def apply_card(self, player: Player, card: dict, roll_sum: int):
        act = card.get("action", "")
        card_text = card.get("text") or card.get("text_de", "")
        self.log(f"Karte gezogen ({card.get('deck', '')}): {card_text}")

        if act in ["RECEIVE_MONEY", "money"]:
            amt = card.get("value") if "value" in card else card.get("amount", 0)
            player.money += amt
            if amt > 0:
                self.log(f"💰 {player.name} erhält {amt} DM.")
            else:
                self.log(f"💸 {player.name} zahlt {-amt} DM.")

        elif act in ["PAY_MONEY"]:
            amt = card.get("value", 0)
            player.money -= amt
            self.log(f"💸 {player.name} zahlt {amt} DM.")

        elif act in ["MOVE_TO_TILE", "goto"]:
            target = card.get("target_tile") if ("target_tile" in card and card["target_tile"] is not None) else card.get("pos", 0)
            passed_go = (target < player.position and target != 0)
            if passed_go:
                player.money += 200
                self.log(f"🏃 {player.name} zieht über LOS und erhält 200 DM!")
            player.position = target
            sq = SQUARES[target]
            if sq["type"] in ["property", "station", "utility"]:
                self.pending_action = self.evaluate_square(player, sq, roll_sum)

        elif act in ["MOVE_BACK_N_TILES", "back3"]:
            steps = card.get("value") or 3
            player.position = (player.position - steps) % 40
            sq = SQUARES[player.position]
            self.pending_action = self.evaluate_square(player, sq, roll_sum)

        elif act in ["MOVE_TO_NEAREST_RAILROAD", "nearest_station"]:
            stations = [5, 15, 25, 35]
            pos = player.position
            target = min([s for s in stations if s > pos] or [stations[0]])
            if target < pos:
                player.money += 200
                self.log(f"🏃 {player.name} zieht über LOS und erhält 200 DM!")
            player.position = target
            sq = SQUARES[target]
            self.pending_action = self.evaluate_square(player, sq, roll_sum)
            if self.pending_action and self.pending_action.get("type") == "PAY_RENT":
                self.pending_action["rent"] *= 2
                self.log(f"🚂 Doppelte Miete am Bahnhof: {self.pending_action['rent']} DM!")

        elif act in ["MOVE_TO_NEAREST_UTILITY", "nearest_utility"]:
            utils = [12, 28]
            pos = player.position
            target = min([u for u in utils if u > pos] or [utils[0]])
            if target < pos:
                player.money += 200
                self.log(f"🏃 {player.name} zieht über LOS und erhält 200 DM!")
            player.position = target
            sq = SQUARES[target]
            self.pending_action = self.evaluate_square(player, sq, roll_sum)
            if self.pending_action and self.pending_action.get("type") == "PAY_RENT":
                dice_factor = max(1, roll_sum) * 10
                self.pending_action["rent"] = dice_factor
                self.log(f"💡 10-facher Werk-Mietzins: {dice_factor} DM!")

        elif act in ["PAY_FOR_BUILDINGS", "repairs"]:
            h_cost = card.get("value") if ("value" in card and card["value"]) else card.get("house", 25)
            hot_cost = card.get("extra_value") if ("extra_value" in card and card["extra_value"]) else card.get("hotel", 100)
            total = 0
            for sq_idx, st in self.board_state.items():
                if st["owner"] == player.id:
                    if st["houses"] == 5:
                        total += hot_cost
                    else:
                        total += st["houses"] * h_cost
            player.money -= total
            self.log(f"🏚️ {player.name} zahlt {total} DM für Gebäude-Renovierungen.")

        elif act in ["PAY_EACH_PLAYER", "pay_each"]:
            amt = card.get("value") if "value" in card else card.get("amount", 50)
            for p in self.players:
                if p.id != player.id and not p.is_bankrupt:
                    player.money -= amt
                    p.money += amt
            self.log(f"👥 {player.name} zahlt jedem Mitspieler {amt} DM.")

        elif act in ["RECEIVE_FROM_PLAYERS", "birthday"]:
            amt = card.get("value") if "value" in card else card.get("amount", 10)
            for p in self.players:
                if p.id != player.id and not p.is_bankrupt:
                    p.money -= amt
                    player.money += amt
            self.log(f"🎁 Jeder Mitspieler schenkt {player.name} {amt} DM!")

        elif act in ["GO_TO_JAIL", "gotojail"]:
            self.send_to_jail(player)

        elif act in ["GET_OUT_OF_JAIL_FREE", "jail_free"]:
            player.jail_cards += 1
            self.log(f"🎟️ {player.name} erhält eine 'Gefängnis frei'-Karte.")

    def buy_property(self, player_id: str, sq_idx: int) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player:
            return {"error": "Spieler nicht gefunden."}
        square = SQUARES[sq_idx]
        price = square["price"]
        state = self.board_state[sq_idx]

        if state["owner"] is not None:
            return {"error": "Bereits besessen."}
        if player.money < price:
            return {"error": "Nicht genug Geld."}

        player.money -= price
        state["owner"] = player.id
        self.log(f"{player.name} kauft {square['name']} für {price} DM!")
        self.pending_action = None
        return {"success": True, "square": square, "player": player.to_dict()}

    def build_house(self, player_id: str, sq_idx: int) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player:
            return {"error": "Spieler nicht gefunden."}
        square = SQUARES[sq_idx]
        if square["type"] != "property":
            return {"error": "Nur Straßen können bebaut werden."}
        
        state = self.board_state[sq_idx]
        if state["owner"] != player.id:
            return {"error": "Nicht dein Grundstück."}
        if state["mortgaged"]:
            return {"error": "Grundstück ist mit Hypothek belastet."}

        group = square["group"]
        group_squares = COLOR_GROUPS[group]
        if not all(self.board_state[s]["owner"] == player.id for s in group_squares):
            return {"error": "Du musst die gesamte Farbgruppe besitzen!"}
        if any(self.board_state[s]["mortgaged"] for s in group_squares):
            return {"error": "In der Farbgruppe existiert eine Hypothek!"}

        # Even building rule
        current_houses = state["houses"]
        if current_houses >= 5:
            return {"error": "Maximaler Ausbau (Hotel) bereits erreicht!"}
        min_houses = min(self.board_state[s]["houses"] for s in group_squares)
        if current_houses > min_houses:
            return {"error": "Gleichmäßiges Bauen erforderlich."}

        cost = square["house_cost"]
        if player.money < cost:
            return {"error": "Nicht genug Geld."}

        player.money -= cost
        state["houses"] += 1
        name = "ein Haus" if state["houses"] < 5 else "ein HOTEL"
        self.log(f"{player.name} baut {name} auf {square['name']} ({cost} DM)!")
        return {"success": True, "houses": state["houses"], "money": player.money}

    def sell_house(self, player_id: str, sq_idx: int) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player:
            return {"error": "Spieler nicht gefunden."}
        square = SQUARES[sq_idx]
        if square["type"] != "property":
            return {"error": "Nur Straßen haben Häuser."}
        state = self.board_state[sq_idx]
        if state["owner"] != player.id:
            return {"error": "Nicht dein Grundstück."}
        if state["houses"] <= 0:
            return {"error": "Keine Häuser vorhanden zum Verkaufen."}

        group = square["group"]
        group_squares = COLOR_GROUPS[group]
        max_houses = max(self.board_state[s]["houses"] for s in group_squares)
        if state["houses"] < max_houses:
            return {"error": "Gleichmäßiges Verkaufen erforderlich."}

        refund = square["house_cost"] // 2
        state["houses"] -= 1
        player.money += refund
        name = "ein Haus" if state["houses"] < 4 else "ein HOTEL"
        self.log(f"{player.name} verkauft {name} auf {square['name']} (+{refund} DM)!")
        return {"success": True, "houses": state["houses"], "money": player.money}

    def propose_trade(self, sender_id: str, target_id: str, offer_money: int, offer_props: List[int], req_money: int, req_props: List[int]) -> dict:
        sender = next((p for p in self.players if p.id == sender_id), None)
        target = next((p for p in self.players if p.id == target_id), None)
        if not sender or not target:
            return {"error": "Spieler ungültig."}
        if sender.is_bankrupt or target.is_bankrupt:
            return {"error": "Spieler ist bankrott."}
        if sender.money < offer_money or offer_money < 0:
            return {"error": "Ungültiges Geldangebot."}
        if req_money < 0:
            return {"error": "Ungültige Geldforderung."}

        for p_idx in offer_props:
            st = self.board_state.get(p_idx)
            if not st or st["owner"] != sender_id:
                return {"error": "Grundstück gehört dir nicht."}
            grp = SQUARES[p_idx].get("group")
            if grp and any(self.board_state[s]["houses"] > 0 for s in COLOR_GROUPS.get(grp, [])):
                return {"error": "Kann kein Grundstück handeln, solange Häuser auf der Gruppe stehen."}

        for p_idx in req_props:
            st = self.board_state.get(p_idx)
            if not st or st["owner"] != target_id:
                return {"error": "Gefordertes Grundstück gehört dem Partner nicht."}
            grp = SQUARES[p_idx].get("group")
            if grp and any(self.board_state[s]["houses"] > 0 for s in COLOR_GROUPS.get(grp, [])):
                return {"error": "Partner hat noch Häuser in dieser Farbgruppe."}

        trade = {
            "id": f"trade_{int(time.time()*1000)}",
            "sender_id": sender_id,
            "sender_name": sender.name,
            "target_id": target_id,
            "target_name": target.name,
            "offer_money": offer_money,
            "offer_props": offer_props,
            "req_money": req_money,
            "req_props": req_props
        }
        self.pending_trade = trade
        self.log(f"🤝 {sender.name} bietet {target.name} einen Handel an.")
        return {"success": True, "trade": trade}

    def accept_trade(self, player_id: str) -> dict:
        trade = self.pending_trade
        if not trade or trade["target_id"] != player_id:
            return {"error": "Kein aktives Angebot für dich."}
        sender = next((p for p in self.players if p.id == trade["sender_id"]), None)
        target = next((p for p in self.players if p.id == trade["target_id"]), None)
        if not sender or not target:
            return {"error": "Spieler ungültig."}
        if sender.money < trade["offer_money"] or target.money < trade["req_money"]:
            return {"error": "Nicht genug Geld für diesen Handel."}

        for p_idx in trade["offer_props"]:
            if self.board_state[p_idx]["owner"] != sender.id:
                return {"error": "Angebotenes Grundstück nicht mehr verfügbar."}
        for p_idx in trade["req_props"]:
            if self.board_state[p_idx]["owner"] != target.id:
                return {"error": "Gefordertes Grundstück nicht mehr verfügbar."}

        sender.money -= trade["offer_money"]
        target.money += trade["offer_money"]
        target.money -= trade["req_money"]
        sender.money += trade["req_money"]

        for p_idx in trade["offer_props"]:
            self.board_state[p_idx]["owner"] = target.id
        for p_idx in trade["req_props"]:
            self.board_state[p_idx]["owner"] = sender.id

        self.pending_trade = None
        self.log(f"✅ Handel zwischen {sender.name} und {target.name} erfolgreich abgeschlossen!")
        return {"success": True}

    def reject_trade(self, player_id: str) -> dict:
        trade = self.pending_trade
        if not trade:
            return {"error": "Kein aktiver Handel."}
        if trade["target_id"] == player_id or trade["sender_id"] == player_id:
            self.pending_trade = None
            self.log("❌ Handel wurde abgelehnt oder zurückgezogen.")
            return {"success": True}
        return {"error": "Nicht berechtigt."}

    def toggle_mortgage(self, player_id: str, sq_idx: int) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player:
            return {"error": "Spieler nicht gefunden."}
        square = SQUARES[sq_idx]
        state = self.board_state[sq_idx]
        if state["owner"] != player.id:
            return {"error": "Nicht dein Grundstück."}
        if state.get("houses", 0) > 0:
            return {"error": "Vor der Hypothek müssen erst alle Häuser verkauft werden!"}

        mortgage_val = square.get("mortgage", square["price"] // 2)

        if not state["mortgaged"]:
            # Take mortgage
            state["mortgaged"] = True
            player.money += mortgage_val
            self.log(f"{player.name} nimmt eine Hypothek auf {square['name']} auf (+{mortgage_val} DM).")
            return {"success": True, "mortgaged": True, "money": player.money}
        else:
            # Pay off mortgage (+10% interest)
            cost = int(mortgage_val * 1.1)
            if player.money < cost:
                return {"error": f"Nicht genug Geld ({cost} DM benötigt)."}
            player.money -= cost
            state["mortgaged"] = False
            self.log(f"{player.name} löst die Hypothek auf {square['name']} ab (-{cost} DM).")
            return {"success": True, "mortgaged": False, "money": player.money}

    def pay_bail(self, player_id: str) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player or not player.in_jail:
            return {"error": "Nicht im Gefängnis."}
        if player.money < 50:
            return {"error": "Nicht genug Geld für Kaution."}
        player.money -= 50
        player.in_jail = False
        player.jail_turns = 0
        self.log(f"{player.name} zahlt 50 DM Kaution und ist frei!")
        return {"success": True, "player": player.to_dict()}

    def use_jail_card(self, player_id: str) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player or not player.in_jail or player.jail_cards <= 0:
            return {"error": "Keine Gefängnisfrei-Karte vorhanden."}
        player.jail_cards -= 1
        player.in_jail = False
        player.jail_turns = 0
        self.log(f"{player.name} nutzt eine 'Frei aus dem Gefängnis'-Karte!")
        return {"success": True, "player": player.to_dict()}

    def end_turn(self, player_id: str) -> dict:
        player = self.current_player()
        if not player or player.id != player_id:
            return {"error": "Du bist nicht am Zug."}
        if not self.rolled:
            return {"error": "Du musst zuerst würfeln."}

        # Check if doubles allow another roll
        d1, d2 = self.dice
        if d1 == d2 and not player.in_jail and player.doubles_count > 0:
            self.rolled = False
            self.pending_action = None
            self.log(f"Pasch! {player.name} darf noch einmal würfeln!")
            return {"success": True, "reroll": True, "current_player": player.to_dict()}

        # Advance to next non-bankrupt player
        player.doubles_count = 0
        active_players = [p for p in self.players if not p.is_bankrupt]
        if len(active_players) <= 1:
            self.status = "GAME_OVER"
            winner = active_players[0] if active_players else player
            self.log(f"🏆 {winner.name} hat das Spiel gewonnen!")
            return {"success": True, "game_over": True, "winner": winner.to_dict()}

        self.rolled = False
        self.pending_action = None
        if self.last_card:
            self.last_card["turns_remaining"] = self.last_card.get("turns_remaining", 1) - 1
            if self.last_card["turns_remaining"] <= 0:
                self.last_card = None

        self.current_player_idx = (self.current_player_idx + 1) % len(self.players)
        # Skip bankrupted
        while self.players[self.current_player_idx].is_bankrupt:
            self.current_player_idx = (self.current_player_idx + 1) % len(self.players)

        next_p = self.current_player()
        self.log(f"{next_p.name} ist jetzt am Zug.")
        return {"success": True, "next_player": next_p.to_dict()}

    def declare_bankruptcy(self, player_id: str) -> dict:
        player = next((p for p in self.players if p.id == player_id), None)
        if not player:
            return {"error": "Spieler nicht gefunden."}
        player.is_bankrupt = True
        # Release all properties
        for sq_idx, st in self.board_state.items():
            if st["owner"] == player.id:
                st["owner"] = None
                st["houses"] = 0
                st["mortgaged"] = False
        self.log(f"💀 {player.name} erklärt den Bankrott und scheidet aus!")
        return self.end_turn(player_id)

    def to_dict(self) -> dict:
        return {
            "room_id": self.room_id,
            "host_id": self.host_id,
            "party_id": self.party_id,
            "status": self.status,
            "players": [p.to_dict() for p in self.players],
            "current_player_idx": self.current_player_idx,
            "current_player": self.current_player().to_dict() if self.players else None,
            "dice": self.dice,
            "rolled": self.rolled,
            "board_state": self.board_state,
            "pending_action": self.pending_action,
            "pending_trade": self.pending_trade,
            "last_card": self.last_card,
            "logs": self.logs[-25:],
            "squares": SQUARES
        }
