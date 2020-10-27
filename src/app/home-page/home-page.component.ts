import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  gameLog = [];

  constructor(private http: HttpClient) { 
  }

  clickedCell(square) {
    //this.gameLog += square;
    this.gameLog.push(square);
    console.log(this.gameLog);
    this.postMove()
  }

  postMove() {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/move", 
      { 'location': 1}, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push(res.success)
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postAccuse() {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/accuse", 
      {  
        'player': 1, 
        'location': 1,
        'weapon': 1
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push(res.success)
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  postSuggest() {
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/suggest", 
      { 
        'player': 1, 
        'weapon': 1
      }, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
        this.gameLog.push(res.success)
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  
}
