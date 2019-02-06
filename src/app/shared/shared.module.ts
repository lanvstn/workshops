import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { httpInterceptorProviders } from '../http-interceptors';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AngularMaterialModule
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    AngularMaterialModule
  ],
  declarations: [],
  providers: [
    httpInterceptorProviders
  ],
})
export class SharedModule { }
