import { TestBed } from '@angular/core/testing';

import { TccoursesService } from './tccourses.service';

describe('TccoursesService', () => {
  let service: TccoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TccoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
