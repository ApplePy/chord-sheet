import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  private URL: string = "/api/upload";
  public uploader: FileUploader = new FileUploader({url: this.URL});
  initial_title: string = "IT WORKS";
  title: string = this.initial_title;

  constructor() { }

  ngOnInit() {
  }

  onChange(event: Event) {  // Forcing event.target.files to stop complaining by swapping any <=> Event
    let target = <any> event.target;
    let files = target.files;

    if (files.length == 0) {
      this.uploader.clearQueue();
    } else {
      console.log(this.uploader.queue[0]);
      let file = <Blob> this.uploader.queue[0]._file;
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function(evt: any) {
        console.log(evt.target.result);
      }
    }
  }

  reset(event: Event) {
    this.title = this.initial_title;  // TODO: This doesn't work.
    this.uploader.clearQueue();
  }

}
