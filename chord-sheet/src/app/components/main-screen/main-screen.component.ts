import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-screen',
  templateUrl: 'main-screen.component.html',
  styleUrls: ['main-screen.component.css']
})
export class MainScreenComponent implements OnInit {
  title: string = "ChordSheet";   // TODO: Refactor this into a value injector.

  constructor() { }

  ngOnInit() {
  }

}
