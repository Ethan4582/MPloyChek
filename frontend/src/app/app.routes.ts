import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';
import { DocsComponent } from './features/docs/docs.component';
import { TelemetryComponent } from './features/telemetry/telemetry.component';
import { CreatorComponent } from './features/creator/creator.component';
import { authGuard, adminGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent,
    title: 'MPloyChek • Employment Verification & RBAC Portal',
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
    path: 'docs',
    component: DocsComponent,
    title: 'System Design • MPloyChek',
  },
  {
    path: 'system-design',
    redirectTo: 'docs',
    pathMatch: 'full',
  },
  {
    path: 'creator',
    component: CreatorComponent,
    title: 'Creator Profile • MPloyChek',
  },
  {
    path: 'telemetry',
    component: TelemetryComponent,
    canActivate: [authGuard],
    title: 'Telemetry & Latency • MPloyChek',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
