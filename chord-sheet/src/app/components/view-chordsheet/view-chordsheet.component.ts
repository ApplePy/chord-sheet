import {Component, OnInit, ViewChild} from '@angular/core';
import {ChordsheetService} from "../../services/chordsheet/chordsheet.service";
import {ActivatedRoute, Router, UrlSegment} from "@angular/router";
import Chordsheet = APIResponse.CsElements.Chordsheet;
import {UserService} from "../../services/user/user.service";
import {ModalComponent} from "../common/modal/modal.component";
import {Observable} from "rxjs";
require('datejs');

@Component({
  selector: 'app-view-chordsheet',
  templateUrl: './view-chordsheet.component.html',
  styleUrls: ['./view-chordsheet.component.css']
})
export class ViewChordsheetComponent implements OnInit {

  @ViewChild(ModalComponent) modal: ModalComponent;

  chordsheet: Chordsheet;
  previousRevisions: Chordsheet[];

  constructor(private sender: ChordsheetService,
              private route: ActivatedRoute,
              private router: Router,
              private user: UserService, private chordservice: ChordsheetService) { }

  /** Set up title if supplied */
  ngOnInit() {
    this.route.data
      .subscribe(
        (res: {data: any}) => {
          // Check for bad values (null for create page, [...] for results, [] for denied access)
          if (res.data !== null) {
            if (res.data.length > 0) {
              // Get chordsheet data from back into place
              this.chordsheet = res.data[0];      // Put the first one in the box
              res.data.splice(0, 1);              // Cut out the first one
              this.previousRevisions = res.data;  // Put the remainder as previous revisions
            }
            else {
              // This happens during invalid access.
              console.warn("Access Denied.");
              this.router.navigate(['/']);
            }
          }
          // If you reach here without hitting any blocks of code above, then it's a create page
        }, err=>{console.log(err);this.router.navigate(['/']);});
  }

  /** Trigger the modal to warn about the delete. */
  deleteModal() {
    // Set up modal
    this.modal.title = "Delete " + this.chordsheet.songtitle + " ?";
    this.modal.message = "Are you sure you want to delete " + this.chordsheet.songtitle + " ?";
    this.modal.show();
  }

  /** Responds to the modal's response.
   *
   * @param $event  The response returned from the modal.
   */
  modalResponse($event: boolean) {
    if ($event == true) {

      // Delete and navigate to main page on success, console.error any errors.
      this.chordservice.deleteChordSheet(this.chordsheet.songtitle).subscribe(res=> {
        if (res.success) this.router.navigate(['/']);
        else console.error(res.reason);
        }, err=>{if (err && err.json() && err.json().reason) console.error(err.reason); else console.error(err);});
    }
  }

  /** Converts the chordsheet modified date into a human-friendly format.
   *
   * @param inDate  The date string to be parsed.
   */
  convertDate(inDate: string): string {
    return (<any>Date).parse(inDate).toString("dd MMMM yyyy, h:mm:sstt");
  }

  restoreRevision(version: Chordsheet) {
    // Navigate to same page to reload content (lazy)
    this.chordservice.uploadChordSheet(version.songtitle, version.private, version.contents)
      .subscribe(()=>{});

    // Reconfigure the front-end
    this.previousRevisions = [this.chordsheet].concat(this.previousRevisions);
    this.chordsheet = version;
    this.chordsheet.date = new Date(Date.now()).toString();
  }
}
