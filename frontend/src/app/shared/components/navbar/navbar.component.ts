import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 w-full pt-3 sm:pt-4 px-4 pointer-events-none">
      <div class="max-w-xl mx-auto pointer-events-auto bg-[#202020]/95 backdrop-blur-md border border-[#2f2f2f] rounded-lg shadow-lg px-3.5 py-2 flex items-center justify-between gap-4 text-xs transition-all">
        
        <!-- Left: Clean Logo -->
        <a routerLink="/" class="flex items-center group shrink-0" title="MPloyChek">
          <div class="w-7 h-7 rounded-md bg-[#242424] border border-[#383838] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#529cca]/60 shadow-inner">
            <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
          </div>
        </a>

        <!-- Middle: Concise Nav Links -->
        <nav class="flex items-center gap-5 sm:gap-6 text-xs text-[#9b9a97]">
          @if (authService.isAuthenticated()) {
            <a
              routerLink="/dashboard"
              routerLinkActive="text-[#ffffff] font-medium"
              class="hover:text-[#ffffff] transition-colors"
            >
              Records
            </a>

            @if (authService.isAdmin()) {
              <a
                routerLink="/admin/users"
                routerLinkActive="text-[#ffffff] font-medium"
                class="hover:text-[#ffffff] transition-colors"
              >
                Users
              </a>
            }
          } @else {
            <a
              href="#preview"
              class="hover:text-[#ffffff] transition-colors"
            >
              Features
            </a>
          }

          <a
            href="https://github.com/Ethan4582/MPloyChek/blob/master/system-design.md"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[#ffffff] transition-colors"
          >
            Docs
          </a>
        </nav>

        <!-- Right: Dashboard CTA / Profile -->
        <div class="flex items-center shrink-0">
          @if (authService.isAuthenticated()) {
            <div
              class="relative"
              (mouseenter)="onProfileMouseEnter()"
              (mouseleave)="onProfileMouseLeave()"
            >
              <!-- Minimal Square Profile Icon (matches theme rounded-md) -->
              <button
                type="button"
                (click)="toggleProfileMenu()"
                class="relative flex items-center justify-center w-7 h-7 rounded-md border border-[#333333] bg-[#242424] hover:bg-[#2e2e2e] hover:border-[#444444] transition-all focus:outline-none"
                [attr.aria-expanded]="isProfileOpen()"
                title="Account menu"
              >
                <span class="text-xs font-semibold text-[#e6e6e5] select-none tracking-tight">
                  {{ getUserInitials() }}
                </span>
                
                @if (authService.isAdmin()) {
                  <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-xs bg-[#bc8c74]" title="Administrator"></span>
                }
              </button>

              <!-- Profile Popover Dropdown -->
              @if (isProfileOpen()) {
                <div class="absolute right-0 top-full h-2 w-full"></div>

                <div
                  class="absolute right-0 mt-2 w-64 bg-[#212121] border border-[#333333] rounded-lg shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  (mouseenter)="onProfileMouseEnter()"
                  (mouseleave)="onProfileMouseLeave()"
                >
                  <div class="px-3 py-2.5 border-b border-[#2d2d2d] flex items-start gap-2.5">
                    <div class="w-8 h-8 rounded-md bg-[#2b2b2b] border border-[#383838] flex items-center justify-center text-xs font-semibold text-[#ffffff] shrink-0 mt-0.5">
                      {{ getUserInitials() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-semibold text-[#ffffff] truncate">
                        {{ authService.currentUser()?.name }}
                      </div>
                      <div class="text-[11px] text-[#787774] font-mono truncate">
                        {{ authService.currentUser()?.userId }}
                      </div>
                      <div class="mt-1">
                        @if (authService.isAdmin()) {
                          <span class="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[#2d241e] text-[#bc8c74] border border-[#48372f]">
                            Administrator
                          </span>
                        } @else {
                          <span class="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[#1c2e3d] text-[#9fcbf0] border border-[#2b4d68]">
                            General User
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="px-3 py-2 text-[11px] text-[#9b9a97] space-y-1 border-b border-[#2d2d2d] bg-[#1a1a1a]/50 rounded my-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[#787774]">Department</span>
                      <span class="text-[#e6e6e5] font-medium">{{ authService.currentUser()?.department }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-[#787774]">Status</span>
                      <span class="text-[#4dab7e] font-medium">Active</span>
                    </div>
                  </div>

                  <div class="py-1 space-y-0.5">
                    @if (authService.isAdmin()) {
                      <button
                        type="button"
                        (click)="navigateTo('/admin/users')"
                        class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left hover:bg-[#2a2a2a] text-[#e6e6e5] transition-colors"
                      >
                        <div>
                          <div class="font-medium text-xs">User Management</div>
                          <p class="text-[10px] text-[#787774]">Admin accounts & permissions</p>
                        </div>
                        <span class="text-[10px] text-[#bc8c74] bg-[#2d241e] px-1.5 py-0.5 rounded">Admin</span>
                      </button>
                    }

                    <button
                      type="button"
                      (click)="navigateTo('/dashboard')"
                      class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left hover:bg-[#2a2a2a] text-[#e6e6e5] transition-colors"
                    >
                      <div>
                        <div class="font-medium text-xs">Records Directory</div>
                        <p class="text-[10px] text-[#787774]">Verification screening list</p>
                      </div>
                    </button>
                  </div>

                  <div class="h-[1px] bg-[#2d2d2d] my-1"></div>

                  <div class="pt-0.5">
                    <button
                      type="button"
                      (click)="logout()"
                      class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-left text-[#9b9a97] hover:text-[#e05757] hover:bg-[#2b1f1f] transition-colors"
                    >
                      <svg class="w-3.5 h-3.5 text-[#9b9a97]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span class="font-medium">Sign out</span>
                    </button>
                  </div>

                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/login"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#ffffff] bg-[#ea580c] hover:bg-[#f97316] active:bg-[#c2410c] transition-all shadow-sm"
            >
              <span>Dashboard</span>
              <span class="text-xs">&rarr;</span>
            </a>
          }
        </div>

      </div>
    </header>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isProfileOpen = signal<boolean>(false);
  private leaveTimeout: any = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isProfileOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileOpen.update((v) => !v);
  }

  onProfileMouseEnter(): void {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    this.isProfileOpen.set(true);
  }

  onProfileMouseLeave(): void {
    this.leaveTimeout = setTimeout(() => {
      this.isProfileOpen.set(false);
    }, 180);
  }

  navigateTo(path: string): void {
    this.isProfileOpen.set(false);
    this.router.navigate([path]);
  }

  logout(): void {
    this.isProfileOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'MP';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }
}
