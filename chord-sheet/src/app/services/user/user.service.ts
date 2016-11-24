import { Injectable } from '@angular/core';
import {Http, Headers, Response} from'@angular/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs";

@Injectable()
export class UserService {

  private loggedIn: boolean = false;

  constructor(private http: Http) { }

  // Make the HTTP requests for credentials
  private loginCommon(creds: Object): Observable<Response> {
    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.post("/api/login", creds, {headers: headers})  // TODO: Put host name in value inject
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        return result.success;
      });
  }

  // Log in user via token
  logintoken(): any {
    // Check if there's a token to send. Return a false Observable otherwise
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

  // Log in user
  login(username: string, password: string): any {
    // Setup credentials for sending
    let creds = JSON.stringify({username: username, password: password});

    return this.loginCommon(creds);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logout() {
    this.loggedIn = false;
    Cookie.delete('token');   // TODO: this doesn't wipe the cookie.
  }

}
