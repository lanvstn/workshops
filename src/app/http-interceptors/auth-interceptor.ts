import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken: string = this.authService.currentUser.token;

    if (authToken) {
      const authenticatedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer: ${authToken}`)
      });
  
      return next.handle(authenticatedReq);
    }
    else {
      return next.handle(req);
    }
    
  }
}
