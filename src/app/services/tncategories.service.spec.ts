import { TestBed } from '@angular/core/testing';

import { TncategoriesService } from './tncategories.service';

describe('TncategoriesService', () => {
  let service: TncategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TncategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
