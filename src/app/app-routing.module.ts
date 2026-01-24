import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesDashboardComponent } from './pages/sales-dashboard/sales-dashboard.component';
import { SalesRegistrationComponent } from './pages/sales-registration/sales-registration.component';

const routes: Routes = [
  // Default route redirects to registration page (as Area Sales Manager lands here first)
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: SalesRegistrationComponent },
  { path: 'dashboard', component: SalesDashboardComponent },
  { path: '**', redirectTo: 'register' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

