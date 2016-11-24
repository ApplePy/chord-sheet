/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChordproValidatorService } from './chordpro-validator.service';

describe('ChordproValidatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChordproValidatorService]
    });
  });

  it('should ...', inject([ChordproValidatorService], (service: ChordproValidatorService) => {
    expect(service).toBeTruthy();
  }));
});
