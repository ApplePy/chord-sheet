import { Component, OnInit } from '@angular/core';
import {ChordsheetService} from "../../services/chordsheet/chordsheet.service";
import { ResponsiveModule } from 'ng2-responsive';

@Component({
  selector: 'app-chordsheet-list',
  templateUrl: 'chordsheet-list.component.html',
  styleUrls: ['chordsheet-list.component.css']
})
export class ChordsheetListComponent implements OnInit {

  chordsheets: any[] = [];

  constructor(private chordsheetSerivce: ChordsheetService) { }

  ngOnInit() {


    this.chordsheetSerivce.retrieveChordSheets(true)
      .subscribe(data => this.chordsheets = data);
  }

}
