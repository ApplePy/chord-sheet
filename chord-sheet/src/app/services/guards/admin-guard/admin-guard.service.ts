import { Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateChild } from '@angular/router';
import { UserService } from "../../user/user.service";


@Injectable()
export class AdminGuardService implements CanActivate, CanActivateChild {

  constructor(private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.isLoggedInAsync(true).map(result=>{if (!result) this.router.navigate(['/']); return result;})
  }

  canActivateChild() {
    return this.canActivate();
  }

}
