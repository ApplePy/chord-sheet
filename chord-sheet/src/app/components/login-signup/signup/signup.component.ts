import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from "../../../services/user/user.service";

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.css']
})
export class SignupComponent implements OnInit {

  // State
  invalid: boolean = false;

  // Data
  firstname: string;
  lastname: string;
  username: string;
  password: string;

  serverErrorMessage: string = "";

  constructor(private user: UserService, private router: Router, private location: Location) { }

  ngOnInit() {
    // Redirect off page if logged in
    this.user.isLoggedInAsync().subscribe((res: boolean) => {if (res)this.router.navigate(["/"])} );
  }

  onSubmit($event: Event) {
    this.invalid = false;

    if (!this.firstname || !this.lastname || !this.username || !this.password) {
      this.serverErrorMessage = "Missing information.";
      this.invalid = true;
    }

    this.user.signUp(this.firstname, this.lastname, this.username, this.password).subscribe(result => {
      if (result.success == true) this.location.back();
      else this.invalid = true;
      this.serverErrorMessage = result.reason;
    }, err => {this.serverErrorMessage = err.json().reason; this.invalid = true});

    $event.preventDefault();
  }

}


