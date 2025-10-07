import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoColSidebarComponent } from './two-col-sidebar.component';

describe('TwoColSidebarComponent', () => {
  let component: TwoColSidebarComponent;
  let fixture: ComponentFixture<TwoColSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TwoColSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TwoColSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
