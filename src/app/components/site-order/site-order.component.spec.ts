import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteOrderComponent } from './site-order.component';

describe('SiteOrderComponent', () => {
  let component: SiteOrderComponent;
  let fixture: ComponentFixture<SiteOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteOrderComponent]
    });
    fixture = TestBed.createComponent(SiteOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
