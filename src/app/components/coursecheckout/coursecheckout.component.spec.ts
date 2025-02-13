import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursecheckoutComponent } from './coursecheckout.component';

describe('CoursecheckoutComponent', () => {
  let component: CoursecheckoutComponent;
  let fixture: ComponentFixture<CoursecheckoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursecheckoutComponent]
    });
    fixture = TestBed.createComponent(CoursecheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
