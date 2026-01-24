import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRegistrationComponent } from './sales-registration.component';

describe('SalesRegistrationComponent', () => {
  let component: SalesRegistrationComponent;
  let fixture: ComponentFixture<SalesRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
