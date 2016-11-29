import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from "../../../services/user/user.service";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  // State
  invalid: boolean = false;

  // Data
  username: string;
  password: string;

  constructor(private user: UserService, private router: Router) { }

  ngOnInit() {
    // Redirect off page if logged in
    this.user.isLoggedInAsync().subscribe((res: boolean) => {if (res)this.router.navigate(["/"])} );
  }

  onSubmit($event: Event) {
    this.invalid = false;
    this.user.login(this.username, this.password).subscribe(result => {
      if (result.success == true) this.router.navigate(["/"]);  // TODO: Redirect to previous place
      else this.invalid = true;
    }, err => this.invalid = true);
    $event.preventDefault();
  }

}
