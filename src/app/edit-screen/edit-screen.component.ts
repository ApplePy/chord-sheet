import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  list: Number[] = [];
  constructor() { for(let i: Number = 0; i < 1000; i++) {this.list.push(i)}}

  ngOnInit() {
  }

}
