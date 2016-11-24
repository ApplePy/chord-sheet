import { Injectable } from '@angular/core';
import { Http, Headers } from'@angular/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs";

@Injectable()
export class UserService {

  private loggedIn: boolean;

  constructor(private http: Http) { }

  // Log in user via token
  logintoken(): any {
    // Check if there's a token to send. Return a false Observable otherwise
    let token = Cookie.get('token');
    if (!token) return Observable.create(observer => {
      // Yield bad login
      observer.onNext(false);
      observer.onCompleted();
    });

    // Setup credentials for sending
    let creds = JSON.stringify({token: token});

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.post("http://localhost:8080/api/login", creds, {headers: headers})  // TODO: Put host name in value inject
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        return result.success;
      })
  }

  // Log in user
  login(username: string, password: string): any {
    // Setup credentials for sending
    let creds = JSON.stringify({username: username, password: password});

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.post("http://localhost:8080/api/login", creds, {headers: headers})  // TODO: Put host name in value inject
      .map(res => {
        let result = res.json();
        this.loggedIn = result.success;
        return result.success;
      })
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logout() {
    this.loggedIn = false;
    Cookie.delete('token');
  }

}
