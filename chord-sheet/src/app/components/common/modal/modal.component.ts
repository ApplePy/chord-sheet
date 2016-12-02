import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() title: string;
  @Input() message: string;
  @Input() negative: string = "No";
  @Input() positive: string = "Yes";

  @Output() response = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    $('.ui.dimmer').remove(); // Prevent angular caching from making a mess of things.
  }

  /** Displays the modal. */
  show() {
    $('.ui.basic.modal')
      .modal({
        blurring: true
      })
      .modal('setting', 'observeChanges', true)
      .modal('setting', 'closable', false)
      .modal('show')
      .modal('refresh');
  }

}
