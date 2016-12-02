import {Component, OnInit, ViewChild} from '@angular/core';
import {ChordsheetService} from "../../services/chordsheet/chordsheet.service";
import {ActivatedRoute, Router} from "@angular/router";
import Chordsheet = APIResponse.CsElements.Chordsheet;
import {UserService} from "../../services/user/user.service";
import {ModalComponent} from "../common/modal/modal.component";
require('datejs');

@Component({
  selector: 'app-view-chordsheet',
  templateUrl: './view-chordsheet.component.html',
  styleUrls: ['./view-chordsheet.component.css']
})
export class ViewChordsheetComponent implements OnInit {

  @ViewChild(ModalComponent) modal: ModalComponent;

  chordsheet: Chordsheet;

  constructor(private sender: ChordsheetService,
              private route: ActivatedRoute,
              private router: Router,
              private user: UserService, private chordservice: ChordsheetService) { }

  /** Set up title if supplied */
  ngOnInit() {
    // TODO: Fix the copy-pasta
    this.route.data
      .subscribe(
        (res: {data: Chordsheet | string | undefined }) => {
          // Check for bad values
          if (res.data && res.data != "create") {
            this.chordsheet = <Chordsheet> res.data;
          } else if (res.data == "create") {
            // Its create, do nothing TODO: Make this better.
          }
          else {
            // TODO: This happens during invalid access. Find something better!
            console.log("Denied access.");
            this.router.navigate(['/']);
          }
        }, err=>{console.log(err);this.router.navigate(['/']);}); // TODO: Make this all better
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
}
