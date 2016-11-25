/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChordsheetListComponent } from './chordsheet-list.component';

describe('ChordsheetListComponent', () => {
  let component: ChordsheetListComponent;
  let fixture: ComponentFixture<ChordsheetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChordsheetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChordsheetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
