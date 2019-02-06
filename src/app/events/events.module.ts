import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { EventsComponent } from './events.component';
import { LoginModule } from '../login/login.module';

const eventRoutes: Routes = [
  { path: '', component: EventsComponent },
  { path: ':eventName', component: EventsComponent },
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(eventRoutes),
    LoginModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [EventsComponent]
})
export class EventsModule { }
