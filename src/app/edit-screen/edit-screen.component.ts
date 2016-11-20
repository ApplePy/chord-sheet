import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  @ViewChild("uploadform") uploadform: ElementRef;  // Reference to the form

  _initial_title: string;                           // The title that the form initially started with
  placeholder: string = "*Chord Sheet Name*";       // Placeholder text for the title
  title: string;                                    // Title of the new sheet

  file_contents: string = "";                       // Contents of the uploaded sheet

  // Errors and warnings
  error: MessageInfo = new MessageInfo();
  warning: MessageInfo = new MessageInfo();

  private clearMessages(){
    this.error.deactivate();
    this.warning.deactivate();
  }

  ngOnInit(initial_title: string = "Hello World!") {
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
    if (files.length == 0) {
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
    event.preventDefault();
    // TODO: Validate all data before sending
  }
}

// Class to represent warning modals  TODO: See if modals can be refactored out into a component
class MessageInfo {
  protected active: boolean = false;
  protected title: string = "";
  protected details: string[] = [];

  //-------- CONSTRUCTORS --------//
  constructor(title:string, details: string[]) {
    this.title = title;
    this.details = details;
  }

  constructor() {}

  //-------- GETTERS --------//
  // Get active state
  public isActive(): boolean {
    return this.active;
  }

  // Get title
  public getTitle(): string {
    return this.title;
  }

  // Get details
  public getDetails(): string[] {
    return this.details;
  }

  //-------- SETTERS --------//
  // Set one error
  public setMessage(title: string, details: string) {
    this.setMessages(title, [details]);
  }

  // Set multiple errors
  public setMessages(title: string, details: string[]){
    this.active = true;
    this.title = title;
    this.details = details;
  }

  // Deactivate message
  public deactivate() {
    this.active = false;
  }
}
