import { TestBed } from '@angular/core/testing';

import { TnproductService } from './tnproduct.service';

describe('TnproductService', () => {
  let service: TnproductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TnproductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
