import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  placeholder: string = "*Chord Sheet Name*";   // Placeholder text for the title
  title: string;                                // Title of the new sheet

  public file_contents: string = "";            // Contents of the uploaded sheet

  // Error text
  public error_occurred: boolean = false;
  error_title: string = "";
  error_detail: string = "";

  constructor() { }

  ngOnInit() { }

  // When file is selected for upload
  fileUpload(event: Event) {

    // Get files
    let target = <any> event.target;
    let files = target.files;

    // If a file was deselected
    if (files.length == 0) {
      this.file_contents = "";  // Remove file contents
    }

    // File was selected
    else {
      // Get file
      let file = files[0];
      let reader = new FileReader();

      // Read file and set success and error handlers
      reader.readAsText(file, 'UTF-8');
      reader.onload = function(evt: any) {
        this.file_contents = evt.target.result;
        this.error_occurred = false;
      };

      reader.onerror = function(evt: any) {
        this.error_title = "Bad file";
        this.error_detail = evt.toString();
        this.error_occurred = true;
      };
    }
  }

  // Clear file contents when reset is triggered
  resetConfirm(event: Event) {
    // TODO: This doesn't work.
    this.file_contents = "";
  }

  submit(event: Event) {
    // TODO: Validate all data before sending
  }

}
