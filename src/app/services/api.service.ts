import { Injectable } from '@angular/core';
import { Event } from '../models/event';
import { Workshop } from '../models/workshop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { WorkshopLink } from '../models/workshop-link';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { Registration } from '../models/registration';
import { NotifyService } from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notifyService: NotifyService) {
  }

  /*
   * Events
   */

  getEventList(): Observable<Event[]> {
    return this.http.get(`${environment.apiEndpoint}/events`).pipe(
      map((res: any) => {
        const events: Event[] = [];

        res.events.forEach(eventData => {
          const event = new Event();
          Object.assign(event, eventData);
          events.push(event);
        });

        return events;
      })
    );
  }

  getEvent(eventId): Observable<Event> {
    return this.http.get(`${environment.apiEndpoint}/events/${eventId}`).pipe(
      map((res: any) => {
        const event = new Event();
        Object.assign(event, res);
        
        return event;
      })
    );
  }

  getWorkshopLinks(event: Event): Observable<WorkshopLink[]> {
    return this.http.get(`${environment.apiEndpoint}/events/${event.id}/workshop_links`).pipe(
      map((res: any) => {
        const workshop_links: WorkshopLink[] = [];

        res.workshop_links.forEach(workshop_link_data => {
          // Create workshop link object with references to workshop object instead of ID
          const workshop_link = new WorkshopLink();

          // Find workshop object that corresponds to the ID in the API response
          workshop_link.workshop1 = event.workshops.find(workshop => {
            // Workshop link data is an array for some reason so [0] is a workaround
            return workshop.id == workshop_link_data[0].workshop1_id;
          });

          // Now do the same for the other side of the link
          workshop_link.workshop2 = event.workshops.find(workshop => {
            return workshop.id == workshop_link_data[0].workshop2_id;
          });

          // Link type
          workshop_link.link_type = workshop_link_data[0].link_type;

          workshop_links.push(workshop_link);

        });
        return workshop_links;
      })
    );
  }

  postEmptyEvent(): Observable<Event> {
    const event = new Event();

    // Create temporary event title
    const now = new Date().valueOf();
    event.name = now.toString();

    return this.http.post(`${environment.apiEndpoint}/events`, event).pipe(
      map((res: any) => {
        const returnedEvent = new Event();
        Object.assign(returnedEvent, res);

        return returnedEvent;
      })
    );
  }

  putEvent(event: Event): Observable<Event> {
    return this.http.put(`${environment.apiEndpoint}/events/${event.id}`, event).pipe(
      map((res: any) => {
        const event = new Event();
        Object.assign(event, res);
        
        return event;
      })
    );
  }

  putWorkshopLinks(event: Event, workshop_links_objects: WorkshopLink[]) {
    const workshop_links = []
    workshop_links_objects.forEach(workshop_link_object => {
      const workshop_link = {
        'workshop1_id': workshop_link_object.workshop1.id,
        'workshop2_id': workshop_link_object.workshop2.id,
        'link_type': workshop_link_object.link_type,
        'event_id': event.id
      }

      workshop_links.push(workshop_link);
    });

    return this.http.put(`${environment.apiEndpoint}/events/${event.id}/workshop_links`, workshop_links);
  }
  
  /*
   * Users
   */

  getUserList(eventId): Observable<User[]> {
    return this.http.get(`${environment.apiEndpoint}/events/${eventId}/users`).pipe(
      map((res: any) => {
        const users: User[] = [];

        res.users.forEach(userData => {
          const user = new User();
          Object.assign(user, userData);
          users.push(user);
        });
        
        return users;
      })
    );
  }

  getExportUserRegistrationList(eventId): Observable<any> {
    return this.http.get(
      `${environment.apiEndpoint}/export/event_registrations/${eventId}`, 
      {responseType: 'blob'}
    );
  }

  getUsersWithoutRegistration(eventId): Observable<User[]> {
    return this.http.get(`${environment.apiEndpoint}/event/${eventId}/unregistered_users`).pipe(
      map((res: any) => {
        const users: User[] = [];

        res.users.forEach(userData => {
          const user = new User();
          Object.assign(user, userData);
          users.push(user);
        });
        
        return users;
      })
    );
  }

  putUserList(eventId, users: User[]): Observable<any> {
    // returns HTTP 204
    return this.http.put(`${environment.apiEndpoint}/events/${eventId}/users`, users);
  }

  /*
   * Registrations
   */

  getRegistrations(): Observable<Registration[]> {
    const userId = this.authService.currentUser.id;

    if (userId) {
      return this.http.get(`${environment.apiEndpoint}/registrations/user/${userId}`).pipe(
        map((res: any) => {
          const registrations: Registration[] = [];
  
          res.registrations.forEach(registrationData => {
            const registration = new Registration();
            Object.assign(registration, registrationData);
            registrations.push(registration);
          });
          
          return registrations;
        })
      );
    }
    else {
      this.notifyService.error("Interne fout: kan registraties niet ophalen wegens ontbrekende gebruiker", false);
    }
  }

  putRegistrations(workshops: Workshop[]): Observable<Registration[]> {
    const userId = this.authService.currentUser.id;

    // fill array with id of each workshop
    const workshop_ids: number[] = []; // this is also the name of the JSON object in request body
    workshops.forEach(workshop => workshop_ids.push(workshop.id));

    return this.http.put(`${environment.apiEndpoint}/registrations/user/${userId}`, {workshop_ids}).pipe(
      map((res: any) => {
        const registrations: Registration[] = [];

        res.registrations.forEach(registrationData => {
          const registration = new Registration();
          Object.assign(registration, registrationData);
          registrations.push(registration);
        });
        
        return registrations;
      })
    );
  }

  deleteRegistration(workshop: Workshop): Observable<any> {
    const userId = this.authService.currentUser.id;

    // returns HTTP 204
    return this.http.delete(`${environment.apiEndpoint}/registrations/user/${userId}/${workshop.id}`);
  }

  
}
