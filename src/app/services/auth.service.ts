import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BUG: Weird behavior when returning to login page and changing user (prev. user stays)

  constructor(private http: HttpClient) { 
    this.currentUser = new User();

    if (localStorage.getItem('currentUser')) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
  }

  // public currentUser: User = new User();
  public currentUser: User;

  login(credentials: Object): Promise<User> {
    let login$ = this.http.post(`${environment.apiEndpoint}/auth/login`, credentials);

    // wrap the result Observable of the request in a promise to signal login status the calling function
    let loginPromise: Promise<User> = new Promise((resolve, reject) =>{
      login$.subscribe(
        res => {
          if (res['token']) {
            // Set auth token on service for use in HTTP interceptor
            this.currentUser.token = res['token'];

            // Get info about the logged in user
            this.http.get(`${environment.apiEndpoint}/auth/login`).subscribe(res => {
              Object.assign(this.currentUser, res);

              localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

              // Promise completed, signal user is logged in
              resolve(this.currentUser);
            },
            error => {
              reject("Failed to get user info after logging in");
            });
          }
          else {
            // login failure
            reject("Token not found");
          }
        },
        error => {
          if (error.status == 401) {
            reject("Foute login code. Probeer het opnieuw.");
          }
          else {
            reject(`Server error, status code: ${error.status}`);
          }
        }
      );
    });

    return loginPromise;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }

  changeAdminPassword(oldPassword: string, newPassword: string): Observable<any> {
    // User must login again after this
    return this.http.post(`${environment.apiEndpoint}/auth/change_admin_password`, {
      'old_password': oldPassword,
      'new_password': newPassword
    })
  }
}
