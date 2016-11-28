import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {LoginComponent} from "./components/login/login.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {EditScreenComponent} from "./components/edit-screen/edit-screen.component";
import {MainScreenComponent} from "./components/main-screen/main-screen.component";
import {NotFoundComponent} from "./components/not-found/not-found.component"

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "privacy-policy", component: PrivacyComponent },
  { path: "edit", component: EditScreenComponent },
  { path: "home", component: MainScreenComponent },
  { path: "", redirectTo: "/home", pathMatch: 'full' },
  { path: "404", component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
