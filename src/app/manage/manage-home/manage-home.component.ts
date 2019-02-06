import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Event } from 'src/app/models/event'
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NotifyService } from 'src/app/services/notify.service';

@Component({
  selector: 'app-manage-home',
  templateUrl: './manage-home.component.html',
  styleUrls: ['./manage-home.component.css']
})
export class ManageHomeComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    if (this.authService.currentUser.id) {
      // Already logged in
      if (this.authService.currentUser.permission > 10){
        this.afterLogin();
      }
      else {
        this.notifyService.error("Je bent niet bevoegd voor deze pagina", true);
      }
    }
  }

  events: Event[];

  afterLogin() {
    // Load events into app
    this.apiService.getEventList().subscribe(events => {
      this.events = events;
    },
    error => {
      this.notifyService.error(`Fout ${error.status} bij ophalen evenementenlijst (${error.error.description})`, true);
    });
  }

  openEvent(eventId) {
    this.router.navigateByUrl(`/manage/event/${eventId}`);
  }

  newEvent() {
    this.apiService.postEmptyEvent().subscribe(event => {
      this.afterLogin();
    },
    error => {
      this.notifyService.error(`Fout ${error.status} bij aanmaken van evenement (${error.error.description})`, true);
    });
  }
}
