import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcpayResultComponent } from './ecpay-result.component';

describe('EcpayResultComponent', () => {
  let component: EcpayResultComponent;
  let fixture: ComponentFixture<EcpayResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcpayResultComponent]
    });
    fixture = TestBed.createComponent(EcpayResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
