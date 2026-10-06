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
    <div class="min-h-screen flex flex-col bg-[#191919] text-[#e6e6e5]">
      <app-navbar></app-navbar>
      
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <app-toast></app-toast>
      <app-telemetry-drawer></app-telemetry-drawer>

      <!-- Minimal Notion Footer -->
      <footer class="border-t border-[#262626] py-3 px-6 text-center text-[11px] text-[#605f5b]">
        <span>MPloyChek &bull; Notion Dark Workspace &bull; MongoDB RBAC Architecture</span>
      </footer>
    </div>
  `,
})
export class AppComponent {
  title = 'MPloyChek';
}
