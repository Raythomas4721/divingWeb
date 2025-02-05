import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcategoriesComponent } from './procategories.component';

describe('ProcategoriesComponent', () => {
  let component: ProcategoriesComponent;
  let fixture: ComponentFixture<ProcategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcategoriesComponent]
    });
    fixture = TestBed.createComponent(ProcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
