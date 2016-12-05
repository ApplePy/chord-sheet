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

  /** Get specific DMCA request.
   *
   * @returns {Observable<DMCA>}
   */
  getOneDmca(id: string): Observable<DMCA> {
    return this.http.get("/api/dmca/" + id).map(res => res.json());
  }


  /** Disable the active state of a DMCA request.
   *
   * @param req     The DMCA request.
   * @returns {Observable<Results>}
   */
  disableDmca(req: DMCA): Observable<Results> {
    return this.http.delete("/api/dmca/" + req._id).map(res => res.json());
  }


  /** Log a dispute to a DMCA request.
   *
   * @param id        The ID of the DMCA request.
   * @param dispute   The dispute text to log.
   * @returns {Observable<Results>}
   */
  fileDispute(id: string, dispute: string): Observable<Results> {

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post("/api/dmca/" + id + '/dispute',{dispute: dispute}, {headers: headers})
      .map(res => res.json());
  }

  /** Submit a takedown request form
   *
   * @param form    The form containing the information to be sent
   */
  fileRequest(form: any) {

    let contents = JSON.stringify(form);

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post("/api/dmca/",contents, {headers: headers})
      .map(res => res.json());
  }

}
