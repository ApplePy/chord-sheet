import { Injectable } from '@angular/core';
import {Http, Headers} from "@angular/http";
import {Observable} from "rxjs";
import Results = APIResponse.Results;

@Injectable()
export class DmcaService {

  constructor(private http: Http) { }

  toggleState(songtitle: string, owner: string, state: boolean): Observable<Results> {

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and return response.
    return this.http.put("/api/chordsheets/" + songtitle + '/' + owner + '/infringing/' + state.toString(), {headers: headers})
      .map(res => res.json());
  }

}
