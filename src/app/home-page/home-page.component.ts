import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as _ from '../constants';
import { map } from 'rxjs/operators';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  gameLog = [];
  user  = "";
  nameStudy = [] //""
  nameHall = [] //""
  nameLounge = [] //""
  nameLibrary = [] //""
  nameBilliard = [] //""
  nameDining = [] // ""
  nameConservatory = [] //""
  nameBallRoom = [] //""
  nameKitchen = [] //""
  nameA = []
  nameB = []
  nameC = []
  nameD = []
  nameE = []
  nameF = []
  nameG = []
  nameH = []
  nameI = []
  nameJ = []
  nameK = []
  nameL = []
  myCharacter = ""
  myLocation = ""
  isMyTurn = false
  messageBoard = ""
  myGame = ""
  selectedWeapon = ""
  selectedRoom = "" 
  selectedCharacter = ""
  games = []
  inGame = false
  game: any = {}
  hasGameStarted = false
  whoseTurn = ""
  cards = []
  player = {}
  players = []
  hasSuggested = false

  constructor(
    private http: HttpClient,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth) { 
    this.afAuth.user.subscribe((user) => {
      this.user = user.email
      console.log("user:" + this.user);
    })

    console.log('go', this.db.collection('games').snapshotChanges()
      .forEach(change => {
          console.log('changeeee', change)
          this.games = change.map(x => {
            return x.payload.doc.data()
          })

          let gamesIn = this.games.filter(game => {
            return game['Players'].filter(player => {
              let match = player['UserName'] === this.user
              if (match) {
                this.player = player
                this.myCharacter = this.player['Character']
                this.myLocation = this.player['Location']
              }
              this.players.push(player)
              return match
            }).length !== 0
          })
          if (gamesIn.length > 0) {
            this.game = gamesIn[0]
            this.inGame = true
            this.hasGameStarted = this.game['Active']
            this.whoseTurn = this.game['Turn']
            this.isMyTurn = this.user === this.whoseTurn
            this.cards = this.player['Cards']
            this.setPlayerLocations()
          } else {
            this.inGame = false
            this.game = {}
            this.hasGameStarted = false
            this.setPlayerLocations()
          }
        })
      )

  }

  clickedCell(square) {
    //this.gameLog += square;
    this.gameLog.push(square);
    // console.log(this.gameLog);
    this.moveCharacter(square)
  }

  moveCharacter(toLocation) {
    if (this.isMyTurn) {
      console.log(`Trying to move from ${this.myLocation} to ${toLocation}`)
      let possibleLocations = this.possibleMoves(this.myLocation)
      let canMove = possibleLocations.includes(toLocation)

      if (canMove) {
        this.myLocation = toLocation
        this.postMove(this.myLocation) 
        this.isMyTurn = false;
      } else {
        this.messageBoard = `Can't move to location ${toLocation} from ${this.myLocation}`
      }
    } else {
      this.messageBoard = `Not your turn!`
    }

      
  }

  moveOtherCharacter(player, toLocation) {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/move", 
      { 
        'location': toLocation, 
        'gameID': this.game['Name'], 
        'userEmail': player
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Move Player")
      }).catch((err) => { 
        console.log("Err " + err)
      })
  }

  setPlayerLocations() {
    this.nameStudy = [] //""
    this.nameHall = [] //""
    this.nameLounge = [] //""
    this.nameLibrary = [] //""
    this.nameBilliard = [] //""
    this.nameDining = [] // ""
    this.nameConservatory = [] //""
    this.nameBallRoom = [] //""
    this.nameKitchen = [] //""
    this.nameA = []
    this.nameB = []
    this.nameC = []
    this.nameD = []
    this.nameE = []
    this.nameF = []
    this.nameG = []
    this.nameH = []
    this.nameI = []
    this.nameJ = []
    this.nameK = []
    this.nameL = []
  
    if (!this.inGame) {
      return
    }
    
    let characterMap = this.game['Players'].map(p => {
      return {
        'location': p['Location'], 
        'character': p['Character']
      }
    })
  
    characterMap.forEach((character) => {
      switch (character.location) {
        case _.STUDY:
          this.nameStudy.push(character['character'])
          break;
        case _.HALL:
          this.nameHall.push(character['character'])
          break;
        case _.LOUNGE:
          this.nameLounge.push(character['character'])
          break;
        case _.LIBRARY:
          this.nameLibrary.push(character['character'])
          break;
        case _.BILLIARD:
          this.nameBilliard.push(character['character'])
          break;
        case _.DINING:
          this.nameDining.push(character['character'])
          break;
        case _.CONSERVATORY:
          this.nameConservatory.push(character['character'])
          break;
        case _.BALLROOM:
          this.nameBallRoom.push(character['character'])
          break;
        case _.KITCHEN:
          this.nameKitchen.push(character['character'])
          break;
        case _.HALL_A:
          this.nameA.push(character['character'])
          break;
        case _.HALL_B:
          this.nameB.push(character['character'])
          break;
        case _.HALL_C:
          this.nameC.push(character['character'])
          break;
        case _.HALL_D:
          this.nameD.push(character['character'])
          break;
        case _.HALL_E:
          this.nameE.push(character['character'])
          break;
        case _.HALL_F:
          this.nameF.push(character['character'])
          break;
        case _.HALL_G:
          this.nameG.push(character['character'])
          break;
        case _.HALL_H:
          this.nameH.push(character['character'])
          break;
        case _.HALL_I:
          this.nameI.push(character['character'])
          break;
        case _.HALL_J:
          this.nameJ.push(character['character'])
          break;
        case _.HALL_K:
          this.nameK.push(character['character'])
          break;
        case _.HALL_L:
          this.nameL.push(character['character'])
          break;
        default:
          console.log("Awk Broken");
          break;
      }
    })
  }

  postMove(location: String) {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/move", 
      { 
        'location': location, 
        'gameID': this.game['Name'], 
        'userEmail': this.user
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Move Player")
      }).catch((err) => { 
        console.log("Err " + err)
      })
  }

  postAccuse() {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/accuse", 
      {  
        'gameID': this.game, 
        'userEmail': this.player,
        'player': this.selectedCharacter, 
        'weapon': this.selectedWeapon, 
        'room': this.selectedRoom
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Accuse")
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postSuggest() {
    if (this.isMyTurn) {
      if (this.hasSuggested) {
        this.messageBoard = "Already guessed this round"
        return
      }
      if (this.inHall()) {
        this.messageBoard = "Can't Guess, not in a room"
        return
      }
      if (this.selectedRoom !== this.myLocation) {
        this.messageBoard = "Must guess " + this.myLocation 
        return
      }
      this.hasSuggested = true
      let httpOptions = {}
      return this.http.post<any>(
        "https://clueless-5ggvsxuoua-uk.a.run.app/suggest", 
        {  
          'gameID': this.game['Name'], 
          'userEmail': this.player['UserName'],
          'player': this.selectedCharacter, 
          'weapon': this.selectedWeapon, 
          'room': this.selectedRoom
        }, 
        httpOptions).toPromise()
        .then((res) => {
          console.log(res);
          this.gameLog.push("Suggest")
          this.moveOtherCharacter(this.findPlayer(this.selectedCharacter), this.selectedRoom)
          if (res['success'] === "Something went wrong") { 
            this.messageBoard = "No card was found"
            return
          }
          this.messageBoard = "Received the " + res['cardSelected'] + " from " + res['playerContributing']
        }).catch((err) => {
          console.log("Err " + err)
        })
    } else {
      this.messageBoard = "Not your turn"
    }
    
  }

  postEndTurn() {
    this.clearSelection()
    this.hasSuggested = false

    let httpOptions = {}
      return this.http.post<any>(
        "https://clueless-5ggvsxuoua-uk.a.run.app/endTurn", 
        {  
          'gameID': this.game['Name'], 
          'userEmail': this.player['UserName'],
        }, 
        httpOptions).toPromise()
        .then((res) => {
          console.log(res);
          this.gameLog.push("End Turn")
        }).catch((err) => {
          console.log("Err " + err)
        })
  }

  findPlayer(character) {
    return this.players.find(p => {
      return p['Character'] === character
    })['UserName']
  }

  possibleMoves(currentRoom) {
    switch(currentRoom) {
        case _.STUDY: 
            return [_.HALL_A, _.HALL_C, _.KITCHEN]
        case _.HALL:
            return [_.HALL_A, _.HALL_B, _.HALL_D]
        case _.LOUNGE:
            return [_.HALL_B, _.CONSERVATORY, _.HALL_E]
        case _.LIBRARY:
            return [_.HALL_C, _.HALL_F, _.HALL_H]
        case _.BILLIARD:
            return [_.HALL_D, _.HALL_F, _.HALL_G, _.HALL_I]
        case _.DINING:
            return [_.HALL_E, _.HALL_G, _.HALL_J]
        case _.CONSERVATORY:
            return [_.HALL_H, _.HALL_K, _.LOUNGE]
        case _.BALLROOM:
            return [_.HALL_I, _.HALL_K, _.HALL_L]
        case _.KITCHEN:
            return [_.HALL_J, _.HALL_L, _.STUDY]
        case _.HALL_A:
            return [_.STUDY, _.HALL]
        case _.HALL_B:
            return [_.HALL, _.LOUNGE]
        case _.HALL_C:
            return [_.STUDY, _.LIBRARY]
        case _.HALL_D:
            return [_.HALL, _.BILLIARD]
        case _.HALL_E:
            return [_.LOUNGE, _.DINING]
        case _.HALL_F:
            return [_.LIBRARY, _.BILLIARD]
        case _.HALL_G:
            return [_.BILLIARD, _.DINING]
        case _.HALL_H:
            return [_.LIBRARY, _.CONSERVATORY]
        case _.HALL_I:
            return [_.BILLIARD, _.BALLROOM]
        case _.HALL_J:
            return [_.DINING, _.KITCHEN]
        case _.HALL_K:
            return [_.CONSERVATORY, _.BALLROOM]
        case _.HALL_L:
            return [_.BALLROOM, _.KITCHEN]
        default: 
            console.log("Awk Broken");
    }
  }

  inHall() {
    return ([_.HALL_A, _.HALL_B, _.HALL_C, _.HALL_D, _.HALL_E, _.HALL_F, _.HALL_G, _.HALL_H, _.HALL_I, _.HALL_J, _.HALL_K, _.HALL_L].includes(this.myLocation)) 
  }

  postCreateGame() {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/createGame", 
      { 
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Create Game")
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postJoinGame(game) {
    console.log('Trying to join game', game)
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/joinGame", 
      { 
        'userEmail': this.user, 
        'gameID': game
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Join Game")
        this.messageBoard = "Joined Game"
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postStartGame() {
    console.log('Start Game')
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/startGame", 
      { 
        'gameID': this.game['Name']
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push("Start Game")
        this.messageBoard = "Game Started"
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postGuessMurderer() {
    if (this.isMyTurn) {
      if (this.inHall()) {
        this.messageBoard = "Can't Guess, not in a room"
        return
      }
      if (this.selectedRoom !== this.myLocation) {
        this.messageBoard = "Must guess " + this.myLocation 
        return
      }
      console.log('Guess murderer')
      let httpOptions = {}
      return this.http.post<any>(
        "https://clueless-5ggvsxuoua-uk.a.run.app/guessMurderer", 
        { 
          'gameID': this.game['Name'], 
          'userEmail': this.user,
          'player': this.selectedCharacter, 
          'weapon': this.selectedWeapon,
          'room': this.selectedRoom
        }, 
        httpOptions).toPromise()
        .then((res) => {
          console.log(res);
          this.gameLog.push(res.success)
          this.clearSelection()
          if (res.success === "Guess Murderer Correct") {
            this.postEndGame()
            this.messageBoard ="You won the game!!!!"
          } else {
            this.messageBoard = "Sorry that wasn't the right answer"
          }
          this.gameLog.push("Guess murderer")
        }).catch((err) => {
          console.log("Err " + err)
          this.clearSelection()
        })
    } else {
      this.messageBoard = "Not your turn"
    }
    
  }

  postEndGame() {
    console.log('End game', this.game)
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/endGame", 
      { 
        'gameID': this.game['Name'], 
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push(res.success)
        this.clearSelection()
        this.inGame = false
        this.game = {}
        this.hasGameStarted = false
        this.setPlayerLocations()
        this.gameLog.push("End Game")
        this.cards = []
      }).catch((err) => {
        console.log("Err " + err)
        this.clearSelection()
      })
  }

  clearSelection() {
    this.selectedRoom = ''
    this.selectedWeapon = ''
    this.selectedCharacter = ''

  }
}
