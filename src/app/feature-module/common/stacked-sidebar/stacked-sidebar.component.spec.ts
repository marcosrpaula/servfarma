import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedSidebarComponent } from './stacked-sidebar.component';

describe('StackedSidebarComponent', () => {
  let component: StackedSidebarComponent;
  let fixture: ComponentFixture<StackedSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StackedSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
