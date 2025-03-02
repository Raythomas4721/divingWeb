import { TestBed } from '@angular/core/testing';

import { TnreviewService } from './tnreview.service';

describe('TnreviewService', () => {
  let service: TnreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TnreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
