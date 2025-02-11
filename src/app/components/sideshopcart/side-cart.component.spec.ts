import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sideshopcart } from './side-cart.component';

describe('Sideshopcart', () => {
  let component: Sideshopcart;
  let fixture: ComponentFixture<Sideshopcart>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Sideshopcart],
    });
    fixture = TestBed.createComponent(Sideshopcart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
