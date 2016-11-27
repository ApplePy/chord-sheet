/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChordsheetService } from './chordsheet.service';

describe('ChordsheetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChordsheetService]
    });
  });

  it('should ...', inject([ChordsheetService], (service: ChordsheetService) => {
    expect(service).toBeTruthy();
  }));
});
