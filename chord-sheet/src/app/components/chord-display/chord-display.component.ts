import {Component, OnInit, Input} from '@angular/core';
import {FullscreenService} from "../../services/fullscreen/fullscreen.service";
import Chordsheet = APIResponse.CsElements.Chordsheet;
import {Router, ActivatedRoute} from "@angular/router";
const chordpro = require('chordprojs');

@Component({
  selector: 'app-chord-display',
  templateUrl: 'chord-display.component.html',
  styleUrls: ['chord-display.component.css']
})
export class ChordDisplayComponent implements OnInit {

  @Input() set content(inStr: string) {
    this.renderedContent = chordpro.format(inStr).html;
  }

  private fullscreen: boolean = false;

  // The rendered content
  private renderedContent: string = "";

  constructor(private fullscreenService: FullscreenService,
              private route: ActivatedRoute,
              private router: Router) { }


  /** If initiated as a full view, get data and trigger fullscreen. */
  ngOnInit() {
    this.route.data
      .subscribe(
        (res: {data: any}) => {
          // Check for bad values (null for create page, [...] for results, [] for denied access)
          console.log(res.data);
          if (res.data !== null && res.data.length > 0) {
            // Get chordsheet data from back into place and reset form
            let data = <Chordsheet> res.data[0];
            this.content = data.contents;

            // Mark this component as being displayed as a full object
            this.fullscreen = true;
            this.fullscreenService.notify(true);
          }
          else {
            // This happens during invalid access.
            console.warn("Access Denied.");
            this.router.navigate(['/']);
          }
        });
  }


  /** On fullscreen, trigger everyone that fullscreen is going off */
  ngOnDestroy() {
    // Notify leaving fullscreen
    if (this.fullscreen)
      this.fullscreenService.notify(false);
  }

}
