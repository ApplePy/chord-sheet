/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FullscreenService } from './fullscreen.service';

describe('FullscreenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FullscreenService]
    });
  });

  it('should ...', inject([FullscreenService], (service: FullscreenService) => {
    expect(service).toBeTruthy();
  }));
});
