import { Injectable } from '@angular/core';
import {Http, Headers} from "@angular/http";
import {Observable} from "rxjs";
import Results = APIResponse.Results;
import DMCA = APIResponse.DMCA;

@Injectable()
export class DmcaService {

  constructor(private http: Http) { }


  /** Toggles the infringement state of a chordsheet.
   *
   * @param songtitle         The songtitle to be changed.
   * @param owner             The owner of the songtitle.
   * @param state             The desired state.
   * @returns {Observable<Results>}
   */
  toggleState(songtitle: string, owner: string, state: boolean): Observable<Results> {

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and return response.
    return this.http.put("/api/chordsheets/" + songtitle + '/' + owner + '/infringing/' + state.toString(), {headers: headers})
      .map(res => res.json());
  }


  /** Gets DMCA requests.
   *
   * @returns {Observable<DMCA[]>}
   */
  getDmca(): Observable<DMCA[]> {
    return this.http.get("/api/dmca").map(res => res.json());
  }


  /** Disable the active state of a DMCA request.
   *
   * @param req     The DMCA request.
   * @returns {Observable<Results>}
   */
  disableDmca(req: DMCA): Observable<Results> {
    return this.http.delete("/api/dmca/" + req._id).map(res => res.json());
  }




}
