import {Component, OnInit, ViewChild} from '@angular/core';
import {ChordsheetService} from "../../services/chordsheet/chordsheet.service";
import {UserService} from "../../services/user/user.service";
import {ModalComponent} from "../common/modal/modal.component";
import {ErrorMessageComponent} from "../common/error-message/error-message.component";
import {Observable, Subscription} from "rxjs";
require('datejs');
import Chordsheet = APIResponse.CsElements.Chordsheet;

@Component({
  selector: 'app-chordsheet-list',
  templateUrl: 'chordsheet-list.component.html',
  styleUrls: ['chordsheet-list.component.css']
})
export class ChordsheetListComponent implements OnInit {
  @ViewChild(ModalComponent) modal: ModalComponent;
  @ViewChild("chordsheetError") errorMsg: ErrorMessageComponent;

  // Controls Chordsheet list error display
  displayInvalid: boolean = false;

  // Subscriptions
  loginStateSubscription: Subscription;

  // Data, modals
  meIndex: number = null;
  chordsheets: {result: Chordsheet, secondaryState: boolean}[] = [];

  constructor(private user: UserService, private chordsheetSerivce: ChordsheetService) { }

  ngOnInit() {
    // Refresh ChordSheets when user logs out
    // TODO: retrieveChordSheets unsubscribe
    let requestData = () => this.chordsheetSerivce.retrieveChordSheets(true)
      .subscribe(
        data => this.chordsheets = data.map(  // Add a secondary state to all the chordsheets
          (element: Chordsheet,
           index: number,
           data: Chordsheet[])=>{return {result: element, secondaryState: false}}),
        err => console.log(err));

    // Get initial tracks
    requestData();

    // When login state changes, reload chordsheets
    this.loginStateSubscription = this.user.observeLoginStateChange().subscribe(state=>requestData(), err=>{});
  }

  ngOnDestroy() {
    // Unsubscribe from the loginState
    this.loginStateSubscription.unsubscribe();
  }

  /** Trigger the modal to warn about the delete.
   *
   * @param id  The ID of the element that was requested to be deleted.
   */
  deleteModal(id: string) {
    // Get element requested
    this.meIndex = this.chordsheets.findIndex(element=> element.result._id == id);
    let modalElementDelete = this.chordsheets[this.meIndex];

    // Set up modal
    this.modal.title = "Delete " + modalElementDelete.result.songtitle + " ?";
    this.modal.message = "Are you sure you want to delete " + modalElementDelete.result.songtitle + " ?";
    this.modal.show();
  }

  /** Responds to the modal's response.
   *
   * @param $event  The response returned from the modal.
   */
  modalResponse($event: boolean) {
    let displayError = errMsg => {
      console.error("Delete failed.");
      console.log(errMsg);
      this.displayInvalid = true;
      this.errorMsg.messages = [errMsg,];
    };

    if ($event == true) {
      // Request delete
      this.chordsheetSerivce.deleteChordSheet(this.chordsheets[this.meIndex].result.songtitle)
        .subscribe(
          res => {
            // Remove from list
            if (res.success) {
              this.chordsheets.splice(this.meIndex, 1);
              this.displayInvalid = false;
            }

            // Notify of failure
            else displayError(res.reason);

            // Reset meIndex
            this.meIndex = null;
          },
          err => {
            // Reset meIndex
            this.meIndex = null;

            // If properly formatted JSON came back, print the reason
            if (err.json && err.json().reason) displayError(err.json().reason);

            // Bad JSON, dump whatever was returned.
            else displayError(err);
          });
    }
  }


  // TODO: Refactor with view-chordsheet
  /** Converts the chordsheet modified date into a human-friendly format.
   *
   * @param inDate  The date string to be parsed.
   */
  convertDate(inDate: string): string {
    return (<any>Date).parse(inDate).toString("dd MMMM yyyy, h:mm:sstt");
  }
}
