import requests
import ipdb

host = "http://127.0.0.1:8080"
#host = "https://clueless-5ggvsxuoua-uk.a.run.app"

def create_game():
    r = requests.post(host+"/createGame", json = {})
    json_response = r.json()
    game_uuid = json_response["game_uuid"]
    return game_uuid

def add_player(game_uuid, name):
    r = requests.post(host+"/joinGame", json = {"userEmail": name, "gameID": game_uuid})
    print(r.json())

def move_player(game_uuid, name, location):
    r = requests.post(host+"/move", json = {"userEmail": name, "gameID": game_uuid, "location": location})
    print(r.json())

def end_game(game_uuid):
    r = requests.post(host+"/endGame", json = {"gameID": game_uuid})
    print(r.json())

def end_turn(game_uuid, player):
    r = requests.post(host+"/endTurn", json = {"gameID": game_uuid, "userEmail": player})
    print(r.json())

def guess_murderer(game_uuid, user_id, player, weapon, room):
    r = requests.post(host+"/guessMurderer", json ={"gameID":game_uuid, "userEmail": user_id, "player":player, "weapon":weapon, "room": room})
    print(r.json())
    values = r.json()
    if "Correct" in values["success"]:
        return True

def suggest(game_uuid, user_id, player, weapon, room):
    r = requests.post(host+"/suggest", json ={"gameID":game_uuid, "userEmail": user_id, "player":player, "weapon":weapon, "room": room})
    print(r.json())
    values = r.json()
    if "Correct" in values["success"]:
        return True

def start_game(game_uuid):
    r = requests.post(host+"/startGame", json = {"gameID": game_uuid})
    print(r.json())

uuid = create_game()

player_ids = ["Luke", "Jim", "Jonathan"]

for player in player_ids:
    add_player(uuid, player)

ipdb.set_trace()

start_game(uuid)

from constants import room_list, character_list, weapon_list
from random import choice
for player in player_ids:
    move_player(uuid, player, "Conservatory") #choice(room_list))
    end_turn(uuid, player)
    #ipdb.set_trace()

# do this locally not on the server
def find_the_murderer(game_uuid, players):
    for i in room_list:
        for j in character_list:
            for k in weapon_list:
                player_to_guess = choice(players)
                if guess_murderer(game_uuid, player_to_guess, j, k, i):
                    print("FOUND THE MURDERER")
                    print(f"It was {j} with the {k} in the {i}")
                    return
#find_the_murderer(uuid, player_ids)
ipdb.set_trace()

end_game(uuid)
