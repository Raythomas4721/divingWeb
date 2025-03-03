import { TestBed } from '@angular/core/testing';

import { NewebPayService } from './neweb-pay.service';

describe('NewebPayService', () => {
  let service: NewebPayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewebPayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
