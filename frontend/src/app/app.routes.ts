import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';
import { authGuard, adminGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
    title: 'Sign In • MPloyChek',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard • MPloyChek',
  },
  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [authGuard, adminGuard],
    title: 'User Management • MPloyChek Admin',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
