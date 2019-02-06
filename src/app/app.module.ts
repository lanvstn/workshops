import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { InfoComponent } from './info/info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { ChangeAdminPasswordDialogComponent } from './change-admin-password-dialog/change-admin-password-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

const appRoutes: Routes = [
  { path: '', component: InfoComponent },
  { path: 'events', loadChildren: './events/events.module#EventsModule' },
  { path: 'manage', loadChildren: './manage/manage.module#ManageModule' },
]

@NgModule({
  declarations: [
    AppComponent,
    InfoComponent,
    ChangeAdminPasswordDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ChangeAdminPasswordDialogComponent]
})
export class AppModule { }
