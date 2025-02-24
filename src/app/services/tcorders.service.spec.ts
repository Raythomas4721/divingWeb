import { TestBed } from '@angular/core/testing';

import { TcordersService } from 'src/app/services/tcorders.service';

describe('TcordersService', () => {
  let service: TcordersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TcordersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
