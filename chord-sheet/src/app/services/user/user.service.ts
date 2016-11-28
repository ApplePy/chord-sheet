import { Injectable } from '@angular/core';
import { Http, Headers, Response } from'@angular/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {Observable} from "rxjs";
import 'rxjs/add/operator/map';
import Login = APIResponse.Login;

@Injectable()
export class UserService {

  /** Stores whether the user is logged in. Populated by loginCommon(), wiped by logout().
   *
   * @type {boolean}
   */
  private loggedIn: boolean = false;

  constructor(private http: Http) { }

  /** Make the HTTP requests for credentials with pre-serialized data.
   *
   * @param creds
   * @returns {Observable<Login>}
   */
  private loginCommon(creds: string): Observable<Login> {
    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.post("/api/users/login", creds, {headers: headers})
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        return result;
      });
  }

  /** Log in user via cookie token.
   *
   * @returns {Observable<Login>}
   */
  logintoken(): Observable<Login> {
    // Check if there's a token to send.
    let token = Cookie.get('token');

    // If the user is already logged in, or there is no token to login with, then send an observable with the login state.
    if (!token || this.loggedIn)
      return Observable.create(observer => {
        observer.next(this.loggedIn);
        observer.complete();
      });

    // Setup credentials for sending
    let creds = JSON.stringify({token: token});

    return this.loginCommon(creds);
  }

  /** Log in user with username and password.
   *
   * @param username
   * @param password
   * @returns {Observable<Login>}
   */
  login(username: string, password: string): Observable<Login> {
    // Setup credentials for sending
    let creds = JSON.stringify({username: username, password: password});

    return this.loginCommon(creds);
  }

  /** Returns the current login state of the user.
   *
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /** Logs out the user.
   *
   */
  logout() {
    this.loggedIn = false;
    Cookie.delete('token');
  }

}
