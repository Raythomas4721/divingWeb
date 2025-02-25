import { TestBed } from '@angular/core/testing';

import { TmordersService } from './tmorders.service';

describe('TmordersService', () => {
  let service: TmordersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TmordersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
