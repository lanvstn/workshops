import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-view-users-dialog',
  templateUrl: './view-users-dialog.component.html',
  styleUrls: ['./view-users-dialog.component.css']
})
export class ViewUsersDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) { }

  columnsToDisplay = ['status', 'full_name', 'user_class', 'target_group'];
  dataSource: MatTableDataSource<User>;

  ngOnInit() {
    this.apiService.getUserList(this.data.event.id).subscribe(users => {
      this.dataSource = new MatTableDataSource<User>(users);

      // Setup default filtering
      this.dataSource.filterPredicate = this.userFilterPredicate;

      if (this.data.view === "all") {
        // Also display identification info 
        this.columnsToDisplay.push('identity');
      }

      if (this.data.view === "unregistered") {
        // Combine the normal filter predicate with a check for registrations
        this.dataSource.filterPredicate = (user, filter) => {
          const hasNoRegistrations = user.registrations.length === 0;
          return this.userFilterPredicate(user, filter) && hasNoRegistrations;
        };
      }

      // Workaround for https://github.com/angular/material2/issues/9967
      //
      // Set filter as a space so it evaluates to true:
      // that way it's always checked even if there is no filter set.
      // Otherwise the unregistered filter does not run.
      this.dataSource.filter = ' ';
    })
  }

  private userFilterPredicate(user: User, filter: string): boolean {
    // Remove whitespace so the default filter value ' ' becomes empty
    filter = filter.trim();

    if (
      user.full_name.indexOf(filter) > -1 ||
      user.user_class.indexOf(filter) > -1 ||
      user.targetGroup.indexOf(filter) > -1
    ) {
      return true;
    }
    else {
      return false;
    }
  }

}
