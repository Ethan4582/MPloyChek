import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop -->
    @if (sidebarService.isOpen()) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        (click)="sidebarService.close()"
      ></div>
    }

    <!-- Minimal Functional Sidebar -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#1b1b1b] border-r border-[#262626] flex flex-col justify-between transition-transform duration-200 ease-in-out select-none"
      [class.translate-x-0]="sidebarService.isOpen()"
      [class.-translate-x-full]="!sidebarService.isOpen()"
    >
      <!-- Top Section -->
      <div>
        <!-- Brand & Close Sidebar Button -->
        <div class="h-14 px-3.5 border-b border-[#262626] flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-md bg-[#242424] border border-[#333333] flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
            </div>
            <span class="text-xs font-semibold text-[#ffffff] tracking-tight">MPloyChek</span>
          </a>

          <!-- Clear Close Sidebar Button -->
          <button
            type="button"
            (click)="sidebarService.close()"
            class="p-1.5 rounded-md text-[#888885] hover:text-[#ffffff] hover:bg-[#252525] transition-colors cursor-pointer"
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links: Focused on Core Views -->
        <nav class="p-2.5 space-y-1 text-xs">
          <!-- Verification Directory -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-[#262626] text-[#ffffff] font-medium border-[#363636]"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#222222] border border-transparent transition-colors"
          >
            <svg class="w-4 h-4 shrink-0 text-[#888885]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Verification Directory</span>
          </a>

          <!-- System Design -->
          <a
            routerLink="/docs"
            routerLinkActive="bg-[#262626] text-[#ffffff] font-medium border-[#363636]"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#222222] border border-transparent transition-colors"
          >
            <svg class="w-4 h-4 shrink-0 text-[#888885]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>System Design</span>
          </a>

          <!-- Dedicated Telemetry Page -->
          <a
            routerLink="/telemetry"
            routerLinkActive="bg-[#262626] text-[#ffffff] font-medium border-[#363636]"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#222222] border border-transparent transition-colors"
          >
            <svg class="w-4 h-4 shrink-0 text-[#888885]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Telemetry</span>
          </a>

          <!-- User Administration (Admin Only) -->
          @if (authService.isAdmin()) {
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-[#262626] text-[#ffffff] font-medium border-[#363636]"
              class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#222222] border border-transparent transition-colors"
            >
              <svg class="w-4 h-4 shrink-0 text-[#888885]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>User Administration</span>
            </a>
          }
        </nav>
      </div>

      <!-- Bottom: Simple Profile Icon & Button -->
      <div class="p-2.5 border-t border-[#262626]">
        <div class="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#242424] transition-colors">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-md bg-[#2b2b2b] border border-[#383838] flex items-center justify-center text-xs font-semibold text-[#e6e6e5] shrink-0 select-none">
              {{ getUserInitials() }}
            </div>
            <div class="min-w-0 truncate">
              <div class="text-xs font-medium text-[#e6e6e5] truncate leading-tight">
                {{ authService.currentUser()?.name || 'User' }}
              </div>
              <div class="text-[10px] text-[#787774] truncate">
                {{ authService.currentUser()?.role || 'Member' }}
              </div>
            </div>
          </div>

          <!-- Quick Sign Out Button -->
          <button
            type="button"
            (click)="onSignOut()"
            class="p-1.5 rounded-md text-[#787774] hover:text-[#e05757] hover:bg-[#2c2c2c] transition-colors cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onSignOut(): void {
    this.authService.logout();
    this.sidebarService.close();
    this.router.navigate(['/login']);
  }
}
