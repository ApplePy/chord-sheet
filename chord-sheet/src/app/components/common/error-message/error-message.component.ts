import {Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent implements OnInit {

  // The title and message(s) of the box
  @Input() title: string;
  @Input() messages: string[] = [];

  // Specifies if the message box is an error or a warning
  @Input() warning: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
