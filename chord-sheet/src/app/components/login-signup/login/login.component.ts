import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from "../../../services/user/user.service";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  // State
  invalid: boolean = false;
  readonly initMsg: string = "The supplied username or password was incorrect.";
  msg: string = "The supplied username or password was incorrect.";

  // Data
  username: string;
  password: string;

  constructor(private user: UserService, private router: Router, private location: Location) { }

  ngOnInit() {
    // Redirect off page if logged in
    this.user.isLoggedInAsync().subscribe((res: boolean) => {if (res)this.router.navigate(["/"])} );
  }

  onSubmit($event: Event) {
    this.invalid = false;
    this.user.login(this.username, this.password).subscribe(result => {
      if (result.success == true) this.location.back();
      else {
        this.invalid = true;
        this.msg = (result.reason) ? result.reason : this.initMsg;
      }
    }, err => {this.invalid = true; this.msg = (err.reason) ? err.reason : this.initMsg;});
    $event.preventDefault();
  }

}
