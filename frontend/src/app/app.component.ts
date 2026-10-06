import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TelemetryDrawerComponent } from './shared/components/telemetry-drawer/telemetry-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, TelemetryDrawerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <app-navbar></app-navbar>
      
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <app-toast></app-toast>
      <app-telemetry-drawer></app-telemetry-drawer>

      <!-- Footer -->
      <footer class="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <span>MPloyChek &bull; Production-Grade Angular 18 & Node.js Architecture with MongoDB Mongoose & RBAC</span>
      </footer>
    </div>
  `,
})
export class AppComponent {
  title = 'MPloyChek';
}
