import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAdminPasswordDialogComponent } from './change-admin-password-dialog.component';

describe('ChangeAdminPasswordDialogComponent', () => {
  let component: ChangeAdminPasswordDialogComponent;
  let fixture: ComponentFixture<ChangeAdminPasswordDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAdminPasswordDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAdminPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
