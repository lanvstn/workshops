import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotifyService } from '../services/notify.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-change-admin-password-dialog',
  templateUrl: './change-admin-password-dialog.component.html',
  styleUrls: ['./change-admin-password-dialog.component.css']
})
export class ChangeAdminPasswordDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ChangeAdminPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private notifyService: NotifyService
  ) { }

  changePasswordForm: FormGroup;

  ngOnInit() {
    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/[A-Z]{1,}/),
        Validators.pattern(/[a-z]{1,}/),
        Validators.pattern(/[0-9]{1,}/)
      ])
    });
  }

  changePassword(): void {
    this.authService.changeAdminPassword(
      this.changePasswordForm.value["oldPassword"],
      this.changePasswordForm.value["newPassword"]
    ).subscribe(res => {
      this.notifyService.notify('Wachtwoord gewijzigd.');
      this.authService.login({'credential': this.changePasswordForm.value["newPassword"]});
      this.dialogRef.close(true);
    },
    error => {
      this.notifyService.error(`Wachtwoord niet gewijzigd. Fout ${error.status} (${error.error.message})`, false);
    })
  }

}
