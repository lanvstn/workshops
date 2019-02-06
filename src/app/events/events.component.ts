import { Component, OnInit, ViewChild } from '@angular/core';
import { Event } from '../models/event';
import { RegistrationValidator } from './registration-validator/registration-validator'
import { AuthService } from '../services/auth.service';
import { Workshop } from '../models/workshop';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { WorkshopLink } from '../models/workshop-link';
import { NotifyService } from '../services/notify.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    const eventNameFromUrl = this.route.snapshot.paramMap.get('eventName');
    this.apiService.getEventList().subscribe(events => {
      const event = events.find(event => {
        return event.name === eventNameFromUrl
      });

      if (event) {
        this.apiService.getEvent(event.id).subscribe(event => {
          this.event = event;

          if (this.authService.currentUser.id) {
            // Already logged in
            this.afterLogin();
          }
        });
      }
      else {
        this.router.navigate(['/']);
        this.notifyService.error('Evenement niet gevonden. Is het adres correct?', true);
      }
    })
  }

  rv = new RegistrationValidator();

  // Data sources
  event: Event = new Event();
  workshop_links: WorkshopLink[] = [];

  // Helper variables
  workshopsByMoment: Workshop[][] = [];
  registeredWorkshops: Workshop[];
  complete: boolean;
  workshopSelectedStep: number = 0;

  @ViewChild('stepper') stepper; // MatHorizontalStepper
  @ViewChild('loginStep') loginStep; // MatStep
  @ViewChild('choiceStep') choiceStep;

  afterLogin(): void {
    // Setting loginStep.completed through property binding
    // creates a race condition with stepper.next()
    if (this.authService.currentUser.event_id === this.event.id) {
      if (!this.event.available) {
        this.notifyService.error("Inschrijvingen voor dit evenement zijn gesloten. Inschrijven of je inschrijving wijzigen is niet mogelijk.", true);
      }

      this.apiService.getWorkshopLinks(this.event).subscribe(workshop_links => {
        this.workshop_links = workshop_links;
  
        // Now we have the needed data to start the validator
        this.rv.init(this.apiService, this.event, this.authService.currentUser, this.workshop_links);
  
        this.event = this.rv.getTargetedWorkshops();
        this.getMoments();
        
        // With the validator ready, existing registrations can be loaded
        this.apiService.getRegistrations().subscribe(registrations => {
          registrations.forEach(registration => {
            const registeredWorkshop: Workshop = this.event.workshops.find(
              workshop => workshop.id === registration.workshop_id &&
                workshop.targetGroup === this.authService.currentUser.targetGroup
            );
  
            // Sanity check if API registrations data has registrations for other events
            if (registeredWorkshop) {
              this.addToWorkshopSelection(
                this.event.workshops.find(workshop => workshop.id === registration.workshop_id),
                'old'
              );
            }
            else {
              console.warn(`Ignored registration for wrong event: Reg. ID ${registration.id}, Workshop ID ${registration.workshop_id}`);
            }
          });
  
          // Unlike on add workshop, validator is only ran once here.
          // If it's run every time an existing registration gets added weird bugs happen.
          this.rv.updateSelectableWorkshops(this.getSelectedWorkshops());

          this.complete = this.checkComplete();
        })
      });
  
      this.loginStep.completed = true;
      this.stepper.next();
    } else {
      if (this.authService.currentUser.permission < 10) {
        this.notifyService.error("Je bent geen lid van dit evenement, dus registreren is niet toegestaan. Heb je de juiste link?", true);
      }
      else {
        this.notifyService.error("Als beheerder is het niet mogelijk jezelf te registreren voor een evenement.", true);
      }
    }
  }

  confirm(): void {
    this.notifyService.notify('Bezig met verzenden...')
    this.apiService.putRegistrations(this.getSelectedWorkshops()).subscribe(registrations => {
      this.registeredWorkshops = this.getSelectedWorkshops();
      this.notifyService.notify('Inschrijving succesvol')
      this.choiceStep.completed = true;
      this.stepper.next();
    },
    error => {
      this.notifyService.error(`Fout ${error.status} bij inschrijving (${error.error.description})`, true);
    });
  }

  addToWorkshopSelection(selectedWorkshop: Workshop, origin: string): void {
    selectedWorkshop._selected = true;
    selectedWorkshop._selectionOrigin = origin;

    // If old, don't validate. The loader function will run the validator.
    if (origin !== 'old') {
      // When adding a workshop to selection the validator might force others to be selected as well.
      // Based on those new selections future possible choices may be affected.
      // So validation needs to run in a loop until there are no more changes.
      let selectedWorkshops: Workshop[];
      let newSelectedWorkshops: Workshop[];
      do {
        selectedWorkshops = this.getSelectedWorkshops();
        this.rv.updateSelectableWorkshops(selectedWorkshops);

        newSelectedWorkshops = this.getSelectedWorkshops();
      } while (selectedWorkshops.length !== newSelectedWorkshops.length);
    }

    this.complete = this.checkComplete();
  }

  deleteFromWorkshopSelection(workshop: Workshop): void {    
    workshop._selected = false;
    workshop._selectionOrigin = '';
    
    // Deselect workshops that were forced to be selected by this one
    if (workshop._inclusiveLinkedWorkshops) {
      workshop._inclusiveLinkedWorkshops.forEach(linkedWorkshop => {
        linkedWorkshop._selected = false;
        linkedWorkshop._selectionOrigin = '';
      });
    }

    // Validate possible selections
    this.rv.updateSelectableWorkshops(this.getSelectedWorkshops());

    this.complete = this.checkComplete();
  }

  nextWorkshopSelectionStep(stepNumber: number): void {
    if (stepNumber) {
      this.workshopSelectedStep = stepNumber;
    }
    else {
      this.workshopSelectedStep++;
    }
  }

  private getMoments(): void {
    /* 
     * Workshops need to be grouped by moment.
     * This creates a new array with grouped arrays of workshops.
     * Every time a property on a workshop changes this needs to be redone.
    */
    let moments: String[] = [];

    // Populate moments array with unique moments
    this.event.workshops.forEach(workshop => {
      if (!moments.includes(workshop.moment)) {
        moments.push(workshop.moment);
      }
    });

    moments = moments.sort();

    // Fill workshopsByMoment with arrays of workshops for each moment
    this.workshopsByMoment = [];
    moments.forEach(moment => {
      this.workshopsByMoment.push(this.event.workshops.filter(
        value => value.moment === moment
      ));
    });
  }

  private getSelectedWorkshops(moment?: string): Workshop[] {
    return this.event.workshops.filter(workshop => {
      return workshop._selected === true && (!moment || workshop.moment === moment)
    });
  }

  private checkComplete(): boolean {
    const selectedWorkshops = this.getSelectedWorkshops();

    // Go through every workshop, 
    // check if every workshops' moment is found in the selected workshops list.
    return this.event.workshops.every(workshop => {
      return !!selectedWorkshops.find(selectedWorkshop => {
        return selectedWorkshop.moment === workshop.moment;
      });
    });
  }
}
