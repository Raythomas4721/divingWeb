import { TestBed } from '@angular/core/testing';

import { SharedcartService } from './sharedcart.service';

describe('SharedcartService', () => {
  let service: SharedcartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedcartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
