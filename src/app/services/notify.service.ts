import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  public notify(msg: string) {
    let config: MatSnackBarConfig = {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['notify', 'notify-normal']
    };

    const snackBarRef = this.snackBar.open(msg, '', config);
  }

  public error(msg: string, stayOpen: boolean) {
    let config: MatSnackBarConfig = {
      verticalPosition: 'top',
      panelClass: ['notify', 'notify-error']
    };

    if (!stayOpen) {
      config.duration = 5000;
    }

    const snackBarRef = this.snackBar.open(msg, 'OK', config);
  }
}
