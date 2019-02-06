import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';

/*
 * Http interceptor providers in outside-in order 
 * See https://angular.io/guide/http#intercepting-requests-and-responses 
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];