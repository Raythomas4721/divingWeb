import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteReserveComponent } from './site-reserve.component';

describe('SiteReserveComponent', () => {
  let component: SiteReserveComponent;
  let fixture: ComponentFixture<SiteReserveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteReserveComponent]
    });
    fixture = TestBed.createComponent(SiteReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
