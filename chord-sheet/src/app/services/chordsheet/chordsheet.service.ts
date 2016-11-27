import { Injectable } from '@angular/core';
import {Http, Headers, Response} from'@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChordsheetService {

  chordsheets: any[];   // TODO: Create a model for this

  constructor(private http: Http) { }

  retrieveChordSheets() {
    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.get("/api/chordsheets", {headers: headers})
      .map(res => {
        this.chordsheets = res.json();
        return this.chordsheets;
      });
  }

  uploadChordSheet(songtitle: string, not_public: boolean, contents: string) {
    let data = JSON.stringify({songtitle: songtitle, "private": not_public, contents: contents});

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request
    return this.http.post("/api/chordsheets", data, {headers: headers})
      .map(res => res.json());
  }
}
