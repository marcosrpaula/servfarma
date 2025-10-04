import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsDashboardComponent } from './leads-dashboard.component';

describe('LeadsDashboardComponent', () => {
  let component: LeadsDashboardComponent;
  let fixture: ComponentFixture<LeadsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
