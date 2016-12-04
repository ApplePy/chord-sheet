import { Component, OnInit, ElementRef } from '@angular/core';
import { FullscreenService } from "../../services/fullscreen/fullscreen.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.css']
})
export class FooterComponent implements OnInit {

  private fullscreenSub: Subscription;

  constructor(private elRef: ElementRef, private fullscreen: FullscreenService) { }

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
