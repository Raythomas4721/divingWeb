import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseorderreceivedComponent } from './courseorderreceived.component';

describe('CourseorderreceivedComponent', () => {
  let component: CourseorderreceivedComponent;
  let fixture: ComponentFixture<CourseorderreceivedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CourseorderreceivedComponent]
    });
    fixture = TestBed.createComponent(CourseorderreceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
