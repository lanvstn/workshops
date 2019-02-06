import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Event } from 'src/app/models/event'
import { Workshop } from 'src/app/models/workshop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { EditWorkshopDialogComponent } from './edit-workshop-dialog/edit-workshop-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { ViewUsersDialogComponent } from './view-users-dialog/view-users-dialog.component';
import { User } from 'src/app/models/user';
import { WorkshopLink } from 'src/app/models/workshop-link';
import { AvailabilityDialogComponent } from './availability-dialog/availability-dialog.component';
import { NotifyService } from 'src/app/services/notify.service';

@Component({
  selector: 'app-manage-event',
  templateUrl: './manage-event.component.html',
  styleUrls: ['./manage-event.component.css']
})
export class ManageEventComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private editDialog: MatDialog,
    private confirmDialog: MatDialog,
    private notifyService: NotifyService
  ) { }

  event: Event = new Event();
  editEventInfoForm: FormGroup;

  workshop_links: WorkshopLink[] = [];
  
  registrationURL: string;

  ngOnInit() {
    this.goHomeIfNoPermission();
    this.fillEvent();

    this.editEventInfoForm = new FormGroup({
      title: new FormControl(this.event.name, [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]{1,32}$/)]),
    });
  }

  /*
   * Workshops
   * ==========================================================================
   */

  newWorkshop(): void {
    const workshop = new Workshop()
    workshop.id = -1;

    this.event.workshops.push(workshop);

    this.editWorkshop(-1);
  }

  editWorkshop(workshopId): void {
    let editingWorkshop = this.getWorkshop(workshopId);
    editingWorkshop._editMode = false;

    let editDialog = this.editDialog.open(EditWorkshopDialogComponent, {
      data: {
        editingWorkshop: this.getWorkshop(workshopId),
      }
    });

    editDialog.afterClosed().subscribe(editedWorkshop => {
      if (workshopId === -1) {
        // New workshop
        if (!editedWorkshop.title) {
          // Edit canceled, delete workshop from memory if new
          console.log('Edit canceled');
          const workshopIndex = this.event.workshops.indexOf(editingWorkshop);
          this.event.workshops.splice(workshopIndex , 1);
          this.notifyService.notify('Workshop niet aangemaakt');
        }

        // Delete ID because workshop is new
        // With ID undefined API will create new workshop
        delete editedWorkshop.id;
      }

      this.pushEventToAPI();
    });
  }

  deleteWorkshop(workshop): void {
    const workshopIndex = this.event.workshops.indexOf(workshop);
    this.event.workshops.splice(workshopIndex , 1);
    this.pushEventToAPI();
  }

  /*
   * Settings
   * ==========================================================================
   */

  saveEventInfo(): void {
    this.event.name = this.editEventInfoForm.value['title'];
    this.pushEventToAPI();
  }

  setAvailable(available: boolean): void {
    let confirmDialog = this.confirmDialog.open(AvailabilityDialogComponent, {
      data: {
        currentStatus: this.event.available
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.event.available = available;
        this.pushEventToAPI();
      }
    });
  }

  uploadLlist(): void {
    // User list for this event will be replaced with this. But existing entries will keep their ID.
    const uploadUsersList: User[] = [];

    // Handle file upload
    this.loadLocalFile("text/csv", file => {
      const reader = new FileReader();
      const component = this;

      reader.onload = function(ev: ProgressEvent) {
        const uploadedCSV: any = this.result; // string, but TS expects ArrayBuffer

        // Split into rows and get remove headers
        const uploadedRows = uploadedCSV.split(/\r?\n/).slice(1);

        // Users in uploaded CSV are compared to existing users,
        // if a user in the CSV exists add it to the to be uploaded list with its full information (ID).
        // That way if an uploaded user gets merged to the database by the API, it won't be recreated.
        // If the user does not exist it we create an object without ID. When this gets merged it will be a new entry.

        component.apiService.getUserList(component.event.id).subscribe(users => {
          // Load user objects
          const existingUsers: User[] = [];
          users.forEach(user => {
            existingUsers.push(Object.assign(new User(), user));
          });

          // Turn user objects into CSV rows for comparison
          const existingRows = component.usersToCSVRows(existingUsers);
          uploadedRows.forEach(uploadedRow => {
            // Match existing row to uploaded row
            const index = existingRows.indexOf(uploadedRow);
            if (index > -1) {
              // If match, the index points to the corresponding User so we can just push that object
              uploadUsersList.push(existingUsers[index]);
            }
            else {
              // No match. This is a new user.
              const newUser = new User();

              // Fill the new user object with data from the input row
              const splitRow = uploadedRow.split(',');

              // Don't do anything if row has empty values
              if (splitRow[0]) {
                newUser.full_name = splitRow[0];
                newUser.user_class = splitRow[1];
                newUser.targetGroup = splitRow[2];
                newUser.identity = splitRow[3];
                newUser.event_id = component.event.id;

                uploadUsersList.push(newUser);
              }
            }
          });

          component.apiService.putUserList(component.event.id, uploadUsersList).subscribe(res => {
            component.notifyService.notify(`${uploadUsersList.length} gebruikers geupload`);
          },
          error => {
            if (error.status === 400) {
              component.notifyService.error(`Fout ${error.status} bij uploaden gebruikers (${error.error.description}). Zorg ervoor dat de identificatiekolom leeg is om conflicten met andere evenementen te vermijden.`, true);
            }
            else {
              component.notifyService.error(`Fout ${error.status} bij uploaden gebruikers (${error.error.description})`, true);
            }
          });
        });

      };
      reader.readAsText(file);
    })
  }

  dlStartLlist(): void {
    const rows = [
      "Naam,Klas,Doelgroep,Identificatie (laat leeg)",
      "Voorbeeld naam,1A,intern,"
    ]

    const csvContent = rows.join('\r\n');
    
    this.downloadFile(csvContent, "studenten.csv", "text/csv");
  }

  dlLlist(): void {
    const rows = [];
    this.apiService.getUserList(this.event.id).subscribe(users => {
      // CSV headers
      const headers = ["Naam,Klas,Doelgroep,Identificatie"];

      // CSV content
      const rows = headers.concat(this.usersToCSVRows(users));
      const csvContent = rows.join('\r\n');

      this.downloadFile(csvContent, "studenten.csv", "text/csv");
    })
  }

  showLlist(): void {
    const showDialog = this.editDialog.open(ViewUsersDialogComponent, {
      width: "80%",
      data: {
        event: this.event,
        view: "all"
      }
    });
  }

  dlRegistrations(): void {
    this.apiService.getExportUserRegistrationList(this.event.id).subscribe(data => {
      this.downloadFile(data, 'inschrijvingen.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    })
  }

  showNoRegistrations(): void {
    const showDialog = this.editDialog.open(ViewUsersDialogComponent, {
      width: "80%",
      data: {
        event: this.event,
        view: "unregistered"
      }
    });
  }

  /*
   * Workshop Links
   * ==========================================================================
   */

  newWorkshopLink(): void {
    // Initializing the workshop_link object with empty workshops
    // prevents ngModel from generating errors
    const newLink = new WorkshopLink();
    newLink.workshop1 = new Workshop();
    newLink.workshop2 = new Workshop();
    newLink.link_type = "";

    this.workshop_links.push(newLink);
  }

  saveWorkshopLinks(): void {
    // Validate inputs and save to API
    let valid = true;
    let msg: string;

    this.workshop_links.forEach((workshop_link, index) => {
      // Shallow copy of link list
      const workshop_links_excluding_this_one = this.workshop_links.slice();
      // Without current link
      workshop_links_excluding_this_one.splice(index, 1);
      
      if (!workshop_link.workshop1 || !workshop_link.workshop2 || !workshop_link.link_type) {
        valid = false;
        msg = "Sommige velden zijn nog leeg."
      }
      else if (workshop_link.workshop1 === workshop_link.workshop2) {
        valid = false;
        msg = "Kan niet dezelfde workshops met elkaar linken.";
      }
      else if (
        // If link found in array of links, without this one
        workshop_links_excluding_this_one.find(found_link => {
          return found_link.workshop1 === workshop_link.workshop1 &&
            found_link.workshop2 === workshop_link.workshop2
        }) ||
        // Also check for reverse links
        workshop_links_excluding_this_one.find(found_link => {
          return found_link.workshop1 === workshop_link.workshop2 &&
            found_link.workshop2 === workshop_link.workshop1
        })
      ) {
        valid = false;
        msg = "Link bestaat al.";
      }
      else if (
        (workshop_link.workshop1.targetGroup != workshop_link.workshop2.targetGroup) && 
        workshop_link.link_type == 'inclusive'
      ) {
        valid = false;
        msg = "Workshops in verschillende doelgroepen, inclusieve link maakt registratie onmogelijk."
      }
    });

    if (valid) {
      this.pushWorkshopLinksToAPI();
    }
    else {
      this.notifyService.error(msg, true);
    }
  }

  deleteWorkshopLink(link: WorkshopLink): void {
    this.workshop_links.splice(this.workshop_links.indexOf(link), 1);
    this.pushWorkshopLinksToAPI();
  }

  // See fillEvent()

  /*
   * Internal methods
   * ==========================================================================
   */

  private usersToCSVRows(users: User[]): string[] {
    const rows = [];

    users.forEach(user => {
      rows.push([
        user.full_name,
        user.user_class,
        user.targetGroup,
        user.identity
      ].join(','));
    });

    return rows;
  }

  private downloadFile(data, filename, filetype): void {
    // Create hidden element containing the file blob URL and save it
    const dataBlob = new Blob([data], {type: filetype});

    const link = document.createElement("a");
    link.setAttribute("href", window.URL.createObjectURL(dataBlob));
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
  }

  private loadLocalFile(accept: string, whenLoaded: (file: File) => any): void {
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = accept;

    uploadInput.addEventListener("change", function() {
      whenLoaded(this.files[0]);
    });
    
    uploadInput.click();
  }

  private getWorkshop(workshopId): Workshop {
    const workshop = this.event.workshops.find(w => w.id == workshopId);
    
    if (!workshop) {
      this.notifyService.error(`Interne fout: Kan workshop ID ${workshopId} niet vinden`, false);
    }

    return workshop;
  }

  private fillEvent(): void {
    // Get Event ID from route and fill in Event object
    this.apiService.getEvent(this.route.snapshot.paramMap.get('eventId')).subscribe((res) => {
      Object.assign(this.event, res);
      this.editEventInfoForm.setValue({'title': this.event.name});

      this.updateRegistrationURL();

      // Workshop links
      this.apiService.getWorkshopLinks(this.event).subscribe(workshop_links => {
        this.workshop_links = workshop_links;
      },
      error => {
        this.notifyService.error(`Fout ${error.status} bij ophalen links (${error.error.description})`, true);
      });
    });
  }

  private updateRegistrationURL(): void {
    const splitCurrentURL = window.location.href.split('/');
    this.registrationURL = `${splitCurrentURL.slice(0, splitCurrentURL.length - 3).join('/')}/events/${this.event.name}`;
  }

  private pushEventToAPI(): void {
    this.apiService.putEvent(this.event).subscribe(res => {
      this.notifyService.notify('Wijzigingen opgeslagen');
      // Refresh client-side event data with PUT response
      Object.assign(this.event, res);
      this.updateRegistrationURL();
    },
    error => {
      this.notifyService.error(`Fout ${error.status} bij opslaan (${error.error.description})`, true);
    });
  }

  private pushWorkshopLinksToAPI(): void {
    this.apiService.putWorkshopLinks(this.event, this.workshop_links).subscribe(res => {
      this.notifyService.notify('Links opgeslagen');
    },
    error => {
      this.notifyService.error(`Fout ${error.status} bij opslaan links (${error.error.description})`, true);
    });
  }

  private goHomeIfNoPermission(): void {
    if (!this.authService.currentUser.id) {
      this.notifyService.error('Inloggen vereist', false);
      this.router.navigateByUrl(`/manage`);
    }
    else if (this.authService.currentUser.id && this.authService.currentUser.permission < 10) {
      this.notifyService.error('Geen beheersrechten op gebruiker', false);
      this.router.navigateByUrl(`/manage`);
    }
  }

}
