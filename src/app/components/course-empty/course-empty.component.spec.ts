import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseEmptyComponent } from './course-empty.component';

describe('CourseEmptyComponent', () => {
  let component: CourseEmptyComponent;
  let fixture: ComponentFixture<CourseEmptyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CourseEmptyComponent]
    });
    fixture = TestBed.createComponent(CourseEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
