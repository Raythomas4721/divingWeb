import { TestBed } from '@angular/core/testing';

import { TNcartItemsService } from './tncart-items.service';

describe('TNcartItemsService', () => {
  let service: TNcartItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TNcartItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
