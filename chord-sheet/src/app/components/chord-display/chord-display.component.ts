import {Component, OnInit, Input} from '@angular/core';
const chordpro = require('chordprojs');

@Component({
  selector: 'app-chord-display',
  templateUrl: 'chord-display.component.html',
  styleUrls: ['chord-display.component.css']
})
export class ChordDisplayComponent implements OnInit {

  @Input() set content(inStr: string) {
    console.log('test');
    this.renderedContent = chordpro.format(inStr).html;
  }

  // The rendered content
  private renderedContent: string = "";

  constructor() { }

  ngOnInit() {
  }

}
