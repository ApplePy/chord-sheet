import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginSignupComponent} from "./components/login-signup/login-signup.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {EditScreenComponent} from "./components/edit-screen/edit-screen.component";
import {MainScreenComponent} from "./components/main-screen/main-screen.component";
import {NotFoundComponent} from "./components/not-found/not-found.component"

const routes: Routes = [
  { path: "login", component: LoginSignupComponent },
  { path: "privacy-policy", component: PrivacyComponent },
  { path: "edit", component: EditScreenComponent },
  { path: "", component: MainScreenComponent },
  { path: "404", component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
