import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {UserService} from "../../user/user.service";


@Injectable()
export class RouteGuardService implements CanActivate {

  constructor(private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.isLoggedInAsync().map(result=>{if (!result) this.router.navigate(['/']); return result;})
  }

}
