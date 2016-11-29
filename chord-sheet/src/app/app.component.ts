import { Component } from '@angular/core';
import {UserService} from "./services/user/user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private user: UserService) {

  }

  ngOnInit() {
    // Try logging in with token to set it up for all users before the rest of the app starts
    this.user.logintoken().subscribe(()=>{});
  }
}
