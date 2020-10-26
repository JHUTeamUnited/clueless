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
    this.postMove();
  }

  clickedCell(square) {
    //this.gameLog += square;
    this.gameLog.push(square);
    console.log(this.gameLog);
  }

  postMove() {
    console.log("Clicked!")
    let httpOptions = {}
    return this.http.post<any>(
      "https://clueless-5ggvsxuoua-uk.a.run.app/move", 
      {}, 
      httpOptions).toPromise()
      .then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log("Err " + err)
      })
  }

  
}
