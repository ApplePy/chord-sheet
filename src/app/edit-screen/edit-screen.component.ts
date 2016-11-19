import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  list: number[] = [];
  constructor() { for(let i: number = 0; i < 1000; i += 1) {this.list.push(i)}}

  ngOnInit() {
  }

}
