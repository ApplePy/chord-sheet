import { Injectable } from '@angular/core';
import { Http, Headers, Response } from'@angular/http';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import 'rxjs/add/operator/map';
import Results = APIResponse.Results;

@Injectable()
export class UserService {

  /** Stores whether the user is logged in. Populated by loginCommon(), wiped by logout().
   *
   * @type {boolean}
   */
  private loggedIn: boolean = false;

  /** Stored the current login request that went out. */
  private requestInProgress: Observable<Results>;

  constructor(private http: Http, private router: Router) { }

  /** Make the HTTP requests for credentials with pre-serialized data.
   *
   * @param creds
   * @returns {Observable<Results>}
   */
  private loginCommon(creds: string): Observable<Results> {

    // If there's already a request in-flight, don't duplicate work
    if (this.requestInProgress) return this.requestInProgress;

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    this.requestInProgress = this.http.post("/api/users/login", creds, {headers: headers})
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        this.requestInProgress = null;    // Clean up in-progress marker
        return result;
      });

    return this.requestInProgress;
  }

  /** Log in user via cookie token.
   *
   * @returns {Observable<Results>}
   */
  logintoken(): Observable<Results> {
    // If the user is already logged in, or there is no token to login with, then send an observable with the login state.
    if (this.loggedIn)
      return Observable.create(observer => {
        observer.next(this.loggedIn);
        observer.complete();
      });

    // Setup credentials for sending (mostly to satisfy loginCommon)
    let creds = JSON.stringify({token: true});

    return this.loginCommon(creds);
  }

  /** Log in user with username and password.
   *
   * @param username
   * @param password
   * @returns {Observable<Results>}
   */
  login(username: string, password: string): Observable<Results> {

    // If the user is already logged in,then send an observable with the login state.
    if (this.loggedIn)
      return Observable.create(observer => {
        observer.next(this.loggedIn);
        observer.complete();
      });

    // Setup credentials for sending
    let creds = JSON.stringify({username: username, password: password});

    return this.loginCommon(creds);
  }

  /** Returns the current login state of the user. For binding on the template.
   *
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /** Returns the current login state of the user. If there is a login request in progress, it will wrap the request and return.
   *
   * @returns {Observable<boolean>}
   */
  isLoggedInAsync(): Observable<boolean> {
    return Observable.create(observer => {

      // If a request is in progress, wrap and send that
      if (this.requestInProgress) {
        this.requestInProgress.subscribe( (result: Results)=> {observer.next(result.success); observer.complete(); } );
      }

      // No request in-flight, send the existing results.
      else {
          observer.next(this.loggedIn);
          observer.complete();
        }
    });

  }

  /** Logs out the user.
   *
   */
  logout() {
    let logoutFunc = ()=>{this.loggedIn = false};
    this.http.get('/api/users/logout').subscribe(logoutFunc, logoutFunc);
  }

  /** Allows a user to sign up.
   *
   * @param firstname
   * @param lastname
   * @param username
   * @param password
   * @returns {Observable<Results>}
   */
  signUp(firstname: string, lastname: string, username: string, password: string): Observable<Results> {
    // Prevent sign-up if user is already logged in
    if (this.loggedIn)
      return Observable.create(observer => {
        observer.next({success: false, reason: "Requester is already logged in."});
        observer.complete();
      });

    // Setup credentials for sending
    let creds = JSON.stringify({firstname: firstname, lastname: lastname, username: username, password: password});

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.post("/api/users", creds, {headers: headers})
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        return result;
      });
  }

}
