import {Component, OnInit, ElementRef} from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {FullscreenService} from "../../services/fullscreen/fullscreen.service";

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.css']
})
export class HeaderComponent implements OnInit {

  private fullscreenSub: Subscription;

  constructor(public user: UserService,
              private router: Router,
              private elRef: ElementRef,
              private fullscreen: FullscreenService) { }

  ngOnInit() {
    this.fullscreenSub = this.fullscreen.getNotification().subscribe((state: boolean)=>this.fullscreenTrigger(state));
  }

  ngOnDestroy() {
    this.fullscreenSub.unsubscribe();
  }

  fullscreenTrigger(state: boolean) {
    this.elRef.nativeElement.hidden = state;
  }

}
