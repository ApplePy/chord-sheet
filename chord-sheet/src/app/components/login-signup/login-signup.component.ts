import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-signup',
  templateUrl: 'login-signup.component.html',
  styleUrls: ['login-signup.component.css']
})
export class LoginSignupComponent implements OnInit {

  private display: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showSignUp() {
    this.display = true;
  }

}
