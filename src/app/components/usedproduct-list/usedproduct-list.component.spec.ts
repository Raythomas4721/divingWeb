import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedproductListComponent } from './usedproduct-list.component';

describe('UsedproductListComponent', () => {
  let component: UsedproductListComponent;
  let fixture: ComponentFixture<UsedproductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsedproductListComponent]
    });
    fixture = TestBed.createComponent(UsedproductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
