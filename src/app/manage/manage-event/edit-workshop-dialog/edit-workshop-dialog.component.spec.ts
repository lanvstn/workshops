import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkshopDialogComponent } from './edit-workshop-dialog.component';

describe('EditWorkshopDialogComponent', () => {
  let component: EditWorkshopDialogComponent;
  let fixture: ComponentFixture<EditWorkshopDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWorkshopDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWorkshopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
