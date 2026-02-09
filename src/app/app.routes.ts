import { Routes } from '@angular/router';
import { MainGuestComponent } from './shared/components/main-guest/main-guest.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' },

  { path: 'auth', component: MainGuestComponent, loadChildren: () => import('./features/auth/routes').then((m) => m.AUTH_ROUTES) },

  { path: 'admin', component: MainLayoutComponent, loadChildren: () => import('./features/admin/routes').then((m) => m.ADMIN_ROUTES) },

  { path: '**', redirectTo: 'admin' }
];
