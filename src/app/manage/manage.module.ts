import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ManageHomeComponent } from './manage-home/manage-home.component';
import { ManageEventComponent } from './manage-event/manage-event.component';
import { LoginModule } from '../login/login.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EditWorkshopDialogComponent } from './manage-event/edit-workshop-dialog/edit-workshop-dialog.component';
import { ViewUsersDialogComponent } from './manage-event/view-users-dialog/view-users-dialog.component';
import { AvailabilityDialogComponent } from './manage-event/availability-dialog/availability-dialog.component';

const manageRoutes: Routes = [
  { path: '', component: ManageHomeComponent },
  { path: 'event/:eventId', component: ManageEventComponent },
]

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(manageRoutes),
    LoginModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [ManageHomeComponent, ManageEventComponent, EditWorkshopDialogComponent, ViewUsersDialogComponent, AvailabilityDialogComponent],
  entryComponents: [EditWorkshopDialogComponent, ViewUsersDialogComponent, AvailabilityDialogComponent]
})
export class ManageModule { }
