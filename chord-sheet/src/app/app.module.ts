import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ResponsiveModule } from 'ng2-responsive';

import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { EditScreenComponent } from './components/edit-screen/edit-screen.component';
import { ChordDisplayComponent } from './components/chord-display/chord-display.component';
import { ChordproValidatorService } from './services/chordpro-validator/chordpro-validator.service';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { LoginComponent } from './components/login-signup/login/login.component';
import { AppRoutingModule } from "./app-routing.module";
import { UserService } from "./services/user/user.service";
import { ChordsheetListComponent } from './components/chordsheet-list/chordsheet-list.component';
import { ChordsheetService } from "./services/chordsheet/chordsheet.service";
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ErrorMessageComponent } from './components/common/error-message/error-message.component';
import { ModalComponent } from './components/common/modal/modal.component';
import { SignupComponent } from './components/login-signup/signup/signup.component';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { RouteGuardService } from "./services/guards/route-guard/route-guard.service";
import { ViewChordsheetComponent } from './components/view-chordsheet/view-chordsheet.component';
import { DmcaComponent } from './components/dmca/dmca.component';
import { DmcaPolicyComponent } from './components/dmca/dmca-policy/dmca-policy.component';
import { AdminGuardService } from "./services/guards/admin-guard/admin-guard.service";
import { FullscreenService } from "./services/fullscreen/fullscreen.service";
import { DmcaService } from "./services/dmca/dmca.service";
import { DmcaRequestsComponent } from './components/dmca/dmca-requests/dmca-requests.component';
import { DmcaDisputeComponent } from './components/dmca/dmca-dispute/dmca-dispute.component';


@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    EditScreenComponent,
    ChordDisplayComponent,
    MainScreenComponent,
    PrivacyComponent,
    LoginComponent,
    ChordsheetListComponent,
    NotFoundComponent,
    ErrorMessageComponent,
    ModalComponent,
    SignupComponent,
    LoginSignupComponent,
    ViewChordsheetComponent,
    DmcaComponent,
    DmcaPolicyComponent,
    DmcaRequestsComponent,
    DmcaDisputeComponent
  ],
  imports: [
    ResponsiveModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DmcaService,
    FullscreenService,
    AdminGuardService,
    RouteGuardService,
    ChordsheetService,
    UserService,
    ChordproValidatorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
