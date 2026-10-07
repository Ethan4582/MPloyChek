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
      
      <!-- Left: Notion-Style Sidebar Toggle & Breadcrumbs -->
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Sidebar Toggle Icon (Notion Panel Icon) -->
        <button
          type="button"
          (click)="sidebarService.toggle()"
          class="p-1.5 -ml-1 rounded-md text-[#8a8986] hover:text-[#ffffff] hover:bg-[#252525] transition-colors cursor-pointer"
          [title]="sidebarService.isOpen() ? 'Collapse Sidebar' : 'Expand Sidebar'"
          aria-label="Toggle Sidebar"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 4v16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

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

        <!-- Profile Button Trigger -->
        <button
          type="button"
          (click)="toggleProfileSheet()"
          class="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors cursor-pointer select-none"
          title="Account Profile & Information"
          aria-label="User Profile"
        >
          <div class="w-7 h-7 rounded-md bg-[#2a2a2a] border border-[#383838] flex items-center justify-center text-xs font-semibold text-[#e6e6e5] shadow-xs">
            {{ getUserInitials() }}
          </div>
        </button>

      </div>

    </header>

    <!-- Profile Slide-Over Sheet / Drawer -->
    @if (isProfileSheetOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
        (click)="closeProfileSheet()"
      >
        <div
          class="w-full max-w-sm h-full bg-[#1e1e1e] border-l border-[#2e2e2e] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Sheet Top -->
          <div class="space-y-6">
            
            <!-- Sheet Header -->
            <div class="flex items-center justify-between pb-4 border-b border-[#2d2d2d]">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-[#787774]">Account Profile</span>
              </div>
              <button
                type="button"
                (click)="closeProfileSheet()"
                class="p-1 rounded-md text-[#787774] hover:text-[#ffffff] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                title="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- User Card Overview -->
            <div class="flex items-center gap-3.5 p-3.5 rounded-lg bg-[#252525] border border-[#333333]">
              <div class="w-12 h-12 rounded-lg bg-[#2f2f2f] border border-[#404040] flex items-center justify-center text-sm font-bold text-[#ffffff] shadow-inner shrink-0">
                {{ getUserInitials() }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-[#ffffff] truncate">
                  {{ authService.currentUser()?.name || 'Authorized User' }}
                </h3>
                <p class="text-xs text-[#9b9a97] font-mono truncate">
                  {{ authService.currentUser()?.userId }}
                </p>
                <div class="mt-1.5 flex items-center gap-1.5">
                  @if (authService.isAdmin()) {
                    <span class="tag-bronze text-[10px]">Admin Clearance</span>
                  } @else {
                    <span class="tag-blue text-[10px]">General User</span>
                  }
                  <span class="tag-green text-[10px]">Active</span>
                </div>
              </div>
            </div>

            <!-- Detail Properties Table -->
            <div class="space-y-3 text-xs">
              <div class="text-[11px] font-medium uppercase tracking-wider text-[#787774]">
                Security Clearance & Details
              </div>

              <div class="p-3 rounded-lg bg-[#222222] border border-[#2c2c2c] space-y-2.5">
                <div class="flex items-center justify-between text-xs py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#787774]">Department</span>
                  <span class="font-medium text-[#e6e6e5]">{{ authService.currentUser()?.department || 'Operations' }}</span>
                </div>

                <div class="flex items-center justify-between text-xs py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#787774]">Database Access</span>
                  <span class="font-mono text-[#bc8c74] text-[11px]">
                    {{ authService.isAdmin() ? 'Full Read/Write (Unrestricted)' : 'Row-Level Restrictive' }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-xs py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#787774]">Simulated Latency</span>
                  <span class="font-mono text-[#5cb87a] text-[11px]">{{ delayService.currentDelay() }}ms</span>
                </div>

                <div class="flex items-center justify-between text-xs py-1">
                  <span class="text-[#787774]">Session Status</span>
                  <span class="text-[#529cca] font-medium">Valid JWT</span>
                </div>
              </div>

              <!-- Scope Callout -->
              <div class="p-3 rounded-lg bg-[#242424] border border-[#303030] text-[11px] text-[#9b9a97] leading-relaxed">
                @if (authService.isAdmin()) {
                  <span class="text-[#bc8c74] font-medium">Admin Scope:</span> You have authorization to manage database user records, inspect confidential compensation tiers, and view background check risk scores.
                } @else {
                  <span class="text-[#529cca] font-medium">General Scope:</span> Access is strictly filtered to your candidate records. Sensitive audit notes and compensation data are stripped by backend query projections.
                }
              </div>
            </div>

            <!-- Quick Navigation Shortcuts -->
            <div class="space-y-1.5 text-xs">
              <div class="text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                Quick Shortcuts
              </div>

              <a
                routerLink="/dashboard"
                (click)="closeProfileSheet()"
                class="flex items-center justify-between p-2 rounded-md hover:bg-[#282828] text-[#9b9a97] hover:text-[#ffffff] transition-colors"
              >
                <span>Verification Directory</span>
                <span class="text-[#555]">→</span>
              </a>

              <a
                routerLink="/docs"
                (click)="closeProfileSheet()"
                class="flex items-center justify-between p-2 rounded-md hover:bg-[#282828] text-[#9b9a97] hover:text-[#ffffff] transition-colors"
              >
                <span>System Design Specification</span>
                <span class="text-[#555]">→</span>
              </a>

              <a
                routerLink="/creator"
                (click)="closeProfileSheet()"
                class="flex items-center justify-between p-2 rounded-md hover:bg-[#282828] text-[#9b9a97] hover:text-[#ffffff] transition-colors"
              >
                <span>Creator Profile & Socials</span>
                <span class="text-[#bc8c74]">★</span>
              </a>

              @if (authService.isAdmin()) {
                <a
                  routerLink="/admin/users"
                  (click)="closeProfileSheet()"
                  class="flex items-center justify-between p-2 rounded-md hover:bg-[#282828] text-[#9b9a97] hover:text-[#ffffff] transition-colors"
                >
                  <span>User Administration</span>
                  <span class="text-[#555]">→</span>
                </a>
              }
            </div>

          </div>

          <!-- Sheet Bottom: Sign Out Action -->
          <div class="pt-4 border-t border-[#2d2d2d] space-y-2">
            <button
              type="button"
              (click)="onSignOut()"
              class="w-full py-2 px-3 rounded-md bg-[#2c2222] border border-[#4a2828] text-[#e05757] hover:bg-[#382626] text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out of Workspace</span>
            </button>
          </div>

        </div>
      </div>
    }
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

  isProfileSheetOpen = signal<boolean>(false);

  onActionClick(): void {
    this.actionClicked.emit();
  }

  toggleProfileSheet(): void {
    this.isProfileSheetOpen.update((v) => !v);
  }

  closeProfileSheet(): void {
    this.isProfileSheetOpen.set(false);
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
    this.closeProfileSheet();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
