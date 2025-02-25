import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedproducteditComponent } from './usedproductedit.component';

describe('UsedproducteditComponent', () => {
  let component: UsedproducteditComponent;
  let fixture: ComponentFixture<UsedproducteditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsedproducteditComponent]
    });
    fixture = TestBed.createComponent(UsedproducteditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
