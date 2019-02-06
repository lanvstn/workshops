import { User } from "src/app/models/user";
import { Event } from "src/app/models/event";
import { WorkshopLink } from "src/app/models/workshop-link";
import { Workshop } from "src/app/models/workshop";
import { ApiService } from "src/app/services/api.service";

export class RegistrationValidator {
  private apiService: ApiService

  // Everything to do with registration rules goes here
  private event: Event;
  private user: User;
  private workshop_links: WorkshopLink[];

  init(apiService: ApiService, event: Event, user: User, workshop_links: WorkshopLink[]): void {
    // Borrow the apiService from the component initializing this. Dependency injection doesn't work here.
    this.apiService = apiService;
    this.event = event;
    this.user = user;
    this.workshop_links = workshop_links;

    // Add link metadata to each workshop
    this.links(this.event.workshops, [], false);
  }

  public getTargetedWorkshops(): Event {
    this.event.workshops = this.event.workshops.filter(workshop => {
      return workshop.targetGroup == this.user.targetGroup;
    })

    return this.event;
  }

  private regCount(selectedWorkshops: Workshop[], impossibleWorkshops: Workshop[]) {
    selectedWorkshops.forEach(workshop => {
      if (workshop._registrationCount >= workshop.limit) {
        impossibleWorkshops.push(workshop);
      }
    })
  }

  private same_moment(selectedWorkshops: Workshop[], impossibleWorkshops: Workshop[]): void {
    const moments: string[] = [];

    selectedWorkshops.forEach(workshop => {
      if (moments.find(moment => workshop.moment === moment)) {
        // Moment already on another registration
        impossibleWorkshops.push(workshop);

        if (workshop._inclusiveLinkedWorkshops) {
          workshop._inclusiveLinkedWorkshops.forEach(linkedWorkshop => {
            impossibleWorkshops.push(linkedWorkshop);
          })
        }
      }
      else {
        moments.push(workshop.moment);
      }
    });
  }

  private links(selectedWorkshops: Workshop[], impossibleWorkshops: Workshop[], allowSelectionChanges: boolean = true): void {
    // This function will automatically selected linked workshops if the link type is inclusive.
    // If allowSelectionChanges is false it will not do that.

    this.workshop_links.forEach(workshop_link => {
      const workshop1 = selectedWorkshops.find(workshop => workshop === workshop_link.workshop1);
      if (workshop1) {
        // This workshop is linked to another one
        const workshop2 = selectedWorkshops.find(workshop => workshop === workshop_link.workshop2);
        if (workshop2) {
          // This is a link between two workshops in the (possible) selection
          if (workshop_link.link_type === 'exclusive') {
            // The other workshop is impossible to select
            if (workshop1._selected) {
              impossibleWorkshops.push(workshop2);
            }
            else if (workshop2._selected) {
              impossibleWorkshops.push(workshop1);
            }
          }
          else if (workshop_link.link_type === 'inclusive') {
            // Every workshop object gets an _inclusiveLinkedWorkshops attribute.
            // Workshops in that attribute get deleted when the parent gets deleted.
            // This deletion is handled by the component.

            // Determine which workshop is affected by the link and which one was clicked.
            if (!allowSelectionChanges || workshop1._selectionOrigin === 'old' || workshop2._selectionOrigin === 'old') {
              // Selection changes not allowed, or neither got clicked because selection is from API
              [workshop1, workshop2].forEach(workshop => {
                if (workshop._selectionOrigin === '' && allowSelectionChanges) {
                  workshop._selected = false;
                }
                else if (workshop._selectionOrigin !== '' && allowSelectionChanges) {
                  workshop._selected = true;
                }

                workshop._inclusiveLinkedWorkshops = this.pushUnique(workshop._inclusiveLinkedWorkshops, workshop1, workshop2);
              });
            }
            else {
              // The affected workshop will become unclickable. The clicked workshop can be unselected.
              let clickedWorkshop: Workshop;
              let affectedWorkshop: Workshop;

              if (workshop1._selectionOrigin === 'new') {
                clickedWorkshop = workshop1;
                affectedWorkshop = workshop2;
              }
              else if (workshop2._selectionOrigin === 'new') {
                clickedWorkshop = workshop2;
                affectedWorkshop = workshop1;
              }

              // impossibleWorkshops.push(affectedWorkshop);

              if (allowSelectionChanges) {
                affectedWorkshop._selected = true;
                affectedWorkshop._selectionOrigin = 'inclusiveLink';
              }
            }
          }
        }
      }
    });
  }

  public updateSelectableWorkshops(selectedWorkshops: Workshop[]): void {
    // Instead of validating manually before submitting, validate BEFORE the user clicks something wrong.
    // This is done by collecting a list of impossible choices and setting the _selectable value on the Workshop object.
    const impossibleWorkshops = [];

    this.event.workshops.forEach(workshop => {
      if (selectedWorkshops.find(selectedWorkshop => selectedWorkshop === workshop)) {
        // It's already selected so it must be selectable, unless the selection origin is from a link.
        if (workshop._selectionOrigin === 'inclusiveLink') {
          workshop._selectable = false;
        }
        else {
          workshop._selectable = true;
        }
      }
      else {
        // What if we added this workshop to the selection now? Run the validator on that fictional selection.
        // If it would be invalid to do this it gets added to impossibleWorkshops
        this.links(selectedWorkshops.concat([workshop]), impossibleWorkshops);
        this.same_moment(selectedWorkshops.concat([workshop]), impossibleWorkshops);
        this.regCount(selectedWorkshops.concat([workshop]), impossibleWorkshops);
      }
    });
    
    // Set selectable false on impossible workshops and make sure it's true on the rest.
    this.event.workshops.forEach(workshop => {
      if (impossibleWorkshops.indexOf(workshop) !== -1) {
        workshop._selectable = false;
      }
      else {
        workshop._selectable = true;
      }
    });
  }

  private pushUnique(array: any[], ...objects: any[]): any[] {
    // Helper function that only adds item to array if it's not there already
    if (!array) {
      array = []
    }

    objects.forEach(object => {
      if (!array.find(item => item === object)) {
        array.push(object);
      }
    });

    return array;
  }
}
