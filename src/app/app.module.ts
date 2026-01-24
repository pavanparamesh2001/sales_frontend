import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SalesDashboardComponent } from './pages/sales-dashboard/sales-dashboard.component';
import { SalesRegistrationComponent } from './pages/sales-registration/sales-registration.component';

@NgModule({
  declarations: [
    AppComponent,
    SalesDashboardComponent,
    SalesRegistrationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}



