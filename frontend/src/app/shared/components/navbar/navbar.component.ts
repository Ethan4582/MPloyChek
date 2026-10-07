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
          <div class="w-7 h-7 rounded-md bg-[#242424] border border-[#383838] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#bc8c74]/60 shadow-inner">
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
              Workspace
            </a>
          } @else {
            <a
              routerLink="/"
              fragment="preview"
              class="hover:text-[#ffffff] transition-colors"
            >
              Features
            </a>
          }

          <a
            routerLink="/docs"
            routerLinkActive="text-[#ffffff] font-medium"
            class="hover:text-[#ffffff] transition-colors"
          >
            System Design
          </a>
        </nav>

        <!-- Right: Dashboard CTA / Profile -->
        <div class="flex items-center gap-3 shrink-0">
          @if (authService.isAuthenticated()) {
            <div class="relative" #menuContainer>
              <button
                type="button"
                (click)="toggleMenu()"
                class="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors"
              >
                <span class="text-xs text-[#e6e6e5] font-medium max-w-[100px] truncate hidden sm:inline">
                  {{ authService.currentUser()?.name?.split(' ')?.[0] }}
                </span>
                <div class="w-6 h-6 rounded-md bg-[#2a2a2a] border border-[#383838] flex items-center justify-center text-[10px] font-semibold text-[#e6e6e5]">
                  {{ getUserInitials() }}
                </div>
              </button>

              <!-- Profile Dropdown Menu -->
              @if (isMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div class="px-2.5 py-2 border-b border-[#2e2e2e] mb-1">
                    <p class="font-medium text-[#ffffff] truncate">{{ authService.currentUser()?.name }}</p>
                    <p class="text-[11px] text-[#8a8986] truncate font-mono mt-0.5">{{ authService.currentUser()?.userId }}</p>
                    <div class="mt-1.5 flex items-center gap-1.5">
                      @if (authService.isAdmin()) {
                        <span class="tag-bronze text-[10px]">Admin Clearance</span>
                      } @else {
                        <span class="tag-blue text-[10px]">General User</span>
                      }
                    </div>
                  </div>

                  <a
                    routerLink="/dashboard"
                    (click)="isMenuOpen.set(false)"
                    class="block px-2.5 py-1.5 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#2e2e2e] transition-colors"
                  >
                    Open Workspace
                  </a>

                  @if (authService.isAdmin()) {
                    <a
                      routerLink="/admin/users"
                      (click)="isMenuOpen.set(false)"
                      class="block px-2.5 py-1.5 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#2e2e2e] transition-colors"
                    >
                      User Management
                    </a>
                  }

                  <a
                    routerLink="/docs"
                    (click)="isMenuOpen.set(false)"
                    class="block px-2.5 py-1.5 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#2e2e2e] transition-colors"
                  >
                    Architecture Docs
                  </a>

                  <div class="h-px bg-[#2e2e2e] my-1"></div>

                  <button
                    type="button"
                    (click)="onSignOut()"
                    class="w-full text-left px-2.5 py-1.5 rounded text-[#e05757] hover:bg-[#3b2222]/40 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/login"
              class="notion-btn-primary text-xs py-1.5 px-3"
            >
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
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isMenuOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
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
    this.isMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
