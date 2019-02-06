import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUsersDialogComponent } from './view-users-dialog.component';

describe('ViewUsersDialogComponent', () => {
  let component: ViewUsersDialogComponent;
  let fixture: ComponentFixture<ViewUsersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUsersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUsersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
