import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <!-- Brand & Nav Links -->
        <div class="flex items-center gap-8">
          <a routerLink="/dashboard" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span class="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">MPloyChek</span>
              <span class="block text-[10px] text-brand-400 uppercase tracking-widest font-semibold">Verification SPA</span>
            </div>
          </a>

          @if (authService.isAuthenticated()) {
            <nav class="hidden md:flex items-center gap-1">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-slate-800/90 text-white border-slate-700"
                class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent transition-all"
              >
                Dashboard
              </a>

              @if (authService.isAdmin()) {
                <a
                  routerLink="/admin/users"
                  routerLinkActive="bg-slate-800/90 text-white border-slate-700"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent transition-all flex items-center gap-1.5"
                >
                  <span>User Management</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">Admin</span>
                </a>
              }
            </nav>
          }
        </div>

        <!-- Right Side: Delay Emulation Controller & User Profile -->
        <div class="flex items-center gap-3">
          <!-- Simulated Latency Controller -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span class="flex items-center gap-1.5 text-slate-400 font-medium">
              <svg class="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>API Delay:</span>
            </span>
            <select
              [value]="delayService.currentDelay()"
              (change)="onDelayChange($event)"
              class="bg-slate-950 text-brand-300 font-mono font-medium rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs cursor-pointer"
              title="Configure simulated API latency to showcase async processing"
            >
              @for (opt of delayService.delayOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          @if (authService.isAuthenticated(); as user) {
            <!-- User Profile & Role Badge -->
            <div class="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div class="hidden lg:flex flex-col text-right">
                <span class="text-xs font-semibold text-slate-200">{{ authService.currentUser()?.name }}</span>
                <span class="text-[10px] text-slate-400">{{ authService.currentUser()?.department }}</span>
              </div>

              <!-- Role Badge -->
              @if (authService.isAdmin()) {
                <span class="badge-admin">
                  <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2l2.5 5.5H18l-4.5 4 1.5 6.5-5-3.5-5 3.5 1.5-6.5L2 7.5h5.5L10 2z" clip-rule="evenodd" />
                  </svg>
                  Admin
                </span>
              } @else {
                <span class="badge-user">
                  <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  General User
                </span>
              }

              <!-- Logout Button -->
              <button
                (click)="authService.logout()"
                title="Sign out of MPloyChek"
                class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          } @else {
            <a routerLink="/login" class="btn-primary text-xs py-1.5 px-3.5">
              Sign In
            </a>
          }
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  delayService = inject(DelayService);
  telemetry = inject(TelemetryService);

  onDelayChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.delayService.setDelay(parseInt(select.value, 10));
  }
}
