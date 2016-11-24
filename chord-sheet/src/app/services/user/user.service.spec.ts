/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserServiceService } from './user.service';

describe('UserServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserServiceService]
    });
  });

  it('should ...', inject([UserServiceService], (service: UserServiceService) => {
    expect(service).toBeTruthy();
  }));
});
