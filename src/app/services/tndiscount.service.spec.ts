import { TestBed } from '@angular/core/testing';

import { TndiscountService } from './tndiscount.service';

describe('TndiscountService', () => {
  let service: TndiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TndiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
