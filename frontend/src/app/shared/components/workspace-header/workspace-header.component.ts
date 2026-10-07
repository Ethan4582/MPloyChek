import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';
import { DelayService } from '../../../core/services/delay.service';
import { AuthService } from '../../../core/services/auth.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-workspace-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-30 w-full h-14 bg-[#191919]/95 backdrop-blur-md border-b border-[#2a2a2a] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      <!-- Left: Breadcrumbs -->
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-1.5 text-xs text-[#8a8986] truncate select-none">
          <a routerLink="/" class="hover:text-[#ffffff] transition-colors shrink-0">
            MPloyChek
          </a>

          @for (item of breadcrumbs; track item.label) {
            <span class="text-[#555] shrink-0">/</span>
            @if (item.url) {
              <a [routerLink]="item.url" class="hover:text-[#ffffff] transition-colors truncate">
                {{ item.label }}
              </a>
            } @else {
              <span class="text-[#ffffff] font-medium truncate">
                {{ item.label }}
              </span>
            }
          }
        </nav>
      </div>

      <!-- Right: Latency Badge, GitHub Link, Primary Context Action & User Profile Avatar -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        
        <!-- Live Parameterized Delay Badge -->
        <a
          routerLink="/telemetry"
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#222222] border border-[#2f2f2f] text-[#bc8c74] hover:border-[#bc8c74]/50 transition-all cursor-pointer"
          title="Open Backend Telemetry & Latency Engine"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#5cb87a]"></span>
          <span>Delay: {{ delayService.currentDelay() }}ms</span>
        </a>

        <!-- Small GitHub Icon Link -->
        <a
          href="https://github.com/Ethan4582/MPloyChek"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 rounded-md text-[#8a8986] hover:text-[#ffffff] hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-all cursor-pointer"
          title="View Source on GitHub"
          aria-label="GitHub Repository"
        >
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>

        <!-- Contextual Primary Action Button (Optional) -->
        @if (actionLabel) {
          <button
            type="button"
            (click)="onActionClick()"
            [disabled]="isActionLoading"
            class="notion-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>{{ actionLabel }}</span>
          </button>
        }

        <!-- Profile Hover Card (Shadcn-style Hover Card) -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 p-1 rounded-md hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors cursor-pointer select-none"
            title="Profile"
            aria-label="User Profile"
          >
            <div class="w-7 h-7 rounded-md bg-[#2a2a2a] border border-[#383838] flex items-center justify-center text-xs font-semibold text-[#e6e6e5] shadow-xs">
              {{ getUserInitials() }}
            </div>
          </button>

          <!-- Shadcn Popover / Hover Card Content -->
          <div
            class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 delay-75 absolute right-0 top-full pt-1.5 z-50 pointer-events-none group-hover:pointer-events-auto"
          >
            <div class="w-64 rounded-lg bg-[#202020] border border-[#2f2f2f] shadow-xl p-3.5 space-y-3 text-xs">
              
              <!-- Basic Profile Identity -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-md bg-[#292929] border border-[#383838] flex items-center justify-center text-xs font-bold text-[#ffffff] shrink-0">
                  {{ getUserInitials() }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-[#ffffff] truncate">
                    {{ authService.currentUser()?.name || 'User' }}
                  </div>
                  <div class="text-[11px] text-[#8a8986] font-mono truncate">
                    {{ authService.currentUser()?.userId }}
                  </div>
                </div>
              </div>

              <!-- Clearance & Role Tag -->
              <div class="flex items-center justify-between pt-2 border-t border-[#292929] text-[11px]">
                <span class="text-[#787774]">Role</span>
                @if (authService.isAdmin()) {
                  <span class="tag-bronze text-[10px]">Admin</span>
                } @else {
                  <span class="tag-blue text-[10px]">General User</span>
                }
              </div>

              <div class="flex items-center justify-between text-[11px]">
                <span class="text-[#787774]">Status</span>
                <span class="text-[#5cb87a] font-medium">Active</span>
              </div>

              <!-- Sign Out Button -->
              <div class="pt-2 border-t border-[#292929]">
                <button
                  type="button"
                  (click)="onSignOut()"
                  class="w-full py-1.5 px-2.5 rounded-md hover:bg-[#2c2222] text-[#e05757] hover:text-[#ff6b6b] text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

    </header>
  `,
})
export class WorkspaceHeaderComponent {
  sidebarService = inject(SidebarService);
  delayService = inject(DelayService);
  authService = inject(AuthService);
  private router = inject(Router);

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actionLabel: string | null = null;
  @Input() isActionLoading = false;

  @Output() actionClicked = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClicked.emit();
  }

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
    this.router.navigate(['/login']);
  }
}
