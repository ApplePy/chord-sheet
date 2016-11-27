import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ChordproValidatorService} from "../../services/chordpro-validator/chordpro-validator.service";
import {MessageInfo} from "../../models/message-info";
import { ChordsheetService } from "../../services/chordsheet/chordsheet.service";
import { Router } from "@angular/router";
declare var $: any;

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
  is_private: boolean = true;

  // TODO: Merge file_contents and manual_input, and put under a model instead of leaving hanging here
  file_contents: string = "";                       // Contents of the uploaded sheet
  manual_input: string = "";                        // Contents of manual data entry

  // Errors and warnings
  error: MessageInfo = new MessageInfo();
  warning: MessageInfo = new MessageInfo();

  constructor(private validator: ChordproValidatorService, private sender: ChordsheetService, private router: Router) { }

  // Clear all error messages
  private clearMessages(){
    this.error.deactivate();
    this.warning.deactivate();
  }

  // Set up title if supplied
  ngOnInit(initial_title: string = "") {
    if (!initial_title) {
      this.title = initial_title;
      this._initial_title = initial_title;
    }
  }

  // When file is selected for upload
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

  // Trigger the page's actual reset
  triggerReset(){
    this.uploadform.nativeElement.reset();
    this.file_contents = '';
    this.clearMessages();
    this.title = this._initial_title;
  }

  // Ask to clear file contents when reset is triggered
  resetConfirm() {
    $('.ui.basic.modal').modal('show');
  }

  // Submit form
  submit(event: Event) {

    let contents = (this.file_contents.length > 0) ? this.file_contents : this.manual_input;

    let results = this.validator.validate(contents);

    // Send if no errors, otherwise display errors
    if (!results.containsIssues() && contents.length > 0) {
      this.sender.uploadChordSheet(this.title, this.is_private, contents).subscribe(res=>{
        if (res.success) this.router.navigate(["/home"]);
        else this.error.setMessage("Upload Error", "The following message was returned from the server: " + res.reason);
      }, err => this.error.setMessage("Upload Error", "The following message was returned from the server: " + err.json().reason));
      event.preventDefault();
    } else {
      // Set errors
      if (results.errors.length) this.error.setMessages("Parse Errors", results.errors);
      if (results.warnings.length) this.warning.setMessages("Parse Warnings", results.warnings);
      event.preventDefault();
    }
  }
}
