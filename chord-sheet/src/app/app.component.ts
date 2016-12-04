import { Component } from '@angular/core';
import {UserService} from "./services/user/user.service";
import {Subscription} from "rxjs";
import {FullscreenService} from "./services/fullscreen/fullscreen.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private title: string = "ChordSheet";

  private fullscreenMode: boolean = false;

  private fullscreenSub: Subscription;

  constructor(private user: UserService, private fullscreen: FullscreenService) { }

  ngOnInit() {
    // Try logging in with token to set it up for all users before the rest of the app starts
    this.user.logintoken().subscribe(()=>{});

    // Connect to fullscreen notification system
    this.fullscreenSub = this.fullscreen.getNotification().subscribe((state: boolean)=> this.fullscreenTrigger(state));
  }

  ngOnDestroy() {
    this.fullscreenSub.unsubscribe();
  }

  fullscreenTrigger(state: boolean) {
    this.fullscreenMode = state;
  }
}
