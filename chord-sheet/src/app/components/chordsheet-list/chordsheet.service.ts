import { Injectable } from '@angular/core';
import {Http, Headers, Response} from'@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChordsheetService {

  chordsheets: any[];   // TODO: Create a model for this

  constructor(private http: Http) { }

  retrieveChordSheet() {
    // Send request, and store result as logged-in variable.
    return this.http.get("/api/chordsheets")
      .map(res => {
        this.chordsheets = res.json();
        return this.chordsheets;
      });
  }

}
