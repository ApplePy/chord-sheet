import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ChordproValidatorService} from "../../services/chordpro-validator/chordpro-validator.service";
import {MessageInfo} from "../../models/message-info";
import { ChordsheetService } from "../../services/chordsheet/chordsheet.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-edit-screen',
  templateUrl: 'edit-screen.component.html',
  styleUrls: ['edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  @ViewChild("uploadform") uploadform: ElementRef;  // Reference to the form

  _initial_title: string;                           // The title that the form initially started with
  placeholder: string = "Chord Sheet Name";         // Placeholder text for the title
  title: string;                                    // Title of the new sheet
  is_private: boolean = false;

  file_contents: string = "";                       // Contents of the uploaded sheet
  manual_input: string = "";                        // Contents of manual data entry

  // Errors and warnings
  error: MessageInfo = new MessageInfo();
  warning: MessageInfo = new MessageInfo();

  constructor(private validator: ChordproValidatorService, private sender: ChordsheetService, private router: Router) { }

  /** Clear all error messages */
  private clearMessages(){
    this.error.deactivate();
    this.warning.deactivate();
  }

  /** Set up title if supplied */
  ngOnInit(initial_title: string = "") {
    if (!initial_title) {
      this.title = initial_title;
      this._initial_title = initial_title;
    }
  }

  /** When file is selected for upload */
  fileUpload(event: Event) {

    // Get files
    let target = <any> event.target;
    let files = target.files;

    // If a file was deselected
    if (files.length === 0) {
      this.file_contents = "";  // Remove file contents
    }

    // File was selected
    else {
      // Get file
      let file = files[0];
      let reader = new FileReader();

      // Check file limits
      if(file.size >= Math.pow(1024, 2)) {
        this.file_contents = "";
        this.error.setMessage("File too big", "The supplied file is over 1MB.");
        target.value = "";
        return;
      }

      // Read file and set success and error handlers
      reader.readAsText(file, 'UTF-8');
      reader.onload = function (evt: any) {
          this.file_contents = evt.target.result;
          this.clearMessages();
        }.bind(this);

      reader.onerror = function(evt: any) {
        this.setMessages("Bad file", evt.toString());
      }.bind(this);
    }
  }

  /** Trigger the page's actual reset */
  triggerReset(){
    this.uploadform.nativeElement.reset();
    this.file_contents = '';
    this.clearMessages();
    this.title = this._initial_title;
  }

  /** Check response from the modal. */
  resetConfirm($event: boolean) {
    if ($event == true) this.triggerReset();
  }

  /** Wrapper on validate for the template.
   *
   * @param $event    The DOM event.
   * @param contents  The string to evaluate.
   */
  validate_event($event: KeyboardEvent, contents: string) {
    // If backspace or enter are pressed, revalidate
    if ($event.keyCode == 13 || $event.keyCode == 8) this.validate(contents);
  }

  /** Validate contents typed in.
   *
   * @param contents    The contents to be validated.
   * @returns {boolean}
   */
  validate(contents: string): boolean {
    // Check validity
    let results = this.validator.validate(contents);

    // Set errors if exist
    if(results.containsIssues()) {
      if (results.errors.length) this.error.setMessages("Parse Errors", results.errors);
      if (results.warnings.length) this.warning.setMessages("Parse Warnings", results.warnings);
      return false;
    }
    // No errors, clean old ones
    else {
      this.error.deactivate();
      this.warning.deactivate();
    }

    // An empty sheet doesn't count as valid.
    return !(contents.length == 0);
  }

  /** Submit form.
   *
   * @param event   The DOM event created by triggering a form submit.
   */
  submit(event: Event) {

    let contents = (this.file_contents.length > 0) ? this.file_contents : this.manual_input;

    if (this.validate(contents)) {
      // No errors, upload
      this.sender.uploadChordSheet(this.title, this.is_private, contents).subscribe(res=>{
        if (res.success) this.router.navigate(["/"]);
        else this.error.setMessage("Upload Error", "The following message was returned from the server: " + res.reason);
      }, err => this.error.setMessage("Upload Error", "The following message was returned from the server: " + err.json().reason));
    }
    event.preventDefault();
  }
}
