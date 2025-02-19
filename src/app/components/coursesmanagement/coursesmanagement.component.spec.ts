import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesmanagementComponent } from './coursesmanagement.component';

describe('CoursesmanagementComponent', () => {
  let component: CoursesmanagementComponent;
  let fixture: ComponentFixture<CoursesmanagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursesmanagementComponent]
    });
    fixture = TestBed.createComponent(CoursesmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
