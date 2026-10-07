import { Component, inject, signal, ElementRef } from '@angular/core';
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
          <a
            href="https://github.com/Ethan4582/MPloyChek"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[#ffffff] transition-colors"
          >
            GitHub
          </a>
          <a
            routerLink="/docs"
            routerLinkActive="text-[#ffffff] font-medium"
            class="hover:text-[#ffffff] transition-colors"
          >
            Docs
          </a>
        </nav>

        <!-- Right: Actions & GitHub -->
        <div class="flex items-center gap-2.5 shrink-0">
          <!-- GitHub Repo Link -->
      
          @if (authService.isAuthenticated()) {
            <!-- Shadcn-style Profile Hover Card -->
            <div class="relative group">
              <button
                type="button"
                class="flex items-center gap-1.5 p-1 pl-1.5 rounded-md hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-colors cursor-pointer select-none"
              >
                <div class="w-6 h-6 rounded-md bg-[#2a2a2a] border border-[#383838] flex items-center justify-center text-[10px] font-semibold text-[#e6e6e5]">
                  {{ getUserInitials() }}
                </div>
              </button>

              <!-- Hover Card Popover -->
              <div
                class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 delay-75 absolute right-0 top-full pt-1.5 z-50 pointer-events-none group-hover:pointer-events-auto"
              >
                <div class="w-60 rounded-lg bg-[#202020] border border-[#2f2f2f] shadow-xl p-3 space-y-2.5 text-xs">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-md bg-[#292929] border border-[#383838] flex items-center justify-center text-xs font-bold text-[#ffffff] shrink-0">
                      {{ getUserInitials() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-[#ffffff] truncate">
                        {{ authService.currentUser()?.name }}
                      </div>
                      <div class="text-[11px] text-[#8a8986] font-mono truncate">
                        {{ authService.currentUser()?.userId }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-[#292929] text-[11px]">
                    <span class="text-[#787774]">Role</span>
                    @if (authService.isAdmin()) {
                      <span class="tag-bronze text-[10px]">Admin</span>
                    } @else {
                      <span class="tag-blue text-[10px]">General User</span>
                    }
                  </div>

                  <div class="pt-2 border-t border-[#292929]">
                    <button
                      type="button"
                      (click)="onSignOut()"
                      class="w-full py-1.5 px-2 rounded-md hover:bg-[#2c2222] text-[#e05757] hover:text-[#ff6b6b] text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <a
              routerLink="/login"
              class="notion-btn-primary px-3 py-1 text-xs font-medium"
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
