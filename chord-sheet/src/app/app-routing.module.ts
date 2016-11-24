import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginComponent} from "./components/login/login.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {EditScreenComponent} from "./components/edit-screen/edit-screen.component";
import {MainScreenComponent} from "./components/main-screen/main-screen.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "privacy-policy", component: PrivacyComponent },
  { path: "edit", component: EditScreenComponent },
  { path: "home", component: MainScreenComponent },
  { path: "", redirectTo: "/home", pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
