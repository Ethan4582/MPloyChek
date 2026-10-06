import { Component, inject, signal } from '@angular/core';
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
    <header class="sticky top-0 z-30 w-full border-b border-[#2f2f2f] bg-[#191919]/95 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3 text-xs">
        
        <!-- Left: Notion Breadcrumb & Page Links -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-[#9b9a97]">
            <a routerLink="/dashboard" class="flex items-center gap-1.5 hover:text-[#ffffff] transition-colors font-medium">
              <span class="text-sm">🛡️</span>
              <span class="text-[#ffffff] font-semibold tracking-tight">MPloyChek</span>
            </a>
            <span class="text-[#444444]">/</span>
            <span class="text-[#9b9a97] hidden sm:inline">Verification Database</span>
          </div>

          @if (authService.isAuthenticated()) {
            <div class="h-4 w-[1px] bg-[#2f2f2f] mx-1 hidden sm:block"></div>
            
            <nav class="flex items-center gap-1">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-[#262626] text-[#ffffff] font-medium"
                [routerLinkActiveOptions]="{ exact: true }"
                class="px-2.5 py-1 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#202020] transition-colors"
              >
                Records
              </a>

              @if (authService.isAdmin()) {
                <a
                  routerLink="/admin/users"
                  routerLinkActive="bg-[#262626] text-[#ffffff] font-medium"
                  class="px-2.5 py-1 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#202020] transition-colors flex items-center gap-1.5"
                >
                  <span>Users</span>
                  <span class="tag-purple text-[10px] py-0 px-1.5">Admin</span>
                </a>
              }
            </nav>
          }
        </div>

        <!-- Right: Delay Controller & User Profile -->
        <div class="flex items-center gap-2">
          
          <!-- Delay Selector (Notion Filter Popover Style) -->
          <div class="relative">
            <button
              type="button"
              (click)="toggleDelayDropdown()"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#2f2f2f] bg-[#202020] hover:bg-[#262626] text-[#9b9a97] hover:text-[#ffffff] transition-colors"
              title="Change simulated API delay"
            >
              <span class="text-[11px]">⏱️</span>
              <span class="text-[11px] font-mono text-[#529cca]">{{ delayService.currentDelay() }}ms</span>
              <svg class="w-3 h-3 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            @if (isDelayOpen()) {
              <div
                (click)="toggleDelayDropdown()"
                class="fixed inset-0 z-40"
              ></div>
              <div class="absolute right-0 mt-1 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6b6b68]">Simulated Latency</div>
                @for (opt of delayService.delayOptions; track opt.value) {
                  <button
                    type="button"
                    (click)="selectDelay(opt.value)"
                    class="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left hover:bg-[#2f2f2f] transition-colors"
                    [class.text-[#529cca]]="delayService.currentDelay() === opt.value"
                    [class.text-[#e6e6e5]]="delayService.currentDelay() !== opt.value"
                  >
                    <span>{{ opt.label }}</span>
                    @if (delayService.currentDelay() === opt.value) {
                      <svg class="w-3.5 h-3.5 text-[#529cca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </button>
                }
              </div>
            }
          </div>

          @if (authService.isAuthenticated()) {
            <!-- User Status & Role Pill -->
            <div class="flex items-center gap-2 pl-2 border-l border-[#2f2f2f]">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded bg-[#2e2e2e] border border-[#3a3a3a] flex items-center justify-center text-[10px] font-medium text-[#e6e6e5]">
                  {{ getUserInitial() }}
                </div>
                <span class="text-[#e6e6e5] font-medium hidden md:inline truncate max-w-[120px]">
                  {{ authService.currentUser()?.name }}
                </span>
              </div>

              @if (authService.isAdmin()) {
                <span class="tag-purple">Admin</span>
              } @else {
                <span class="tag-blue">General User</span>
              }

              <!-- Logout Button -->
              <button
                (click)="authService.logout()"
                title="Log out"
                class="p-1 rounded text-[#9b9a97] hover:text-[#e05757] hover:bg-[#282020] transition-colors ml-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          } @else {
            <a routerLink="/login" class="notion-btn-primary py-1 px-3">
              Log in
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

  isDelayOpen = signal<boolean>(false);

  toggleDelayDropdown(): void {
    this.isDelayOpen.update((v) => !v);
  }

  selectDelay(ms: number): void {
    this.delayService.setDelay(ms);
    this.isDelayOpen.set(false);
  }

  getUserInitial(): string {
    return (this.authService.currentUser()?.name || 'U').charAt(0).toUpperCase();
  }
}
