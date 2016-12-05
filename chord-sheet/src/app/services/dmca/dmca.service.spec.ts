/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DmcaService } from './dmca.service';

describe('DmcaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DmcaService]
    });
  });

  it('should ...', inject([DmcaService], (service: DmcaService) => {
    expect(service).toBeTruthy();
  }));
});
