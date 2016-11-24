import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public user: UserService, private router: Router) { }

  ngOnInit() {
    // Try logging in with token to set it up for all users TODO: Find a better place to do this.
    this.user.logintoken().subscribe(()=>{});
  }

  // Log out user application-wide and redirect to home page TODO: Find a better place to do this.
  onLogout() {
    this.user.logout();
  }
}
