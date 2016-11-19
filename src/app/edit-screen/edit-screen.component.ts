import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  placeholder: string = "*Chord Sheet Name*";   // Placeholder text for the title
  title: string;                                // Title of the new sheet

  file_contents: string = "";                   // Contents of the uploaded sheet

  constructor() { }

  ngOnInit() { }

  onChange(event: Event) {
    let target = <any> event.target;
    let files = target.files;

    if (files.length == 0) {
      this.file_contents = "";
    } else {
      let file = files[0];
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function(evt: any) {
        this.file_contents = evt.target.result;
      }
    }
  }

  // Clear file contents when reset is triggered
  reset(event: Event) {
    //this.title = this.initial_title;  // TODO: This doesn't work.
    this.file_contents = "";
  }

  submit(event: Event) {

  }

}
