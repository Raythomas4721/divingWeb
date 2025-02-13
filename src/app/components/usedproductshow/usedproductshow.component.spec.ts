import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedproductshowComponent } from './usedproductshow.component';

describe('UsedproductshowComponent', () => {
  let component: UsedproductshowComponent;
  let fixture: ComponentFixture<UsedproductshowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsedproductshowComponent]
    });
    fixture = TestBed.createComponent(UsedproductshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
