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
      <div class="max-w-2xl mx-auto pointer-events-auto bg-[#202020]/95 backdrop-blur-md border border-[#2f2f2f] rounded-lg shadow-lg px-3.5 py-2 flex items-center justify-between gap-4 text-xs transition-all">
        
        <!-- Left: Clean Logo -->
        <a routerLink="/" class="flex items-center group shrink-0" title="MPloyChek">
          <div class="w-7 h-7 rounded-md bg-[#242424] border border-[#383838] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#bc8c74]/60 shadow-inner">
            <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
          </div>
        </a>

        <!-- Middle: Concise Nav Links -->
        <nav class="flex items-center gap-4 sm:gap-6 text-xs text-[#9b9a97]">
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

          <a
            routerLink="/creator"
            routerLinkActive="text-[#ffffff] font-medium"
            class="hover:text-[#ffffff] transition-colors"
          >
            Creator
          </a>
        </nav>

        <!-- Right: Actions & GitHub -->
        <div class="flex items-center gap-2.5 shrink-0">
          <!-- GitHub Repo Link -->
          <a
            href="https://github.com/Ethan4582/MPloyChek"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-md text-[#888885] hover:text-[#ffffff] hover:bg-[#282828] transition-colors"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>

          @if (authService.isAuthenticated()) {
            <div class="relative" #menuContainer>
              <button
                type="button"
                (click)="toggleMenu()"
                class="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors cursor-pointer"
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
                    routerLink="/creator"
                    (click)="isMenuOpen.set(false)"
                    class="block px-2.5 py-1.5 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#2e2e2e] transition-colors"
                  >
                    Creator Profile
                  </a>

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
                    class="w-full text-left px-2.5 py-1.5 rounded text-[#e05757] hover:bg-[#3b2222]/40 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/login"
              class="notion-btn-primary text-xs py-1 px-3"
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
