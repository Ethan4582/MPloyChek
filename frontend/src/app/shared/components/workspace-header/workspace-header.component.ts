import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { SidebarService } from '../../../core/services/sidebar.service';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  url?: string;
}

@Component({
  selector: 'app-workspace-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-12 border-b border-[#252525] bg-[#191919] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      
      <!-- Left: Sidebar Toggle Button & Breadcrumb Navigation -->
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Sidebar Toggle Icon Button (Always accessible to toggle or re-open sidebar) -->
        @if (authService.isAuthenticated()) {
          <button
            type="button"
            (click)="sidebarService.toggle()"
            class="p-1.5 rounded-md text-[#8a8986] hover:text-[#ffffff] hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors cursor-pointer shrink-0"
            [title]="sidebarService.isOpen() ? 'Collapse Sidebar' : 'Open Sidebar'"
            [attr.aria-label]="sidebarService.isOpen() ? 'Collapse Sidebar' : 'Open Sidebar'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 4v16" stroke-linecap="round" stroke-linejoin="round" />
              @if (!sidebarService.isOpen()) {
                <path d="M14 9l3 3-3 3" stroke-linecap="round" stroke-linejoin="round" />
              } @else {
                <path d="M16 9l-3 3 3 3" stroke-linecap="round" stroke-linejoin="round" />
              }
            </svg>
          </button>
        }

        <nav class="flex items-center gap-1.5 text-xs font-mono text-[#8a8986] overflow-hidden whitespace-nowrap">
          <span class="text-[#555552]">MPloyChek</span>
          <span class="text-[#3c3c3c]">/</span>
          @for (item of breadcrumbs; track item.label; let last = $last) {
            @if ((item.link || item.url) && !last) {
              <a [routerLink]="item.link || item.url" class="hover:text-[#ffffff] transition-colors truncate">
                {{ item.label }}
              </a>
              <span class="text-[#3c3c3c]">/</span>
            } @else {
              <span [ngClass]="last ? 'text-[#ffffff] font-medium' : 'text-[#8a8986]'" class="truncate">
                {{ item.label }}
              </span>
              @if (!last) {
                <span class="text-[#3c3c3c]">/</span>
              }
            }
          }
        </nav>
      </div>

      <!-- Right: Action Badge & Tools -->
      <div class="flex items-center gap-3">
        
        <!-- Live Parameterized Delay Badge -->
        <a
          routerLink="/telemetry"
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#222222] border border-[#2f2f2f] text-[#bc8c74] hover:border-[#bc8c74]/50 transition-all cursor-pointer"
          title="Open Backend Telemetry & Latency Engine"
        >
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
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        <!-- Optional Primary Action Button -->
        @if (actionLabel) {
          <button
            type="button"
            (click)="actionClicked.emit()"
            [disabled]="isActionLoading"
            class="notion-btn-primary text-xs py-1 px-3 font-normal"
          >
            {{ isActionLoading ? 'Loading...' : actionLabel }}
          </button>
        }

        <!-- Lightweight Shadcn-style Profile Hover Card (No Sheet Drawer) -->
        <div 
          class="relative group"
          (mouseenter)="isProfileHovered.set(true)"
          (mouseleave)="isProfileHovered.set(false)"
        >
          <!-- Trigger Avatar -->
          <button
            type="button"
            class="w-7 h-7 rounded-md bg-[#252525] border border-[#333333] flex items-center justify-center text-[11px] font-bold text-[#ffffff] hover:border-[#4f4f4f] transition-all cursor-pointer"
            [title]="authService.currentUser()?.name || 'Account'"
            aria-label="User Account"
          >
            {{ getUserInitials() }}
          </button>

          <!-- Hover Card Popover -->
          @if (isProfileHovered()) {
            <div 
              class="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              (mouseenter)="isProfileHovered.set(true)"
              (mouseleave)="isProfileHovered.set(false)"
            >
              <div class="w-64 p-3 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e] shadow-xl text-left space-y-2.5">
                
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
                    class="w-full text-left px-2 py-1.5 rounded text-xs text-[#e05757] hover:bg-[#2b1f1f] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Log Out</span>
                    <span>&rarr;</span>
                  </button>
                </div>

              </div>
            </div>
          }
        </div>

      </div>

    </header>
  `,
})
export class WorkspaceHeaderComponent {
  authService = inject(AuthService);
  delayService = inject(DelayService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actionLabel?: string | null;
  @Input() isActionLoading = false;
  @Output() actionClicked = new EventEmitter<void>();

  isProfileHovered = signal<boolean>(false);

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onSignOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
