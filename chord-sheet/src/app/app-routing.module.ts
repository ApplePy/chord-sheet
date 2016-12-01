import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginSignupComponent} from "./components/login-signup/login-signup.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {EditScreenComponent} from "./components/edit-screen/edit-screen.component";
import {MainScreenComponent} from "./components/main-screen/main-screen.component";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {RouteGuardService} from "./services/guards/route-guard/route-guard.service";
import {ChordsheetService} from "./services/chordsheet/chordsheet.service";

const routes: Routes = [
  { path: "login", component: LoginSignupComponent },
  { path: "privacy-policy", component: PrivacyComponent },
  { path: "create", component: EditScreenComponent, canActivate: [RouteGuardService], resolve: {data: ChordsheetService} },
  { path: "edit/:songtitle", component: EditScreenComponent, canActivate: [RouteGuardService], resolve: {data: ChordsheetService} },
  { path: "", component: MainScreenComponent },
  { path: "404", component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
