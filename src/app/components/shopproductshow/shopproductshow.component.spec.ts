import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopproductshowComponent } from './shopproductshow.component';

describe('ShopproductshowComponent', () => {
  let component: ShopproductshowComponent;
  let fixture: ComponentFixture<ShopproductshowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopproductshowComponent]
    });
    fixture = TestBed.createComponent(ShopproductshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
