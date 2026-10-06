import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-30 w-full border-b border-[#2a2a2a] bg-[#191919]/95 backdrop-blur-sm">
      <!-- Full-bleed edge-to-edge Notion top bar -->
      <div class="w-full px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 text-xs">
        
        <!-- Left: Brand Breadcrumb & Primary Links -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-[#9b9a97]">
            <a routerLink="/dashboard" class="flex items-center gap-1.5 hover:text-[#ffffff] transition-colors font-medium">
              <span class="text-sm select-none">🛡️</span>
              <span class="text-[#ffffff] font-semibold tracking-tight">MPloyChek</span>
            </a>
            <span class="text-[#444444]">/</span>
            <span class="text-[#9b9a97] hidden sm:inline">Verification Database</span>
          </div>

          @if (authService.isAuthenticated()) {
            <div class="h-4 w-[1px] bg-[#2a2a2a] mx-1 hidden sm:block"></div>
            
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
                  class="px-2.5 py-1 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#202020] transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <span>Users</span>
                </a>
              }
            </nav>
          }
        </div>

        <!-- Right: Delay Controller & Profile Component -->
        <div class="flex items-center gap-2.5">
          
          <!-- Delay Selector Dropdown -->
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

          <!-- Profile Menu Component -->
          @if (authService.isAuthenticated()) {
            <div
              class="relative"
              (mouseenter)="onProfileMouseEnter()"
              (mouseleave)="onProfileMouseLeave()"
            >
              <!-- Trigger: Clean, Minimalist Profile Avatar Button -->
              <button
                type="button"
                (click)="toggleProfileMenu()"
                class="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[#2f2f2f] bg-[#202020] hover:bg-[#282828] hover:border-[#3a3a3a] transition-all group focus:outline-none focus:ring-1 focus:ring-[#529cca]/50"
                [attr.aria-expanded]="isProfileOpen()"
                title="Account menu"
              >
                <!-- Avatar circle with role-accent border (Notion Bronze for Admin, Slate Blue for User) -->
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors"
                  [ngClass]="authService.isAdmin() ? 'bg-[#332924] text-[#bc8c74] border border-[#48372f]' : 'bg-[#1e2d3d] text-[#529cca] border border-[#273c52]'"
                >
                  {{ getUserInitial() }}
                </div>

                <span class="text-[#e6e6e5] font-medium text-xs hidden md:inline truncate max-w-[120px]">
                  {{ authService.currentUser()?.name }}
                </span>

                <!-- Subtle Role Badge -->
                @if (authService.isAdmin()) {
                  <span class="tag-bronze text-[10px] py-0 px-1.5">Admin</span>
                }

                <svg
                  class="w-3 h-3 text-[#787774] group-hover:text-[#e6e6e5] transition-transform duration-150"
                  [class.rotate-180]="isProfileOpen()"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              @if (isProfileOpen()) {
                <div class="absolute right-0 top-full h-2 w-full"></div>

                <div
                  class="absolute right-0 mt-2 w-64 bg-[#212121] border border-[#333333] rounded-xl shadow-notion-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  (mouseenter)="onProfileMouseEnter()"
                  (mouseleave)="onProfileMouseLeave()"
                >
                  <!-- 1. User Header & Role Badge -->
                  <div class="px-3 py-2.5 border-b border-[#2d2d2d] flex items-start gap-2.5">
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      [ngClass]="authService.isAdmin() ? 'bg-[#332924] text-[#bc8c74] border border-[#48372f]' : 'bg-[#1e2d3d] text-[#529cca] border border-[#273c52]'"
                    >
                      {{ getUserInitial() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold text-[#ffffff] truncate">
                          {{ authService.currentUser()?.name }}
                        </span>
                      </div>
                      <div class="text-[11px] text-[#787774] font-mono truncate">
                        {{ authService.currentUser()?.userId }}
                      </div>
                      <div class="mt-1.5">
                        @if (authService.isAdmin()) {
                          <span class="tag-bronze text-[10px]">
                            <span>🛡️</span>
                            <span>Administrator</span>
                          </span>
                        } @else {
                          <span class="tag-blue text-[10px]">
                            <span>👤</span>
                            <span>General User</span>
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- 2. Profile Details & Access Scope -->
                  <div class="px-3 py-2 text-[11px] text-[#9b9a97] space-y-1 border-b border-[#2d2d2d] bg-[#1a1a1a]/50 rounded-md my-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[#787774]">Department</span>
                      <span class="text-[#e6e6e5] font-medium">{{ authService.currentUser()?.department }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-[#787774]">Status</span>
                      <span class="text-[#4dab7e] flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#4dab7e]"></span>
                        <span>Active</span>
                      </span>
                    </div>
                  </div>

                  <!-- 3. Navigation / Action Buttons -->
                  <div class="space-y-0.5 pt-1">
                    <a
                      routerLink="/dashboard"
                      (click)="closeProfileMenu()"
                      class="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#e6e6e5] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                    >
                      <span class="text-xs">📋</span>
                      <span>Records Directory</span>
                    </a>

                    @if (authService.isAdmin()) {
                      <a
                        routerLink="/admin/users"
                        (click)="closeProfileMenu()"
                        class="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#e6e6e5] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                      >
                        <span class="text-xs">⚙️</span>
                        <span>User Management</span>
                      </a>
                    }

                    <div class="border-t border-[#2d2d2d] my-1"></div>

                    <!-- Sign Out Button -->
                    <button
                      type="button"
                      (click)="logout()"
                      class="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#e05757] hover:bg-[#3b2222]/40 rounded-lg transition-colors text-left"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/login"
              class="notion-btn-primary text-xs py-1 px-3"
            >
              Log In
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
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isDelayOpen = signal<boolean>(false);
  isProfileOpen = signal<boolean>(false);
  private profileCloseTimer: any = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDelayOpen.set(false);
      this.isProfileOpen.set(false);
    }
  }

  toggleDelayDropdown(): void {
    this.isDelayOpen.update((v) => !v);
  }

  selectDelay(delay: number): void {
    this.delayService.setDelay(delay);
    this.isDelayOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileOpen.update((v) => !v);
  }

  closeProfileMenu(): void {
    this.isProfileOpen.set(false);
  }

  onProfileMouseEnter(): void {
    if (this.profileCloseTimer) {
      clearTimeout(this.profileCloseTimer);
      this.profileCloseTimer = null;
    }
  }

  onProfileMouseLeave(): void {
    this.profileCloseTimer = setTimeout(() => {
      this.isProfileOpen.set(false);
    }, 250);
  }

  getUserInitial(): string {
    const name = this.authService.currentUser()?.name || 'U';
    return name.charAt(0).toUpperCase();
  }

  logout(): void {
    this.isProfileOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
