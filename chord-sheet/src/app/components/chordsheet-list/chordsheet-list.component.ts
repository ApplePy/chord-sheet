import {Component, OnInit, ViewChild} from '@angular/core';
import {ChordsheetService} from "../../services/chordsheet/chordsheet.service";
import {UserService} from "../../services/user/user.service";
import {ModalComponent} from "../common/modal/modal.component";

@Component({
  selector: 'app-chordsheet-list',
  templateUrl: 'chordsheet-list.component.html',
  styleUrls: ['chordsheet-list.component.css']
})
export class ChordsheetListComponent implements OnInit {
  @ViewChild(ModalComponent) modal: ModalComponent;

  meIndex: number = null;
  chordsheets: APIResponse.ChordsheetElements.result[] = [];

  constructor(private user: UserService, private chordsheetSerivce: ChordsheetService) { }

  ngOnInit() {
    // TODO: Refresh ChordSheets when user logs out
    this.chordsheetSerivce.retrieveChordSheets(true)
      .subscribe(
        data => this.chordsheets = data,
        err => console.log(err));
  }

  /** Trigger the modal to warn about the delete.
   *
   * @param id  The ID of the element that was requested to be deleted.
   */
  deleteModal(id: string) {
    // Get element requested
    this.meIndex = this.chordsheets.findIndex(element=> element._id == id);
    let modalElementDelete = this.chordsheets[this.meIndex];

    // Set up modal
    this.modal.title = "Delete " + modalElementDelete.songtitle + " ?";
    this.modal.message = "Are you sure you want to delete " + modalElementDelete.songtitle + " ?";
    this.modal.show();
  }

  /** Responds to the modal's response.
   *
   * @param $event  The response returned from the modal.
   */
  modalResponse($event: boolean) {
    if ($event == true) {
      // Request delete
      this.chordsheetSerivce.deleteChordSheet(this.chordsheets[this.meIndex].songtitle)
        .subscribe(
          res => { /*NOTE: Everything's been done. Just do nothing.*/ },
          err => {
            if (err.json && err.json().reason) console.error(err.json().reason);
            else {
              console.error("Delete failed.");
              console.debug(err);
            }
          });

      // Remove from list
      this.chordsheets.splice(this.meIndex, 1);
    }

    // Reset meIndex
    this.meIndex = null;
  }

}
