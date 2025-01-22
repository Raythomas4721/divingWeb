import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteRentalComponent } from './site-rental.component';

describe('SiteRentalComponent', () => {
  let component: SiteRentalComponent;
  let fixture: ComponentFixture<SiteRentalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteRentalComponent]
    });
    fixture = TestBed.createComponent(SiteRentalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
