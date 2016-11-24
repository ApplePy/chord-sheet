import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import {SuiModule} from 'ng2-semantic-ui/ng2-semantic-ui';

import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { EditScreenComponent } from './components/edit-screen/edit-screen.component';
import { ChordDisplayComponent } from './components/chord-display/chord-display.component';
import { ChordproValidatorService } from './services/chordpro-validator/chordpro-validator.service';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    EditScreenComponent,
    ChordDisplayComponent,
    MainScreenComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SuiModule,
    RouterModule.forRoot([
      {
        path: "privacy-policy",
        component: PrivacyComponent
      },
      {
        path: "edit",
        component: EditScreenComponent
      },
      {
        path: "home",
        component: MainScreenComponent
      },
      {
        path: "",
        redirectTo: "/home",
        pathMatch: 'full'
      }
    ])
  ],
  providers: [
    ChordproValidatorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
