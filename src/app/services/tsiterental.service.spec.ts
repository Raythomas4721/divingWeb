import { TestBed } from '@angular/core/testing';

import { TsiterentalService } from './tsiterental.service';

describe('TsiterentalService', () => {
  let service: TsiterentalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TsiterentalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
