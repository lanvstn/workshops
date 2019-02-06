import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MatDialog } from '@angular/material';
import { ChangeAdminPasswordDialogComponent } from './change-admin-password-dialog/change-admin-password-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private changeAdminPasswordDialog: MatDialog
  ) { }

  title = 'workshops';

  changeAdminPassword(): void {
    this.changeAdminPasswordDialog.open(ChangeAdminPasswordDialogComponent);
  }
}
