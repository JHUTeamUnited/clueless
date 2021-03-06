import os
from flask import Flask, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
from flask_cors import CORS, cross_origin
from constants import room_list, hall_list, character_list, weapon_list

# not yet initialized
# Initialize Firestore DB
cred = credentials.Certificate('key.json')
default_app = initialize_app(cred)
db = firestore.client()
games_ref = db.collection('games')

def number_active_games():
    return len(games_ref.get())

class Game:
    def __init__(self, uuid, exists=False):
        self.uuid = uuid
        self.game_ref = games_ref.document(uuid)
        if not exists:
            doc = self.game_ref.get()
            if not doc.exists:
                self.game_ref.set({
                    u'Name': uuid,
                    u'Active': False,
                    u'Players': [],
                    u'DisplayName': f"Game {number_active_games()+1}"
                    }, merge=True)
            else:
                print("Game exists. Not reinitializing")
    
    def end_game(self):
        self.game_ref.delete()

    def is_active(self):
        return self.game_ref.get().get("Active")
    
    def get_number_players(self):
        return len(self.game_ref.get().get("Players"))
    
    def add_player(self, player_id):
        if self.is_active() == False:
            players = self.game_ref.get().get(u"Players")
            players.append({u'UserName': player_id, u"HasAccused": False})
            self.game_ref.update({u"Players": players})
        else:
            print("ERROR: Cannot add player after game has started")
    
    def start_game(self):
        if self.is_active() == False:
            from random import choice, sample, shuffle

            # solutions to the game
            selected_room = choice(room_list)
            selected_character = choice(character_list)
            selected_weapon = choice(weapon_list)
            
            # iterate over the players and give cards to players in a loop
            player_stream = self.game_ref.get().get(u"Players")
            players = [i for i in player_stream] 
            
            # these are the locations and characters for our players
            starting_locations = sample(room_list,k=len(players))
            character_selection = sample(character_list,k=len(players))

            # the rest of the options
            leftover_room = [i for i in room_list if i != selected_room]
            leftover_character = [i for i in character_list if i != selected_character] #and i not in character_selection]
            leftover_weapon = [i for i in weapon_list if i != selected_weapon]

            # add the to an array of leftover items
            leftover_cards = leftover_room
            leftover_cards.extend(leftover_character)
            leftover_cards.extend(leftover_weapon)

            # shuffle them
            shuffle(leftover_cards)
            
            player_num = 0 

            for card in leftover_cards:
                player = players[player_num]
                if "Cards" in player:
                    player["Cards"].append(card)
                else:
                    player["Cards"] = []
                player_num = (player_num + 1) % len(players)

            player_num = 0
            # actually add to the databse
            for i in range(len(players)):
                players[i].update({"Location": starting_locations[i]})
                players[i].update({"Character": character_selection[i]})
            
            starting_player = choice(players)["UserName"]
            # set the game to active and set the solutions
            self.game_ref.update({u'Active':True,
                                  u'Turn': starting_player,
                                  u"Players": players,
                                  u'Answer': {
                                      u'Character': selected_character,
                                      u'Weapon': selected_weapon,
                                      u'Room': selected_room
                                  }})
            
        else:
            print("ERROR: TRIED TO START ACTIVE GAME")
    
    def end_move(self,player):
        if self.is_active():
            players = self.game_ref.get().get(u"Players")
            sorted(players, key=lambda i: i[u"UserName"])
            player_names = [player[u"UserName"] for player in players]

            current_player_move = self.game_ref.get().get("Turn")
            if player != current_player_move:
                print(current_player_move + " -> " + player)
                return False
            current_index = player_names.index(current_player_move)
            new_index = (current_index + 1) % len(player_names)
            new_player = player_names[new_index]
            self.game_ref.update({u'Turn': new_player})
            return True
        else:
            return False
    
    def move_player(self, player_id, location):
        if self.is_active():
            #current_playser = self.game_ref.get().get("Turn")
            #if 
            players = self.game_ref.get().get(u"Players")
            matching = filter(lambda player: player["UserName"] == player_id, players)
            next_match = next(matching)
            if next_match:
                if location in room_list or location in hall_list:
                    next_match.update({"Location": location})
                    self.game_ref.update({u'Players': players})
                    #self.end_move()
                    return True
        return False

    def guess_murderer(self,weapon, character, room):
        if self.is_active():
            ans = self.game_ref.get().get("Answer")
            return weapon == ans["Weapon"] and room == ans["Room"] and character == ans["Character"]  
        return False

    def suggest(self, userEmail, weapon, player, room):
        if self.is_active():
            players_list = self.game_ref.get().get(u"Players")
            ans = self.game_ref.get().get("Answer")
            options_list = []
            if weapon != ans["Weapon"]:
                options_list.append(weapon)
            if player != ans["Character"]:
                options_list.append(player) 
            if room != ans["Room"]:
                options_list.append(room)
            
            from random import shuffle
            shuffle(options_list)
            
            if not options_list:
                # it's right
                return True
            
            player_index_list = [i for i in range(self.get_number_players())]
            shuffle(player_index_list)

            card_selected = None
            player_contributing = None

            def returned_card(cards, options, current_player_cards):
                for option in options:
                    if option in cards and option not in current_player_cards:
                        return option
            current_player = None
            for player in players_list:
                if player["UserName"] == userEmail:
                    current_player = player
                    
            current_player_cards = current_player["Cards"]


            for i in player_index_list:
                player = players_list[i]
                if player["UserName"] == userEmail:
                    continue
                cards = player["Cards"]
                card = returned_card(cards, options_list, current_player_cards)
                if card:
                    card_selected = card
                    player_contributing = player["UserName"]
            
            if card_selected is None:
                print("Didn't find card in selected")
                return False

            for player in players_list:
                if player["UserName"] == userEmail:
                    player["Cards"].append(card_selected)
                    self.game_ref.update({u'Players': players_list})
                    return [player_contributing, card_selected]
        else:
            print("suggest returned False")
            return False

local_cached_games = {}

def get_game(uuid,can_create_game=False):
    if uuid in local_cached_games.keys():
        return local_cached_games[uuid]
    doc = games_ref.document(uuid).get()
    if doc.exists:
        g = Game(uuid, exists=True)
    else:
        if can_create_game:
            g = Game(uuid)
        else:
            return None
    local_cached_games[uuid] = g
    return local_cached_games[uuid]

def check_requirements(content, req_list):
    if content and req_list:
        return all(i in content for i in req_list)
    return False

# Initialize Flask App
app = Flask(__name__)
CORS(app)


@app.route("/")
@cross_origin()
def index():
    print(f"Got request from {request.remote_addr} with {request.get_json()}")
    return "hello", 200

@app.route("/move", methods=['POST'])
@cross_origin()
def move():
    content = request.get_json()
    print(f"Got request from {request.remote_addr} with {content}")
    required_args = ["userEmail", "location", "gameID"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"],can_create_game=False)
        if g:
            userEmail = content["userEmail"]
            location = content["location"]
            if g.move_player(userEmail, location):
                return jsonify({"success": "Success Move"}), 200
            else:
                return jsonify({"success": "Fail to move player in class"}), 200
        else:
            return jsonify({"success": "Fail no such game"})
    else:
        return jsonify({"success": "Fail Move"}), 200

@app.route("/accuse", methods=['POST'])
@cross_origin()
def accuse():
    content = request.get_json()
    print(f"Got request from {request.remote_addr} with {content}")
    required_args = ["gameID", "userEmail", "player", "location", "weapon"]
    if check_requirements(content, required_args):
        return jsonify({"success": "Success Accuse"}), 200
    else:
        return jsonify({"success": "Fail Accuse"}), 200

@app.route("/suggest", methods=['POST'])
@cross_origin()
def suggest():
    content = request.get_json()
    print(f"Got request from {request.remote_addr} with {content}")
    required_args = ["gameID", "userEmail", "player", "weapon", "room"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"])
        if g:
            values = g.suggest(content["userEmail"], content["weapon"], content["player"],content["room"])
            if values == False:
                print("Something went wrong")
                return jsonify({"success": "Something went wrong"}), 200
            elif values == True:
                return jsonify({"success": "Suggestion was correct"}), 200
            else:
                player_contributing, card_selected = values
                return jsonify({"success": "Guess Suggest Correct", "playerContributing": player_contributing, "cardSelected": card_selected}), 200
        else:
            return jsonify({"success": "Fail no such game"})

        return jsonify({"success": "Success Suggest"}), 200
    else:
        return jsonify({"success": "Fail Suggest"}), 200
        
@app.route("/guessMurderer", methods=['POST'])
@cross_origin()
def guess_murderer():
    content = request.get_json()
    print(f"Got request from {request.remote_addr} with {content}")
    required_args = ["gameID", "userEmail", "player", "weapon", "room"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"])
        if g:
            if g.guess_murderer(content["weapon"], content["player"],content["room"]):
                return jsonify({"success": "Guess Murderer Correct"})
            else:
                return jsonify({"success": "Guess Murderer Incorrect"})
        else:
            return jsonify({"success": "Fail no such game"})
    else:
        return jsonify({"success": "Fail Guess Murderer"}), 200

@app.route("/endTurn", methods=['POST'])
@cross_origin()
def end_turn():
    content = request.get_json()
    print(f"Got request from {request.remote_addr} with {content}")
    required_args = ["gameID", "userEmail"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"])
        if g:
            if g.end_move(content["userEmail"]):
                return jsonify({"success": "End Turn Correct"})
            else:
                return jsonify({"success": "End Turn Incorrect"})
        else:
            return jsonify({"success": "Fail no such game"})
    else:
        return jsonify({"success": "Fail End Turn"}), 200

@app.route("/createGame", methods=['POST'])
@cross_origin()
def create_game():
    from uuid import uuid1
    game_uuid = str(uuid1())
    print(f"Created game with uuid {game_uuid}")
    g = get_game(uuid=game_uuid, can_create_game=True)
#    local_cached_games[game_uuid] = Game(uuid=game_uuid)
    return jsonify({"game_uuid": game_uuid})

@app.route("/joinGame", methods=['POST'])
@cross_origin()
def join_game():
    content = request.get_json()
    required_args = ["userEmail", "gameID"]
    print(content)
    print(required_args)
    if check_requirements(content, required_args):
        g = get_game(content["gameID"],can_create_game=False)
        if g:
            userEmail = content["userEmail"]
            if userEmail:
                g.add_player(content["userEmail"])
                return jsonify({"success": "Success joining game"}), 200
            else:
                return jsonify({"success": "Fail: userEmail not specified"}), 200
        else:
            return jsonify({"success": "Fail: No such game"}), 200    
    else:
        return jsonify({"success": "Fail Join Game"}), 200 

@app.route("/startGame", methods=['POST'])
@cross_origin()
def start_game():
    content = request.get_json()
    required_args = ["gameID"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"],can_create_game=False)
        if g:
            g.start_game()
            return jsonify({"success": "Success: Started Game"}), 200
        else:
            return jsonify({"success": "Fail: No such game"}), 200
    else:
        return jsonify({"success": "Fail: game_uuid not specified"})

@app.route("/endGame", methods=["POST"])
@cross_origin()
def end_game():
    content = request.get_json()
    required_args = ["gameID"]
    if check_requirements(content, required_args):
        g = get_game(content["gameID"], can_create_game=False)
        if g:
            g.end_game()
            return jsonify({"success": "Success: Game finished"})
        else:
            return jsonify({"success": "Fail: No such game found"})
    else:
        return jsonify({"success": "Fail: Not enough arguments"})

if __name__ == '__main__':
    app.run(threaded=True, debug=True, host='0.0.0.0', port=int(os.environ.get('PORT',8080)))
